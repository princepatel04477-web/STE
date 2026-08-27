import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthenticatedExhibitor } from '@/lib/auth';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { syncExhibitorRowToSheets } from '@/lib/googleSheets';

// The write touches Supabase and then the Google Sheet; the platform default is
// tight enough that a slow Apps Script can abort a request whose data was
// already saved, which the portal then reports as a failed save.
export const maxDuration = 30;

export async function GET() {
  try {
    const session = await getAuthenticatedExhibitor();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const products = db
      .prepare('SELECT id, name, category, description, unit, rate_inr, icon_name FROM extra_products WHERE is_active = 1')
      .all();

    let order = db
      .prepare('SELECT items_json, special_notes, owner_badges, sales_badges, support_badges, badge_names_json, rental_days, updated_at FROM exhibitor_orders WHERE mobile = ?')
      .get(session.mobile) as { items_json: string | any; special_notes: string; owner_badges?: number; sales_badges?: number; support_badges?: number; badge_names_json?: string | any; rental_days?: number; updated_at: string } | undefined;

    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data: sbOrder } = await supabaseAdmin
          .from('exhibitor_orders')
          .select('*')
          .eq('mobile', session.mobile)
          .maybeSingle();

        if (sbOrder) {
          order = {
            ...order,
            items_json: sbOrder.items_json,
            special_notes: sbOrder.special_notes ?? order?.special_notes ?? '',
            owner_badges: sbOrder.owner_badges ?? order?.owner_badges ?? 0,
            sales_badges: sbOrder.sales_badges ?? order?.sales_badges ?? 0,
            support_badges: sbOrder.support_badges ?? order?.support_badges ?? 0,
            badge_names_json: sbOrder.badge_names_json ?? order?.badge_names_json,
            rental_days: sbOrder.rental_days ?? order?.rental_days ?? 2,
            updated_at: sbOrder.updated_at || order?.updated_at || null
          };
        }
      } catch (err) {
        console.warn('[Extras GET] Supabase fetch fallback to local:', err);
      }
    }

    let items = [];
    if (order && order.items_json) {
      try {
        items = typeof order.items_json === 'string' ? JSON.parse(order.items_json) : order.items_json;
      } catch {
        items = [];
      }
    }

    let badgeNames = { owner: [] as string[], sales: [] as string[], support: [] as string[] };
    if (order && order.badge_names_json) {
      try {
        badgeNames = typeof order.badge_names_json === 'string' ? JSON.parse(order.badge_names_json) : order.badge_names_json;
      } catch {}
    }

    return NextResponse.json({
      products,
      existingOrder: {
        items,
        special_notes: order?.special_notes || '',
        owner_badges: order?.owner_badges ?? 0,
        sales_badges: order?.sales_badges ?? 0,
        support_badges: order?.support_badges ?? 0,
        badge_names: badgeNames,
        rental_days: order?.rental_days ?? 2,
        updated_at: order?.updated_at || null
      }
    });
  } catch (error) {
    console.error('Error fetching extras catalog:', error);
    return NextResponse.json({ error: 'Failed to fetch catalog.' }, { status: 500 });
  }
}

/**
 * The exhibitor's own name as already stored. Supabase keeps it inside the
 * structured fascia payload; the local store keeps it in its own column.
 */
async function lookupStoredExhibitorName(mobile: string): Promise<string> {
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { data: sbProfile } = await supabaseAdmin
        .from('exhibitors')
        .select('fascia_names_json')
        .eq('mobile', mobile)
        .maybeSingle();

      const rawPayload = sbProfile?.fascia_names_json;
      if (rawPayload) {
        const parsed = typeof rawPayload === 'string' ? JSON.parse(rawPayload) : rawPayload;
        if (parsed && !Array.isArray(parsed) && typeof parsed === 'object' && parsed.exhibitor_name) {
          return String(parsed.exhibitor_name).trim();
        }
      }
    } catch (err) {
      console.warn('[Extras POST] Name lookup fell back to local store:', err);
    }
  }

  const local = db
    .prepare('SELECT exhibitor_name FROM exhibitors WHERE mobile = ?')
    .get(mobile) as { exhibitor_name?: string } | undefined;

  return (local?.exhibitor_name || '').trim();
}

