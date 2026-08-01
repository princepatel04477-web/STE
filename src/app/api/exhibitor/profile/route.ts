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

    const exhibitor = db
      .prepare('SELECT mobile, brand_name, stall_sqft, updated_at FROM exhibitors WHERE mobile = ?')
      .get(session.mobile) as { mobile: string; brand_name: string; stall_sqft: string; updated_at: string } | undefined;

    if (!exhibitor) {
      return NextResponse.json(
        { mobile: session.mobile, brand_name: '', stall_sqft: '' },
        { status: 200 }
      );
    }

    return NextResponse.json(exhibitor);
  } catch (error) {
    console.error('Error fetching exhibitor profile:', error);
    return NextResponse.json({ error: 'Failed to load profile.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthenticatedExhibitor();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { brand_name, stall_sqft } = body;

    if (!brand_name || typeof brand_name !== 'string' || !brand_name.trim()) {
      return NextResponse.json({ error: 'Brand Name is required.' }, { status: 400 });
    }

    if (!stall_sqft || typeof stall_sqft !== 'string' || !stall_sqft.trim()) {
      return NextResponse.json({ error: 'Stall size (square feet) is required.' }, { status: 400 });
    }

    const cleanBrand = brand_name.trim();
    const cleanSqft = stall_sqft.trim();

    const existing = db
      .prepare('SELECT id FROM exhibitors WHERE mobile = ?')
      .get(session.mobile);

    if (existing) {
      db.prepare(
        'UPDATE exhibitors SET brand_name = ?, stall_sqft = ?, updated_at = CURRENT_TIMESTAMP WHERE mobile = ?'
      ).run(cleanBrand, cleanSqft, session.mobile);
    } else {
      db.prepare(
        'INSERT INTO exhibitors (mobile, brand_name, stall_sqft) VALUES (?, ?, ?)'
      ).run(session.mobile, cleanBrand, cleanSqft);
    }

    // Fetch existing order items for complete Google Sheet row sync
    const order = db
      .prepare('SELECT items_json, special_notes FROM exhibitor_orders WHERE mobile = ?')
      .get(session.mobile) as { items_json: string; special_notes: string } | undefined;

    let items = [];
    if (order && order.items_json) {
      try { items = JSON.parse(order.items_json); } catch {}
    }

    // Trigger async sync to Google Sheets
    syncToGoogleSheets({
      mobile: session.mobile,
      brand_name: cleanBrand,
      stall_sqft: cleanSqft,
      items,
      special_notes: order?.special_notes || ''
    }).catch(err => console.error('Google Sheets background sync error:', err));

    return NextResponse.json({
      success: true,
      mobile: session.mobile,
      brand_name: cleanBrand,
      stall_sqft: cleanSqft,
      message: 'Exhibitor profile updated successfully.'
    });
  } catch (error) {
    console.error('Error updating exhibitor profile:', error);
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 });
  }
}
