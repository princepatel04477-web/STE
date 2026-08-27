import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import {
  REGISTERED_EXHIBITORS_LIST,
  EXHIBITORS_ONLY,
  ORGANISER_MOBILES,
  findExhibitorByMobile,
  canonicalMobile,
} from '@/data/registeredExhibitors';
import { getAuthenticatedExhibitor, isAdminMobile } from '@/lib/auth';

export async function GET() {
  try {
    // Strict server-side role gate: only authenticated admin mobile numbers can access
    const session = await getAuthenticatedExhibitor();
    if (!session || !isAdminMobile(session.mobile)) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin authorization required.' },
        { status: 403 }
      );
    }
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
        rental_days,
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
      rental_days?: number;
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

    // 2. If Supabase is active, query remote source of truth and merge
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data: sbExhibitors } = await supabaseAdmin.from('exhibitors').select('*');
        if (sbExhibitors && Array.isArray(sbExhibitors)) {
          sbExhibitors.forEach((sbe) => {
            dbExhibitorsMap[sbe.mobile] = {
              ...dbExhibitorsMap[sbe.mobile],
              ...sbe,
              fascia_names_json: sbe.fascia_names_json ? JSON.stringify(sbe.fascia_names_json) : dbExhibitorsMap[sbe.mobile]?.fascia_names_json
            };
          });
        }

        const { data: sbOrders } = await supabaseAdmin.from('exhibitor_orders').select('*');
        if (sbOrders && Array.isArray(sbOrders)) {
          sbOrders.forEach((sbo) => {
            ordersMap[sbo.mobile] = {
              ...ordersMap[sbo.mobile],
              ...sbo,
              items_json: sbo.items_json ? JSON.stringify(sbo.items_json) : ordersMap[sbo.mobile]?.items_json,
              badge_names_json: sbo.badge_names_json ? JSON.stringify(sbo.badge_names_json) : ordersMap[sbo.mobile]?.badge_names_json,
              order_updated: sbo.updated_at || ordersMap[sbo.mobile]?.order_updated
            };
          });
        }
      } catch (sbErr) {
        console.warn('[Admin API] Note on Supabase merge:', sbErr);
      }
    }

    // 2b. Lucky draw allotments (stall numbers) keyed by mobile
    let lotteryAllocations: Array<any> = [];
    try {
      lotteryAllocations = (db.prepare(`SELECT * FROM lottery_allocations`).all() as Array<any>) || [];
    } catch {
      lotteryAllocations = [];
    }

    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data: sbAllocations } = await supabaseAdmin.from('lottery_allocations').select('*');
        if (sbAllocations && Array.isArray(sbAllocations)) {
          lotteryAllocations = sbAllocations;
        }
      } catch (sbErr) {
        console.warn('[Admin API] Note on lottery allocation merge:', sbErr);
      }
    }

    const allocationMap: Record<string, any> = {};
    lotteryAllocations.forEach((a) => {
      if (a?.mobile) allocationMap[canonicalMobile(a.mobile)] = a;
    });

    // 2c. Fold every record onto the number the master sheet gives.
    //
    // A firm that saved a profile, an order or a draw under a second number is
    // one exhibitor, not two, so its records move onto its sheet number before
    // the list is built. Whatever is left over belongs to nobody on the sheet
    // and is reported apart rather than counted as an exhibitor.
    const filled = (record: any) =>
      Object.fromEntries(
        Object.entries(record).filter(([, v]) => v !== null && v !== undefined && v !== '')
      );

    const foldOntoSheet = (map: Record<string, any>) => {
      const folded: Record<string, any> = {};
      const unknown: Record<string, any> = {};
      Object.entries(map).forEach(([mobile, record]) => {
        const reg = findExhibitorByMobile(mobile);
        if (!reg) {
          unknown[mobile] = record;
          return;
        }
        const prior = folded[reg.mobile];
        if (!prior) {
          folded[reg.mobile] = { ...record, mobile: reg.mobile, saved_under: mobile };
          return;
        }
        // The sheet's own number wins; an alias only fills what it leaves empty.
        const priorIsSheet = prior.saved_under === reg.mobile;
        const [strong, weak] =
          mobile === reg.mobile && !priorIsSheet ? [record, prior] : [prior, record];
        folded[reg.mobile] = {
          ...weak,
          ...filled(strong),
          mobile: reg.mobile,
          saved_under: mobile === reg.mobile ? reg.mobile : prior.saved_under,
        };
      });
      return { folded, unknown };
    };

    const foldedExhibitors = foldOntoSheet(dbExhibitorsMap);
    const foldedOrders = foldOntoSheet(ordersMap);
    const exhibitorRecords = foldedExhibitors.folded;
    const orderRecords = foldedOrders.folded;

    // 3. The master sheet is the list; nothing else joins it.
    const allMobiles = REGISTERED_EXHIBITORS_LIST.map((r) => r.mobile);

    // Numbers with saved data that are on neither the sheet nor an alias.
    const unknownMobiles = Array.from(new Set([
      ...Object.keys(foldedExhibitors.unknown),
      ...Object.keys(foldedOrders.unknown),
      ...lotteryAllocations
        .map((a) => String(a?.mobile ?? ''))
        .filter((m) => m && !findExhibitorByMobile(m)),
    ]));

    // The contact someone typed is often the only clue to who a stray number
    // is, and older profiles keep it inside the fascia blob.
    const contactOf = (dbEx: any): string => {
      if (dbEx?.exhibitor_name) return dbEx.exhibitor_name;
      try {
        const parsed =
          typeof dbEx?.fascia_names_json === 'string'
            ? JSON.parse(dbEx.fascia_names_json)
            : dbEx?.fascia_names_json;
        if (parsed && !Array.isArray(parsed) && typeof parsed === 'object') {
          return parsed.exhibitor_name || '';
        }
      } catch {}
      return '';
    };

    const unknownProfiles = unknownMobiles.map((mobile) => {
      const dbEx = foldedExhibitors.unknown[mobile];
      const allocation = lotteryAllocations.find((a) => a?.mobile === mobile);
      return {
        mobile,
        brand_name: dbEx?.brand_name || allocation?.brand_name || '',
        exhibitor_name: contactOf(dbEx),
        stall_number: allocation?.stall_number || '',
        stall_sqft: dbEx?.stall_sqft || allocation?.stall_sqft || '',
        last_updated: dbEx?.updated_at || allocation?.allocated_at || '',
      };
    });

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
      const dbEx = exhibitorRecords[mob];
      const order = orderRecords[mob];

      const allocation = allocationMap[mob];

      const brandName = reg?.brandName || dbEx?.brand_name || 'Registered Exhibitor';
      const stallSqft = reg?.stallSqft || dbEx?.stall_sqft || '200 sq ft';
      let exhibitorName = dbEx?.exhibitor_name || '';
      let profilePicUrl = dbEx?.profile_pic_url || null;
      let companyDescription = dbEx?.company_description || '';
      let fasciaNames = ['', '', '', ''];

      if (dbEx?.fascia_names_json) {
        try {
          const parsed = typeof dbEx.fascia_names_json === 'string' ? JSON.parse(dbEx.fascia_names_json) : dbEx.fascia_names_json;
          if (Array.isArray(parsed)) {
            fasciaNames = [parsed[0] || '', parsed[1] || '', parsed[2] || '', parsed[3] || ''];
          } else if (parsed && typeof parsed === 'object') {
            if (Array.isArray(parsed.fascia_names)) {
              fasciaNames = [parsed.fascia_names[0] || '', parsed.fascia_names[1] || '', parsed.fascia_names[2] || '', parsed.fascia_names[3] || ''];
            }
            if (parsed.exhibitor_name && !exhibitorName) exhibitorName = parsed.exhibitor_name;
            if (parsed.profile_pic_url && !profilePicUrl) profilePicUrl = parsed.profile_pic_url;
            if (parsed.company_description && !companyDescription) companyDescription = parsed.company_description;
          }
        } catch {}
      } else {
        fasciaNames = [brandName, '', '', ''];
      }

      let items: Array<{ id: string; name: string; quantity: number; unit: string }> = [];
      if (order && order.items_json) {
        try {
          items = typeof order.items_json === 'string' ? JSON.parse(order.items_json) : order.items_json;
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
          badgeNames = typeof order.badge_names_json === 'string' ? JSON.parse(order.badge_names_json) : order.badge_names_json;
        } catch {}
      }

      totalOwnerBadges += oBadges;
      totalSalesBadges += sBadges;
      totalSupportBadges += supBadges;

      formattedList.push({
        mobile: mob,
        brand_name: brandName,
        exhibitor_name: exhibitorName,
        profile_pic_url: profilePicUrl,
        company_description: companyDescription,
        stall_sqft: stallSqft,
        // The draw is the record; the copy on the profile answers when a
        // stall was seated by hand rather than drawn.
        stall_number: allocation?.stall_number || dbEx?.stall_number || '',
        stall_hall: allocation?.hall || dbEx?.stall_hall || '',
        stall_allocated_at: allocation?.allocated_at || dbEx?.stall_allocated_at || '',
        category: reg?.category || '',
        market: reg?.market || '',
        fascia_names: fasciaNames,
        items,
        special_notes: order?.special_notes || '',
        owner_badges: oBadges,
        sales_badges: sBadges,
        support_badges: supBadges,
        badge_names: badgeNames,
        logo_file_url: dbEx?.logo_file_url || null,
        cdr_file_url: dbEx?.cdr_file_url || null,
        drive_file_url: dbEx?.drive_file_url || null,
        drive_folder_url: dbEx?.drive_folder_url || null,
        rental_days: order?.rental_days ?? 2,
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
      exhibitors: formattedList,
      // The master sheet's own count, and the organiser logins that sit
      // alongside it, so the panel never passes one off as the other.
      sheetExhibitorCount: EXHIBITORS_ONLY.length,
      organiserCount: ORGANISER_MOBILES.length,
      unknownProfiles
    });
  } catch (error) {
    console.error('Error fetching admin exhibitors data:', error);
    return NextResponse.json({ error: 'Failed to fetch admin data' }, { status: 500 });
  }
}