export async function POST(request: Request) {
  try {
    const session = await getAuthenticatedExhibitor();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { items, special_notes, owner_badges, sales_badges, support_badges, badge_names, rental_days, days } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid items payload' }, { status: 400 });
    }

    // An order nobody is named against cannot be acted on at the venue, so the
    // exhibitor's own name is compulsory. Take it from the request, and fall
    // back to the profile already on record.
    let contactName = typeof body.exhibitor_name === 'string' ? body.exhibitor_name.trim() : '';
    if (!contactName) {
      contactName = await lookupStoredExhibitorName(session.mobile);
    }
    if (!contactName) {
      return NextResponse.json(
        { error: 'Your name is required before submitting your requirements.' },
        { status: 400 }
      );
    }

    const itemsJson = JSON.stringify(items);
    const cleanNotes = typeof special_notes === 'string' ? special_notes.trim() : '';

    const oBadges = Math.min(5, Math.max(0, Number(owner_badges || 0)));
    const sBadges = Math.min(5, Math.max(0, Number(sales_badges || 0)));
    const supBadges = Math.min(5, Math.max(0, Number(support_badges || 0)));

    // Validate compulsory badge names
    if (oBadges > 0) {
      const oNames = Array.isArray(badge_names?.owner) ? badge_names.owner : [];
      for (let i = 0; i < oBadges; i++) {
        if (!oNames[i] || !oNames[i].trim()) {
          return NextResponse.json({ error: `Owner Badge #${i + 1} name is compulsory.` }, { status: 400 });
        }
      }
    }
    if (sBadges > 0) {
      const sNames = Array.isArray(badge_names?.sales) ? badge_names.sales : [];
      for (let i = 0; i < sBadges; i++) {
        if (!sNames[i] || !sNames[i].trim()) {
          return NextResponse.json({ error: `Sales Staff Badge #${i + 1} name is compulsory.` }, { status: 400 });
        }
      }
    }
    if (supBadges > 0) {
      const supNames = Array.isArray(badge_names?.support) ? badge_names.support : [];
      for (let i = 0; i < supBadges; i++) {
        if (!supNames[i] || !supNames[i].trim()) {
          return NextResponse.json({ error: `Support Staff Badge #${i + 1} name is compulsory.` }, { status: 400 });
        }
      }
    }

    const badgeNamesJson = badge_names ? JSON.stringify(badge_names) : '';
    const rDays = Math.max(1, Math.min(30, Number(rental_days || days || 2)));

    const existing = db
      .prepare('SELECT id FROM exhibitor_orders WHERE mobile = ?')
      .get(session.mobile);

    if (existing) {
      db.prepare(
        'UPDATE exhibitor_orders SET items_json = ?, special_notes = ?, owner_badges = ?, sales_badges = ?, support_badges = ?, badge_names_json = ?, rental_days = ? WHERE mobile = ?'
      ).run(itemsJson, cleanNotes, oBadges, sBadges, supBadges, badgeNamesJson, rDays, session.mobile);
    } else {
      db.prepare(
        'INSERT INTO exhibitor_orders (mobile, items_json, special_notes, owner_badges, sales_badges, support_badges, badge_names_json, rental_days) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(session.mobile, itemsJson, cleanNotes, oBadges, sBadges, supBadges, badgeNamesJson, rDays);
    }

    // Direct cloud sync to Supabase Database
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { error: sbErr } = await supabaseAdmin
          .from('exhibitor_orders')
          .upsert({
            mobile: session.mobile,
            items_json: items,
            special_notes: cleanNotes,
            owner_badges: oBadges,
            sales_badges: sBadges,
            support_badges: supBadges,
            badge_names_json: badge_names || {},
            rental_days: rDays,
            updated_at: new Date().toISOString()
          }, { onConflict: 'mobile' });

        if (sbErr) {
          console.error('[SupabaseDB] Order upsert error:', sbErr.message);
          return NextResponse.json({ error: `Failed to persist order to cloud database: ${sbErr.message}` }, { status: 500 });
        }
      } catch (err: any) {
        console.error('[SupabaseDB] Order sync exception:', err);
        return NextResponse.json({ error: `Database persistence error: ${err?.message || 'Unknown error'}` }, { status: 500 });
      }
    }

    // Push the exhibitor's COMPLETE row to the sheet — the order together with
    // the profile, fascia names and artwork links. Sending only the order
    // fields blanked the uploaded logo and Drive links in the sheet.
    try {
      await syncExhibitorRowToSheets(session.mobile, {
        exhibitor_name: contactName,
        items,
        special_notes: cleanNotes,
        owner_badges: oBadges,
        sales_badges: sBadges,
        support_badges: supBadges,
        badge_names: badge_names || undefined,
        rental_days: rDays
      });
    } catch (err) {
      console.error('Google Sheets sync error:', err);
    }

    return NextResponse.json({
      success: true,
      message: 'Extras requirements submitted successfully.'
    });
  } catch (error) {
    console.error('Error saving extras order:', error);
    return NextResponse.json({ error: 'Failed to save order.' }, { status: 500 });
  }
}
