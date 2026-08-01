import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const exhibitors = db.prepare(`
      SELECT 
        e.mobile, 
        e.brand_name, 
        e.stall_sqft, 
        e.updated_at as profile_updated,
        o.items_json, 
        o.special_notes, 
        o.updated_at as order_updated
      FROM exhibitors e
      LEFT JOIN exhibitor_orders o ON e.mobile = o.mobile
      ORDER BY e.updated_at DESC
    `).all() as Array<{
      mobile: string;
      brand_name: string;
      stall_sqft: string;
      profile_updated: string;
      items_json: string | null;
      special_notes: string | null;
      order_updated: string | null;
    }>;

    const formatted = exhibitors.map((ex) => {
      let items = [];
      if (ex.items_json) {
        try {
          items = JSON.parse(ex.items_json);
        } catch {
          items = [];
        }
      }
      return {
        mobile: ex.mobile,
        brand_name: ex.brand_name || 'Not set',
        stall_sqft: ex.stall_sqft || 'Not set',
        items,
        special_notes: ex.special_notes || '',
        last_updated: ex.order_updated || ex.profile_updated
      };
    });

    return NextResponse.json({ success: true, count: formatted.length, exhibitors: formatted });
  } catch (error) {
    console.error('Error fetching admin exhibitors data:', error);
    return NextResponse.json({ error: 'Failed to fetch admin data' }, { status: 500 });
  }
}
