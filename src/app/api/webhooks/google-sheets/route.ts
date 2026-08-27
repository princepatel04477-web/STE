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

export async function POST(request: Request) {
  try {
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
        db.prepare('UPDATE exhibitors SET brand_name = ?, stall_sqft = ?, fascia_names_json = ? WHERE mobile = ?')
          .run(brandName, stallSqft, JSON.stringify(fasciaNames), cleanMobile);
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
        fascia_names_json: fasciaNames,
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
        await supabaseAdmin
          .from('exhibitors')
          .upsert(updatedExhibitors, { onConflict: 'mobile' });
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
