import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthenticatedExhibitor } from '@/lib/auth';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { syncExhibitorRowToSheets } from '@/lib/googleSheets';
import { checkGstin, normalizeGstin, verifyGstinWithPortal } from '@/lib/gstin';

// The write touches Supabase and then the Google Sheet; the platform default is
// tight enough that a slow Apps Script can abort a request whose data was
// already saved, which the portal then reports as a failed save.
export const maxDuration = 30;

export async function GET(request: Request) {
  try {
    const session = await getAuthenticatedExhibitor(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const products = db
      .prepare('SELECT id, name, category, description, unit, rate_inr, icon_name FROM extra_products WHERE is_active = 1')
      .all();

    let order = db
      .prepare('SELECT items_json, special_notes, rental_days, updated_at FROM exhibitor_orders WHERE mobile = ?')
      .get(session.mobile) as { items_json: string | any; special_notes: string; rental_days?: number; updated_at: string } | undefined;

    if (isSupabaseConfigured && supabaseAdmin) {
      // A read that failed must never reach the portal as an empty basket.
      // The local store is a /tmp cache that a cold instance starts empty, so
      // falling back to it would show an exhibitor no extras - and the
      // dashboard would then autosave that empty basket straight over the
      // order they had already placed. Say so instead and let it retry.
      const { data: sbOrder, error: sbReadErr } = await supabaseAdmin
        .from('exhibitor_orders')
        .select('*')
        .eq('mobile', session.mobile)
        .maybeSingle();

      if (sbReadErr) {
        console.error('[Extras GET] Could not read the order:', sbReadErr.message);
        return NextResponse.json(
          { error: 'Could not load your requirements. Please try again in a moment.' },
          { status: 503 }
        );
      }

      if (sbOrder) {
        order = {
          ...order,
          items_json: sbOrder.items_json,
          special_notes: sbOrder.special_notes ?? order?.special_notes ?? '',
          rental_days: sbOrder.rental_days ?? order?.rental_days ?? 2,
          updated_at: sbOrder.updated_at || order?.updated_at || null
        };
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

    const requirementsLocked = await lookupRequirementsLocked(session.mobile);

    return NextResponse.json({
      products,
      requirementsLocked,
      existingOrder: {
        items,
        special_notes: order?.special_notes || '',
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
        .select('exhibitor_name, fascia_names_json')
        .eq('mobile', mobile)
        .maybeSingle();

      if (sbProfile?.exhibitor_name) return String(sbProfile.exhibitor_name).trim();

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

/**
 * Whether the organiser has frozen this exhibitor's requirements section.
 * Checked on both the read (so the portal can render read-only) and the
 * write (so a locked exhibitor can't push a change through directly).
 */
async function lookupRequirementsLocked(mobile: string): Promise<boolean> {
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { data: sbProfile } = await supabaseAdmin
        .from('exhibitors')
        .select('requirements_locked')
        .eq('mobile', mobile)
        .maybeSingle();

      if (sbProfile) return Boolean(sbProfile.requirements_locked);
    } catch (err) {
      console.warn('[Extras] Requirements-lock lookup fell back to local store:', err);
    }
  }

  const local = db
    .prepare('SELECT requirements_locked FROM exhibitors WHERE mobile = ?')
    .get(mobile) as { requirements_locked?: boolean } | undefined;

  return Boolean(local?.requirements_locked);
}

/**
 * The GSTIN already stored against this exhibitor. Supabase keeps it inside
 * the structured fascia payload; the local store keeps it in its own column.
 */
async function lookupStoredGstin(mobile: string): Promise<string> {
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { data: sbProfile } = await supabaseAdmin
        .from('exhibitors')
        .select('gstin, fascia_names_json')
        .eq('mobile', mobile)
        .maybeSingle();

      if (sbProfile?.gstin) return normalizeGstin(sbProfile.gstin);

      const rawPayload = sbProfile?.fascia_names_json;
      if (rawPayload) {
        const parsed = typeof rawPayload === 'string' ? JSON.parse(rawPayload) : rawPayload;
        if (parsed && !Array.isArray(parsed) && typeof parsed === 'object' && parsed.gstin) {
          return normalizeGstin(parsed.gstin);
        }
      }
    } catch (err) {
      console.warn('[Extras POST] GSTIN lookup fell back to local store:', err);
    }
  }

  const local = db
    .prepare('SELECT gstin FROM exhibitors WHERE mobile = ?')
    .get(mobile) as { gstin?: string } | undefined;

  return normalizeGstin(local?.gstin || '');
}

export async function POST(request: Request) {
  try {
    const session = await getAuthenticatedExhibitor(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (await lookupRequirementsLocked(session.mobile)) {
      return NextResponse.json(
        { error: 'Your requirements have been locked by the organiser. Contact them if you need changes.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { items, special_notes, rental_days, days } = body;

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

    // Extras are chargeable, so an order for them is an order for an invoice,
    // and an invoice needs the GSTIN it is raised against. An order with no
    // items is somebody clearing their basket, which needs nothing.
    if (items.length > 0) {
      const orderGstin = normalizeGstin(body.gstin) || (await lookupStoredGstin(session.mobile));

      if (!orderGstin) {
        return NextResponse.json(
          { error: 'Your GST number is required before ordering extra items. Add it in the requisition summary.', field: 'gstin' },
          { status: 400 }
        );
      }

      const gstinCheck = checkGstin(orderGstin);
      if (!gstinCheck.valid) {
        return NextResponse.json({ error: gstinCheck.reason, field: 'gstin' }, { status: 400 });
      }

      const portal = await verifyGstinWithPortal(orderGstin);
      if (portal.checked && portal.active === false) {
        return NextResponse.json(
          { error: 'That GSTIN is not active on the GST portal. Please check the number or contact your tax advisor.', field: 'gstin' },
          { status: 400 }
        );
      }
    }

    const itemsJson = JSON.stringify(items);
    const cleanNotes = typeof special_notes === 'string' ? special_notes.trim() : '';

    const rDays = Math.max(1, Math.min(30, Number(rental_days || days || 2)));

    const existing = db
      .prepare('SELECT id FROM exhibitor_orders WHERE mobile = ?')
      .get(session.mobile);

    if (existing) {
      db.prepare(
        'UPDATE exhibitor_orders SET items_json = ?, special_notes = ?, rental_days = ? WHERE mobile = ?'
      ).run(itemsJson, cleanNotes, rDays, session.mobile);
    } else {
      db.prepare(
        'INSERT INTO exhibitor_orders (mobile, items_json, special_notes, rental_days) VALUES (?, ?, ?, ?)'
      ).run(session.mobile, itemsJson, cleanNotes, rDays);
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
