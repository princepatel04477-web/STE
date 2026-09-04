import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { isRegisteredExhibitor } from '@/data/registeredExhibitors';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

interface SheetExhibitorRow {
  mobile: string;
  brand_name?: string;
  stall_sqft?: string;
  fascia_name_1?: string;
  fascia_name_2?: string;
  fascia_name_3?: string;
  fascia_name_4?: string;
  fascia_names?: string[];
  notes?: string;
  category?: string;
  market?: string;
}

/**
 * The secret the Apps Script must present. Without one configured the endpoint
 * refuses everything: it rewrites exhibitor rows, and it used to accept any
 * request that reached the URL.
 */
function isAuthorized(request: Request): boolean {
  const expected = process.env.SHEETS_WEBHOOK_SECRET?.trim();
  if (!expected) return false;

  const header = request.headers.get('x-webhook-secret')?.trim();
  if (header && header === expected) return true;

  const auth = request.headers.get('authorization')?.trim() || '';
  return auth.toLowerCase().startsWith('bearer ') && auth.slice(7).trim() === expected;
}

export async function POST(request: Request) {
  try {
    if (!isAuthorized(request)) {
      console.warn('[GoogleSheetsWebhook] Refused an unauthenticated sync request.');
      return NextResponse.json(
        { error: 'Unauthorized. A valid webhook secret is required.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    let rows: SheetExhibitorRow[] = [];

    if (Array.isArray(body)) {
      rows = body;
    } else if (Array.isArray(body.exhibitors)) {
      rows = body.exhibitors;
    } else if (body.mobile) {
      rows = [body];
    } else {
      return NextResponse.json({ error: 'Invalid payload format. Expected exhibitor row or array.' }, { status: 400 });
    }

    const updatedAllowed: any[] = [];
    const updatedExhibitors: any[] = [];
    const rejected: string[] = [];

    for (const row of rows) {
      if (!row.mobile) continue;
      const cleanMobile = String(row.mobile).replace(/\D/g, '').slice(-10);
      if (cleanMobile.length !== 10) continue;

      // This endpoint is unauthenticated, and it used to whitelist whatever
      // number it was handed. It may now only refresh the details of exhibitors
      // already on the master sheet - it can no longer enrol anyone.
      if (!isRegisteredExhibitor(cleanMobile)) {
        rejected.push(cleanMobile);
        continue;
      }

      const brandName = row.brand_name?.trim() || '';
      const stallSqft = row.stall_sqft?.trim() || '200 sq ft';

      let fasciaNames = ['', '', '', ''];
      if (Array.isArray(row.fascia_names)) {
        fasciaNames = [
          row.fascia_names[0] || '',
          row.fascia_names[1] || '',
          row.fascia_names[2] || '',
          row.fascia_names[3] || ''
        ];
      } else {
        fasciaNames = [
          row.fascia_name_1 || brandName,
          row.fascia_name_2 || '',
          row.fascia_name_3 || '',
          row.fascia_name_4 || ''
        ];
      }

      // 1. Update Local DB
      try {
        db.prepare('INSERT INTO allowed_exhibitors (mobile) VALUES (?)').run(cleanMobile);
      } catch {}

      try {
        // brand_name and stall_sqft only where the sheet actually gave one -
        // a blank cell is not an instruction to erase what is on record.
        if (brandName) {
          db.prepare('UPDATE exhibitors SET brand_name = ?, stall_sqft = ?, fascia_names_json = ? WHERE mobile = ?')
            .run(brandName, stallSqft, JSON.stringify(fasciaNames), cleanMobile);
        } else {
          db.prepare('UPDATE exhibitors SET stall_sqft = ?, fascia_names_json = ? WHERE mobile = ?')
            .run(stallSqft, JSON.stringify(fasciaNames), cleanMobile);
        }
      } catch {}

      updatedAllowed.push({
        mobile: cleanMobile,
        notes: brandName ? `${brandName} (${stallSqft})` : 'From Google Sheets',
        created_at: new Date().toISOString()
      });

      updatedExhibitors.push({
        mobile: cleanMobile,
        brand_name: brandName,
        stall_sqft: stallSqft,
        fasciaNames,
        updated_at: new Date().toISOString()
      });
    }

    // 2. Sync to Supabase in bulk
    if (isSupabaseConfigured && supabaseAdmin) {
      if (updatedAllowed.length > 0) {
        await supabaseAdmin
          .from('allowed_exhibitors')
          .upsert(updatedAllowed, { onConflict: 'mobile' });
      }

      if (updatedExhibitors.length > 0) {
        // fascia_names_json also carries the exhibitor's own name, company
        // description, GSTIN and profile photo. Writing a bare array of
        // fascia names over it - which is what this used to do - erased all
        // four for every row the sheet touched. Read each row first and merge
        // the names into what is already stored.
        const mobiles = updatedExhibitors.map((e) => e.mobile);
        const { data: existingRows, error: readErr } = await supabaseAdmin
          .from('exhibitors')
          .select('mobile, fascia_names_json')
          .in('mobile', mobiles);

        if (readErr) {
          console.error('[GoogleSheetsWebhook] Could not read current rows:', readErr.message);
          return NextResponse.json(
            { error: 'Could not read the exhibitor rows, so nothing was changed.' },
            { status: 503 }
          );
        }

        const storedByMobile = new Map(
          (existingRows || []).map((row) => [row.mobile, row.fascia_names_json])
        );

        const merged = updatedExhibitors.map(({ fasciaNames, ...row }) => {
          const stored = storedByMobile.get(row.mobile);
          const base =
            stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
          return { ...row, fascia_names_json: { ...base, fascia_names: fasciaNames } };
        });

        const { error: writeErr } = await supabaseAdmin
          .from('exhibitors')
          .upsert(merged, { onConflict: 'mobile' });

        if (writeErr) {
          console.error('[GoogleSheetsWebhook] Exhibitor upsert failed:', writeErr.message);
          return NextResponse.json({ error: writeErr.message }, { status: 500 });
        }
      }
    }

    return NextResponse.json({
      success: true,
      count: updatedAllowed.length,
      rejected,
      message: `Synchronized ${updatedAllowed.length} registered exhibitor(s) from Google Sheets to Supabase.`
        + (rejected.length
            ? ` Ignored ${rejected.length} number(s) that are not on the master exhibitor list.`
            : '')
    });
  } catch (error: any) {
    console.error('[GoogleSheetsWebhook] Sync error:', error);
    return NextResponse.json({ error: 'Failed to process Google Sheets sync webhook.' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    endpoint: '/api/webhooks/google-sheets',
    description: 'Incoming webhook to sync Google Sheets updates to Supabase database in real-time.'
  });
}
