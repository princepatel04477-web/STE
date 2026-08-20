import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getAuthenticatedExhibitor } from '@/lib/auth';
import { syncToGoogleSheets } from '@/lib/googleSheets';

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
      .prepare('SELECT items_json, special_notes, updated_at FROM exhibitor_orders WHERE mobile = ?')
      .get(session.mobile) as { items_json: string; special_notes: string; owner_badges?: number; sales_badges?: number; support_badges?: number; updated_at: string } | undefined;

    let items = [];
    if (order && order.items_json) {
      try {
        items = JSON.parse(order.items_json);
      } catch {
        items = [];
      }
    }

    return NextResponse.json({
      products,
      existingOrder: {
        items,
        special_notes: order?.special_notes || '',
        owner_badges: order?.owner_badges ?? 0,
        sales_badges: order?.sales_badges ?? 0,
        support_badges: order?.support_badges ?? 0,
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
    const { items, special_notes, owner_badges, sales_badges, support_badges } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid items payload' }, { status: 400 });
    }

    const itemsJson = JSON.stringify(items);
    const cleanNotes = typeof special_notes === 'string' ? special_notes.trim() : '';

    const oBadges = Math.min(2, Math.max(0, Number(owner_badges || 0)));
    const sBadges = Math.min(10, Math.max(0, Number(sales_badges || 0)));
    const supBadges = Math.min(10, Math.max(0, Number(support_badges || 0)));

    const existing = db
      .prepare('SELECT id FROM exhibitor_orders WHERE mobile = ?')
      .get(session.mobile);

    if (existing) {
      db.prepare(
        'UPDATE exhibitor_orders SET items_json = ?, special_notes = ? WHERE mobile = ?'
      ).run(itemsJson, cleanNotes, oBadges, sBadges, supBadges, session.mobile);
    } else {
      db.prepare(
        'INSERT INTO exhibitor_orders (mobile, items_json, special_notes) VALUES (?, ?, ?)'
      ).run(session.mobile, itemsJson, cleanNotes, oBadges, sBadges, supBadges);
    }

    // Fetch exhibitor profile for complete Google Sheet row sync
    const profile = db
      .prepare('SELECT brand_name, stall_sqft FROM exhibitors WHERE mobile = ?')
      .get(session.mobile) as { brand_name: string; stall_sqft: string } | undefined;

    // Sync to Google Sheets and await completion for Vercel Serverless execution
    try {
      await syncToGoogleSheets({
        mobile: session.mobile,
        brand_name: profile?.brand_name || '',
        stall_sqft: profile?.stall_sqft || '',
        items,
        special_notes: cleanNotes,
        owner_badges: oBadges,
        sales_badges: sBadges,
        support_badges: supBadges
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
