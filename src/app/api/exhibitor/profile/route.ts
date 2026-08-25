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

    const exhibitor = db
      .prepare('SELECT mobile, brand_name, stall_sqft, fascia_names_json, logo_file_url, cdr_file_url, drive_file_url, drive_folder_id, drive_folder_url, updated_at FROM exhibitors WHERE mobile = ?')
      .get(session.mobile) as { mobile: string; brand_name: string; stall_sqft: string; fascia_names_json?: string; logo_file_url?: string; cdr_file_url?: string; drive_file_url?: string; drive_folder_id?: string; drive_folder_url?: string; updated_at: string } | undefined;

    const reg = findExhibitorByMobile(session.mobile);
    const brand_name = (exhibitor?.brand_name && exhibitor.brand_name.trim() !== '')
      ? exhibitor.brand_name
      : (reg?.brandName || 'Registered Exhibitor');

    const stall_sqft = (exhibitor?.stall_sqft && exhibitor.stall_sqft.trim() !== '')
      ? exhibitor.stall_sqft
      : (reg?.stallSqft || '200 sq ft');

    let fascia_names = ['', ''];
    if (exhibitor?.fascia_names_json) {
      try {
        const parsed = JSON.parse(exhibitor.fascia_names_json);
        if (Array.isArray(parsed)) {
          const names = parsed.map(n => String(n || ''));
          if (names[3]?.trim()) {
            fascia_names = [names[0] || '', names[1] || '', names[2] || '', names[3] || ''];
          } else if (names[2]?.trim()) {
            fascia_names = [names[0] || '', names[1] || '', names[2] || ''];
          } else {
            fascia_names = [names[0] || '', names[1] || ''];
          }
        }
      } catch {}
    } else {
      fascia_names = [brand_name, ''];
    }

    return NextResponse.json({
      mobile: session.mobile,
      brand_name,
      stall_sqft,
      fascia_names,
      logo_file_url: exhibitor?.logo_file_url || null,
      cdr_file_url: exhibitor?.cdr_file_url || null,
      drive_file_url: exhibitor?.drive_file_url || null,
      drive_folder_url: exhibitor?.drive_folder_url || null,
      category: reg?.category || '',
      market: reg?.market || ''
    });
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
    const { brand_name, stall_sqft, fascia_names } = body;

    if (!brand_name || typeof brand_name !== 'string' || !brand_name.trim()) {
      return NextResponse.json({ error: 'Brand Name is required.' }, { status: 400 });
    }

    if (!stall_sqft || typeof stall_sqft !== 'string' || !stall_sqft.trim()) {
      return NextResponse.json({ error: 'Stall size (square feet) is required.' }, { status: 400 });
    }

    const cleanBrand = brand_name.trim();
    const cleanSqft = stall_sqft.trim();
    
    // Sanitize dynamic fascia names options (up to 4, minimum 2)
    let cleanFasciaNames: string[] = ['', ''];
    if (Array.isArray(fascia_names)) {
      cleanFasciaNames = fascia_names.map(n => String(n || '').trim()).slice(0, 4);
      while (cleanFasciaNames.length < 2) {
        cleanFasciaNames.push('');
      }
    } else {
      cleanFasciaNames = [cleanBrand, ''];
    }
    const fasciaNamesJson = JSON.stringify(cleanFasciaNames);

    const existing = db
      .prepare('SELECT id FROM exhibitors WHERE mobile = ?')
      .get(session.mobile);

    if (existing) {
      db.prepare(
        'UPDATE exhibitors SET brand_name = ?, stall_sqft = ?, fascia_names_json = ?, updated_at = CURRENT_TIMESTAMP WHERE mobile = ?'
      ).run(cleanBrand, cleanSqft, fasciaNamesJson, session.mobile);
    } else {
      db.prepare(
        'INSERT INTO exhibitors (mobile, brand_name, stall_sqft, fascia_names_json) VALUES (?, ?, ?, ?)'
      ).run(session.mobile, cleanBrand, cleanSqft, fasciaNamesJson);
    }

    // Fetch existing order items for complete Google Sheet row sync
    const order = db
      .prepare('SELECT items_json, special_notes, owner_badges, sales_badges, support_badges, badge_names_json, rental_days FROM exhibitor_orders WHERE mobile = ?')
      .get(session.mobile) as { items_json: string; special_notes: string; owner_badges?: number; sales_badges?: number; support_badges?: number; badge_names_json?: string; rental_days?: number } | undefined;

    let items = [];
    if (order && order.items_json) {
      try { items = JSON.parse(order.items_json); } catch {}
    }

    let badgeNames = undefined;
    if (order && order.badge_names_json) {
      try { badgeNames = JSON.parse(order.badge_names_json); } catch {}
    }

    // Sync to Google Sheets and await completion for Vercel Serverless execution
    try {
      await syncToGoogleSheets({
        mobile: session.mobile,
        brand_name: cleanBrand,
        stall_sqft: cleanSqft,
        fascia_names: cleanFasciaNames,
        items,
        special_notes: order?.special_notes || '',
        owner_badges: order?.owner_badges ?? 0,
        sales_badges: order?.sales_badges ?? 0,
        support_badges: order?.support_badges ?? 0,
        badge_names: badgeNames,
        rental_days: order?.rental_days ?? 2
      });
    } catch (err) {
      console.error('Google Sheets background sync error:', err);
    }

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
