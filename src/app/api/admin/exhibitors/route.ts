import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { REGISTERED_EXHIBITORS_LIST } from '@/data/registeredExhibitors';

export async function GET() {
  try {
    // 1. Fetch saved orders from db
    const dbOrders = db.prepare(`
      SELECT 
        mobile, 
        items_json, 
        special_notes, 
        owner_badges,
        sales_badges,
        support_badges,
        badge_names_json,
        updated_at as order_updated
      FROM exhibitor_orders
    `).all() as Array<{
      mobile: string;
      items_json: string | null;
      special_notes: string | null;
      owner_badges?: number;
      sales_badges?: number;
      support_badges?: number;
      badge_names_json?: string | null;
      order_updated: string | null;
    }>;

    const ordersMap: Record<string, any> = {};
    dbOrders.forEach(o => {
      ordersMap[o.mobile] = o;
    });

    // Also fetch any exhibitors saved dynamically in db
    const dbExhibitors = db.prepare(`SELECT * FROM exhibitors`).all() as Array<any>;
    const dbExhibitorsMap: Record<string, any> = {};
    dbExhibitors.forEach(e => {
      dbExhibitorsMap[e.mobile] = e;
    });

    // 2. Combine registered exhibitors list with db exhibitors & orders
    const allMobiles = Array.from(new Set([
      ...REGISTERED_EXHIBITORS_LIST.map(r => r.mobile),
      ...Object.keys(dbExhibitorsMap),
      ...Object.keys(ordersMap)
    ]));

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

    const formattedList: any[] = [];

    allMobiles.forEach(mob => {
      const reg = REGISTERED_EXHIBITORS_LIST.find(r => r.mobile === mob);
      const dbEx = dbExhibitorsMap[mob];
      const order = ordersMap[mob];

      const brandName = reg?.brandName || dbEx?.brand_name || 'Registered Exhibitor';
      const stallSqft = reg?.stallSqft || dbEx?.stall_sqft || '200 sq ft';

      let items: Array<{ id: string; name: string; quantity: number; unit: string }> = [];
      if (order && order.items_json) {
        try {
          items = JSON.parse(order.items_json);
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
      if (stallSqft) {
        const sq = parseInt(stallSqft.replace(/\D/g, ''), 10);
        if (!isNaN(sq)) totalSqftSum += sq;
      }

      const oBadges = Number(order?.owner_badges ?? (reg ? 1 : 0));
      const sBadges = Number(order?.sales_badges ?? 0);
      const supBadges = Number(order?.support_badges ?? 0);

      let badgeNames = { owner: [] as string[], sales: [] as string[], support: [] as string[] };
      if (order && order.badge_names_json) {
        try {
          badgeNames = JSON.parse(order.badge_names_json);
        } catch {}
      }

      let fasciaNames = ['', '', '', ''];
      if (dbEx?.fascia_names_json) {
        try {
          const parsed = JSON.parse(dbEx.fascia_names_json);
          if (Array.isArray(parsed)) {
            fasciaNames = [parsed[0] || '', parsed[1] || '', parsed[2] || '', parsed[3] || ''];
          }
        } catch {}
      } else {
        fasciaNames = [brandName, '', '', ''];
      }

      totalOwnerBadges += oBadges;
      totalSalesBadges += sBadges;
      totalSupportBadges += supBadges;

      formattedList.push({
        mobile: mob,
        brand_name: brandName,
        stall_sqft: stallSqft,
        category: reg?.category || '',
        market: reg?.market || '',
        fascia_names: fasciaNames,
        items,
        special_notes: order?.special_notes || '',
        owner_badges: oBadges,
        sales_badges: sBadges,
        support_badges: supBadges,
        badge_names: badgeNames,
        last_updated: order?.order_updated || dbEx?.updated_at || new Date().toISOString()
      });
    });

    return NextResponse.json({
      success: true,
      count: formattedList.length,
      totalSqftSum,
      totalOwnerBadges,
      totalSalesBadges,
      totalSupportBadges,
      itemTotals: Object.values(itemTotals),
      exhibitors: formattedList
    });
  } catch (error) {
    console.error('Error fetching admin exhibitors data:', error);
    return NextResponse.json({ error: 'Failed to fetch admin data' }, { status: 500 });
  }
}
