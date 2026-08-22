import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthenticatedExhibitor } from '@/lib/auth';
import { syncToGoogleSheets } from '@/lib/googleSheets';
import { findExhibitorByMobile } from '@/data/registeredExhibitors';

export async function GET() {
  try {
    const session = await getAuthenticatedExhibitor();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const products = db
      .prepare('SELECT id, name, category, description, unit, rate_inr, icon_name FROM extra_products WHERE is_active = 1')
      .all();

    const order = db
      .prepare('SELECT items_json, special_notes, owner_badges, sales_badges, support_badges, badge_names_json, rental_days, updated_at FROM exhibitor_orders WHERE mobile = ?')
      .get(session.mobile) as { items_json: string; special_notes: string; owner_badges?: number; sales_badges?: number; support_badges?: number; badge_names_json?: string; rental_days?: number; updated_at: string } | undefined;

    let items = [];
    if (order && order.items_json) {
      try {
        items = JSON.parse(order.items_json);
      } catch {
        items = [];
      }
    }

    let badgeNames = { owner: [] as string[], sales: [] as string[], support: [] as string[] };
    if (order && order.badge_names_json) {
      try {
        badgeNames = JSON.parse(order.badge_names_json);
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

    const itemsJson = JSON.stringify(items);
    const cleanNotes = typeof special_notes === 'string' ? special_notes.trim() : '';

    const oBadges = Math.min(5, Math.max(0, Number(owner_badges || 0)));
    const sBadges = Math.min(5, Math.max(0, Number(sales_badges || 0)));
    const supBadges = Math.min(5, Math.max(0, Number(support_badges || 0)));
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

    // Fetch exhibitor profile or fallback to master registered list
    const profile = db
      .prepare('SELECT brand_name, stall_sqft FROM exhibitors WHERE mobile = ?')
      .get(session.mobile) as { brand_name: string; stall_sqft: string } | undefined;

    const reg = findExhibitorByMobile(session.mobile);
    const finalBrand = (profile?.brand_name && profile.brand_name.trim())
      ? profile.brand_name
      : (reg?.brandName || 'Registered Exhibitor');
    const finalSqft = (profile?.stall_sqft && profile.stall_sqft.trim())
      ? profile.stall_sqft
      : (reg?.stallSqft || '200 sq ft');

    // Sync to Google Sheets and await completion for Vercel Serverless execution
    try {
      await syncToGoogleSheets({
        mobile: session.mobile,
        brand_name: finalBrand,
        stall_sqft: finalSqft,
        items,
        special_notes: cleanNotes,
        owner_badges: oBadges,
        sales_badges: sBadges,
        support_badges: supBadges,
        badge_names: badge_names || undefined,
        rental_days: rDays
      });
    } catch (err) {
      console.error('Google Sheets background sync error:', err);
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
