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

    // Item-wise totals catalog initialize
    const itemTotals: Record<string, { id: string; name: string; quantity: number; unit: string }> = {
      'sofa-2seater': { id: 'sofa-2seater', name: 'VIP 2-Seater Leather Sofa', quantity: 0, unit: 'pcs' },
      'sofa-single': { id: 'sofa-single', name: 'Single Seater Armchair', quantity: 0, unit: 'pcs' },
      'exhibition-chair': { id: 'exhibition-chair', name: 'Standard Visitor Chair', quantity: 0, unit: 'pcs' },
      'glass-table': { id: 'glass-table', name: 'Round Glass Meeting Table', quantity: 0, unit: 'pcs' },
      'reception-counter': { id: 'reception-counter', name: 'Lockable Counter Table', quantity: 0, unit: 'pcs' },
      'female-model': { id: 'female-model', name: 'Promotional Female Model / Hostess', quantity: 0, unit: 'person/day' },
      'male-model': { id: 'male-model', name: 'Promotional Male Model / Host', quantity: 0, unit: 'person/day' },
      'spot-light': { id: 'spot-light', name: 'LED Yellow/White Spotlight (50W)', quantity: 0, unit: 'pcs' },
      'power-socket': { id: 'power-socket', name: '5A / 15A Power Socket Connection', quantity: 0, unit: 'point' },
      'tv-screen': { id: 'tv-screen', name: '55" 4K Smart TV with Floor Stand', quantity: 0, unit: 'pcs' },
      'display-rack': { id: 'display-rack', name: 'Fabric Hangers / Garment Display Rack', quantity: 0, unit: 'pcs' },
      'brochure-stand': { id: 'brochure-stand', name: 'Acrylic Catalogue / Brochure Stand', quantity: 0, unit: 'pcs' }
    };

    let totalSqftSum = 0;
    let totalOwnerBadges = 0;
    let totalSalesBadges = 0;
    let totalSupportBadges = 0;

    const formatted = exhibitors.map((ex: any) => {
      let items: Array<{ id: string; name: string; quantity: number; unit: string }> = [];
      if (ex.items_json) {
        try {
          items = JSON.parse(ex.items_json);
          items.forEach(item => {
            if (itemTotals[item.id]) {
              itemTotals[item.id].quantity += (Number(item.quantity) || 0);
            }
          });
        } catch {
          items = [];
        }
      }

      // Parse stall sqft
      if (ex.stall_sqft) {
        const sq = parseInt(ex.stall_sqft.replace(/\D/g, ''), 10);
        if (!isNaN(sq)) totalSqftSum += sq;
      }

      const oBadges = Number(ex.owner_badges || 0);
      const sBadges = Number(ex.sales_badges || 0);
      const supBadges = Number(ex.support_badges || 0);

      totalOwnerBadges += oBadges;
      totalSalesBadges += sBadges;
      totalSupportBadges += supBadges;

      return {
        mobile: ex.mobile,
        brand_name: ex.brand_name || 'Not set',
        stall_sqft: ex.stall_sqft || 'Not set',
        items,
        special_notes: ex.special_notes || '',
        owner_badges: oBadges,
        sales_badges: sBadges,
        support_badges: supBadges,
        last_updated: ex.order_updated || ex.profile_updated
      };
    });

    return NextResponse.json({
      success: true,
      count: formatted.length,
      totalSqftSum,
      totalOwnerBadges,
      totalSalesBadges,
      totalSupportBadges,
      itemTotals: Object.values(itemTotals),
      exhibitors: formatted
    });
  } catch (error) {
    console.error('Error fetching admin exhibitors data:', error);
    return NextResponse.json({ error: 'Failed to fetch admin data' }, { status: 500 });
  }
}
