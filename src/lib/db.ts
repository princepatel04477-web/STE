import path from 'path';
import fs from 'fs';

// Environment-aware storage directory (/tmp for Vercel serverless, data/ for local)
const dataDir = process.env.VERCEL
  ? path.join('/tmp', 'ste_data')
  : path.join(process.cwd(), 'data');

if (!fs.existsSync(dataDir)) {
  try { fs.mkdirSync(dataDir, { recursive: true }); } catch {}
}

const dbFile = path.join(dataDir, 'ste_store.json');
const passFile = path.join(dataDir, 'ste_passwords.json');

// Helper password functions
export async function fetchRemotePasswords(): Promise<Record<string, string>> {
  try {
    if (!fs.existsSync(passFile)) return {};
    const raw = fs.readFileSync(passFile, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function saveRemotePassword(mobile: string, customPass: string): Promise<boolean> {
  try {
    let map: Record<string, string> = {};
    try {
      if (fs.existsSync(passFile)) {
        map = JSON.parse(fs.readFileSync(passFile, 'utf-8'));
      }
    } catch {}
    map[mobile] = customPass;
    fs.writeFileSync(passFile, JSON.stringify(map, null, 2), 'utf-8');
    return true;
  } catch {
    return false;
  }
}

// Hardcoded whitelist of all registered exhibitor mobile numbers from STE-Registerd-Mobile-Numbers.md + demo number
export const REGISTERED_EXHIBITOR_MOBILES = [
  '9106139666', '9950787787', '9824886668', '9320049155', '9274669399', '9824131004', '9506455565',
  '9879861191', '9374498302', '8980018801', '9265618713', '9825231170', '9377418152',
  '9408990045', '7878279828', '9375793060', '9974125112', '7016067015', '9978889174',
  '9375022000', '9691700354', '9586899777', '9638338014', '9601700354', '9909648249',
  '8866666650', '9824150667', '9727256154', '9586921213', '9898866093', '9374954037',
  '7016061443', '9825129301', '9537886611', '9909313004', '9825550213', '9377012023',
  '9825385509', '9825363009', '9722771233', '7878536330', '9924222001', '9601258092',
  '8141335579', '9898106273', '9377191978', '9925417122', '9879158404', '9377062128',
  '9852146981', '7818968985', '9374049925', '7383001130', '9825424890', '9829085935',
  '9737404150', '9825130650', '8980254587', '9316721800', '6353511883', '9822227954',
  '9825122634', '9825900000', '9099941185', '8758832184', '7600710440', '8619183572',
  '7359330135', '9687014347', '7487991498', '9081277726', '9978912068', '9913314440',
  '6353582439', '9726254452', '9328539215', '9979907076', '9913313866', '8460595502',
  '9537841621', '9925006129', '9978524326', '8347324372', '9982170219', '9999991375',
  '9099009117', '9510064200', '9079789088', '9726277110', '9979940730', '8469000011',
  '9898016566', '9099140404', '9726693691', '9825156704', '9879360089', '7405045216',
  '9820935033', '9979883010', '9879688431', '9586621717', '9426923797', '9825127946',
  '9824686050', '9712972601', '9925557740', '9627868411', '9374739383', '9825505610',
  '9327452161', '9913165411', '9925633987', '8460595502', '9016588151', '9375511910',
  '9327465454', '9998862777', '9825267689', '9909095200', '9898297092', '9638143399',
  '7874363994', '9825182005', '9998626756', '9687609749', '9033339606', '9879892623',
  '9374818499', '9099448676', '8141014006', '7285010000', '7573975665', '7874442888',
  '9537420562', '9545612026'
];

export interface LotteryAllocationRecord {
  id: number;
  mobile: string;
  brand_name: string;
  stall_sqft: string;
  stall_number: string;
  is_corner: number;
  shape: 'L-Shape' | 'Linear';
  hall: string;
  zone: string;
  dimensions: string;
  slip_id: string;
  allocated_at: string;
}

export interface ExhibitorRecord {
  id: number;
  mobile: string;
  brand_name: string;
  stall_sqft: string;
  exhibitor_name?: string;
  profile_pic_url?: string;
  company_description?: string;
  custom_password?: string;
  fascia_names_json?: string;
  logo_file_url?: string;
  cdr_file_url?: string;
  drive_file_url?: string;
  drive_folder_id?: string;
  drive_folder_url?: string;
  updated_at: string;
}

interface Schema {
  allowed_exhibitors: Array<{ id: number; mobile: string; notes: string; created_at: string }>;
  exhibitors: Array<ExhibitorRecord>;
  extra_products: Array<{ id: string; name: string; category: string; description: string; unit: string; rate_inr?: number; icon_name: string; is_active: number }>;
  exhibitor_orders: Array<{ id: number; mobile: string; items_json: string; special_notes: string; owner_badges?: number; sales_badges?: number; support_badges?: number; badge_names_json?: string; rental_days?: number; updated_at: string }>;
  lottery_allocations: Array<LotteryAllocationRecord>;
}

const defaultProducts = [
  { id: 'desk-table', name: 'Desk Table', category: 'Furniture & Seating', description: '1m × 0.5m × 0.75m desk table', rate_inr: 600, unit: 'per-day', icon_name: 'table', is_active: 1 },
  { id: 'glass-round-table', name: 'Glass Round Table', category: 'Furniture & Seating', description: '1m dia × 0.75m glass table', rate_inr: 1400, unit: 'per-day', icon_name: 'table', is_active: 1 },
  { id: 'white-chair', name: 'White Chair', category: 'Furniture & Seating', description: 'Standard white seating chair', rate_inr: 700, unit: 'per-day', icon_name: 'chair', is_active: 1 },
  { id: 'cushioned-chair', name: 'Cushioned Chair', category: 'Furniture & Seating', description: 'Comfortable cushioned meeting chair', rate_inr: 700, unit: 'per-day', icon_name: 'chair', is_active: 1 },
  { id: 'sofa-single', name: 'Sofa — Single Seat', category: 'Furniture & Seating', description: 'Single seat plush sofa armchair', rate_inr: 3000, unit: 'per-day', icon_name: 'sofa', is_active: 1 },
  { id: 'sofa-double', name: 'Sofa — Double Seat', category: 'Furniture & Seating', description: '2-seater luxury lounge sofa', rate_inr: 5000, unit: 'per-day', icon_name: 'sofa', is_active: 1 },
  { id: 'sofa-three', name: 'Sofa — Three Seat', category: 'Furniture & Seating', description: '3-seater spacious lounge sofa', rate_inr: 6000, unit: 'per-day', icon_name: 'sofa', is_active: 1 },
  { id: 'glass-centre-table', name: 'Glass Centre Table', category: 'Furniture & Seating', description: 'Glass top lounge center table', rate_inr: 1200, unit: 'per-day', icon_name: 'table', is_active: 1 },
  { id: 'brochure-rack', name: 'Brochure Rack', category: 'Display & AV', description: 'Catalogue / Brochure rack', rate_inr: 1500, unit: 'per-day', icon_name: 'file-text', is_active: 1 },
  { id: 'glass-shelf', name: 'Glass Shelf', category: 'Display & AV', description: '1m × 0.25m wall mounted glass shelf', rate_inr: 600, unit: 'per-day', icon_name: 'layers', is_active: 1 },
  { id: 'wooden-shelf', name: 'Wooden Shelf', category: 'Display & AV', description: '1m × 0.25m wooden display shelf', rate_inr: 500, unit: 'per-day', icon_name: 'layers', is_active: 1 },
  { id: 'spot-light', name: 'Spot Light', category: 'Electrical & Lighting', description: 'LED spotlight / Metal halide light (50W)', rate_inr: 1500, unit: 'per-day', icon_name: 'zap', is_active: 1 },
  { id: 'power-socket', name: 'Power Socket Connection', category: 'Electrical & Lighting', description: '5A / 15A single phase power socket outlet', rate_inr: 250, unit: 'per-day', icon_name: 'zap', is_active: 1 },
  { id: 'tv-screen', name: '32" Plasma Smart TV', category: 'Display & AV', description: '32" Plasma screen display with floor stand', rate_inr: 3500, unit: 'per-day', icon_name: 'tv', is_active: 1 },
  { id: 'display-rack', name: 'Garment Stand / Display Rack', category: 'Display & AV', description: 'Fabric hangers / Garment display rack', rate_inr: 900, unit: 'per-day', icon_name: 'layers', is_active: 1 },
  { id: 'pedestal-fan', name: 'Pedestal Fan', category: 'Electrical & Lighting', description: 'High power pedestal fan', rate_inr: 1500, unit: 'per-day', icon_name: 'zap', is_active: 1 }
];

function readData(): Schema {
  if (!fs.existsSync(dbFile)) {
    const initial: Schema = {
      allowed_exhibitors: REGISTERED_EXHIBITOR_MOBILES.map((mob, idx) => ({
        id: idx + 1,
        mobile: mob,
        notes: 'Pre-whitelisted exhibitor from master list',
        created_at: new Date().toISOString()
      })),
      exhibitors: [],
      extra_products: defaultProducts,
      exhibitor_orders: [],
      lottery_allocations: []
    };
    saveData(initial);
    return initial;
  }
  try {
    const raw = fs.readFileSync(dbFile, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.allowed_exhibitors) {
      parsed.allowed_exhibitors = REGISTERED_EXHIBITOR_MOBILES.map((mob, idx) => ({
        id: idx + 1,
        mobile: mob,
        notes: 'Pre-whitelisted exhibitor from master list',
        created_at: new Date().toISOString()
      }));
    }
    if (!parsed.lottery_allocations) {
      parsed.lottery_allocations = [];
    }
    // Always update extra_products rates to match STE_EXTRAS.xlsx
    parsed.extra_products = defaultProducts;
    return parsed;
  } catch {
    return {
      allowed_exhibitors: REGISTERED_EXHIBITOR_MOBILES.map((mob, idx) => ({
        id: idx + 1,
        mobile: mob,
        notes: 'Pre-whitelisted exhibitor from master list',
        created_at: new Date().toISOString()
      })),
      exhibitors: [],
      extra_products: defaultProducts,
      exhibitor_orders: [],
      lottery_allocations: []
    };
  }
}

function saveData(data: Schema) {
  try {
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write db store:', err);
  }
}

// Database API Abstraction Layer matching SQL operations
export const db = {
  prepare(sql: string) {
    const q = sql.trim().toLowerCase();

    return {
      get(...args: any[]) {
        const data = readData();

        if (q.includes('count(*) as count from allowed_exhibitors')) {
          return { count: data.allowed_exhibitors.length };
        }
        if (q.includes('count(*) as count from extra_products')) {
          return { count: data.extra_products.length };
        }
        if (q.includes('select mobile from allowed_exhibitors where mobile = ?')) {
          const target = String(args[0]);
          return data.allowed_exhibitors.find(e => e.mobile === target);
        }
        if (q.includes('select * from exhibitors where mobile = ?') || q.includes('select mobile, brand_name, stall_sqft')) {
          const target = String(args[0]);
          return data.exhibitors.find(e => e.mobile === target);
        }
        if (q.includes('select id from exhibitors where mobile = ?')) {
          const target = String(args[0]);
          return data.exhibitors.find(e => e.mobile === target);
        }
        if (q.includes('select items_json, special_notes') || q.includes('select * from exhibitor_orders where mobile = ?')) {
          const target = String(args[0]);
          return data.exhibitor_orders.find(o => o.mobile === target);
        }
        if (q.includes('select id from exhibitor_orders where mobile = ?')) {
          const target = String(args[0]);
          return data.exhibitor_orders.find(o => o.mobile === target);
        }
        if (q.includes('from lottery_allocations where mobile = ?')) {
          const target = String(args[0]);
          return (data.lottery_allocations || []).find(l => l.mobile === target);
        }
        if (q.includes('count(*) as count from lottery_allocations')) {
          return { count: (data.lottery_allocations || []).length };
        }
        return undefined;
      },

      all(...args: any[]) {
        const data = readData();

        if (q.includes('from extra_products')) {
          return data.extra_products.filter(p => p.is_active === 1);
        }

        if (q.includes('from exhibitor_orders')) {
          return data.exhibitor_orders;
        }

        if (q.includes('from lottery_allocations')) {
          if (q.includes('select stall_number')) {
            return (data.lottery_allocations || []).map(l => ({ stall_number: l.stall_number }));
          }
          return data.lottery_allocations || [];
        }

        if (q.includes('from exhibitors') && !q.includes('left join')) {
          return data.exhibitors;
        }

        if (q.includes('from exhibitors e left join exhibitor_orders')) {
          return data.exhibitors.map(ex => {
            const order = data.exhibitor_orders.find(o => o.mobile === ex.mobile);
            return {
              mobile: ex.mobile,
              brand_name: ex.brand_name,
              stall_sqft: ex.stall_sqft,
              exhibitor_name: ex.exhibitor_name ?? '',
              profile_pic_url: ex.profile_pic_url ?? null,
              company_description: ex.company_description ?? '',
              fascia_names_json: ex.fascia_names_json ?? null,
              logo_file_url: ex.logo_file_url ?? null,
              cdr_file_url: ex.cdr_file_url ?? null,
              drive_file_url: ex.drive_file_url ?? null,
              drive_folder_id: ex.drive_folder_id ?? null,
              drive_folder_url: ex.drive_folder_url ?? null,
              profile_updated: ex.updated_at,
              items_json: order ? order.items_json : null,
              special_notes: order ? order.special_notes : null,
              owner_badges: order ? (order.owner_badges ?? 0) : 0,
              sales_badges: order ? (order.sales_badges ?? 0) : 0,
              support_badges: order ? (order.support_badges ?? 0) : 0,
              badge_names_json: order ? (order.badge_names_json ?? null) : null,
              rental_days: order ? (order.rental_days ?? 2) : 2,
              order_updated: order ? order.updated_at : null
            };
          });
        }

        return [];
      },

      run(...args: any[]) {
        const data = readData();

        if (q.includes('insert into exhibitors (mobile) values (?)')) {
          const mobile = String(args[0]);
          if (!data.exhibitors.some(e => e.mobile === mobile)) {
            data.exhibitors.push({
              id: data.exhibitors.length + 1,
              mobile,
              brand_name: '',
              stall_sqft: '',
              exhibitor_name: '',
              company_description: '',
              updated_at: new Date().toISOString()
            });
          }
          saveData(data);
          return { changes: 1 };
        }

        if (q.includes('update exhibitors set')) {
          if (q.includes('custom_password = ?')) {
            const custom_password = String(args[0]);
            const mobile = String(args[1]);
            const ex = data.exhibitors.find(e => e.mobile === mobile);
            if (ex) {
              ex.custom_password = custom_password;
              ex.updated_at = new Date().toISOString();
            } else {
              data.exhibitors.push({
                id: data.exhibitors.length + 1,
                mobile,
                brand_name: '',
                stall_sqft: '',
                custom_password,
                updated_at: new Date().toISOString()
              });
            }
            saveData(data);
            return { changes: 1 };
          }

          if (q.includes('profile_pic_url')) {
            const profile_pic_url = String(args[0] || '');
            const mobile = String(args[1]);
            const ex = data.exhibitors.find(e => e.mobile === mobile);
            if (ex) {
              ex.profile_pic_url = profile_pic_url;
              ex.updated_at = new Date().toISOString();
            }
            saveData(data);
            return { changes: 1 };
          }

          // Full Profile Update
          // Handles: UPDATE exhibitors SET brand_name = ?, stall_sqft = ?, fascia_names_json = ?, exhibitor_name = ?, company_description = ?, updated_at = ... WHERE mobile = ?
          const mobile = String(args[args.length - 1]);
          let brand_name = '';
          let stall_sqft = '';
          let fascia_names_json: string | undefined = undefined;
          let exhibitor_name: string | undefined = undefined;
          let company_description: string | undefined = undefined;

          if (args.length >= 6) {
            brand_name = String(args[0] || '');
            stall_sqft = String(args[1] || '');
            fascia_names_json = String(args[2] || '');
            exhibitor_name = String(args[3] || '');
            company_description = String(args[4] || '');
          } else if (args.length === 4) {
            brand_name = String(args[0] || '');
            stall_sqft = String(args[1] || '');
            fascia_names_json = String(args[2] || '');
          } else if (args.length === 3) {
            brand_name = String(args[0] || '');
            stall_sqft = String(args[1] || '');
          }

          const ex = data.exhibitors.find(e => e.mobile === mobile);
          if (ex) {
            if (brand_name) ex.brand_name = brand_name;
            if (stall_sqft) ex.stall_sqft = stall_sqft;
            if (fascia_names_json !== undefined) ex.fascia_names_json = fascia_names_json;
            if (exhibitor_name !== undefined) ex.exhibitor_name = exhibitor_name;
            if (company_description !== undefined) ex.company_description = company_description;
            ex.updated_at = new Date().toISOString();
          } else {
            data.exhibitors.push({
              id: data.exhibitors.length + 1,
              mobile,
              brand_name,
              stall_sqft,
              fascia_names_json,
              exhibitor_name: exhibitor_name || '',
              company_description: company_description || '',
              updated_at: new Date().toISOString()
            });
          }
          saveData(data);
          return { changes: 1 };
        }

        if (q.includes('insert into exhibitors')) {
          const mobile = String(args[0]);
          const brand_name = String(args[1] || '');
          const stall_sqft = String(args[2] || '');
          const fascia_names_json = args[3] ? String(args[3]) : undefined;
          const exhibitor_name = args[4] ? String(args[4]) : undefined;
          const company_description = args[5] ? String(args[5]) : undefined;
          data.exhibitors.push({
            id: data.exhibitors.length + 1,
            mobile,
            brand_name,
            stall_sqft,
            fascia_names_json,
            exhibitor_name: exhibitor_name || '',
            company_description: company_description || '',
            updated_at: new Date().toISOString()
          });
          saveData(data);
          return { changes: 1 };
        }

        if (q.includes('update exhibitor_orders')) {
          const items_json = String(args[0]);
          const special_notes = String(args[1]);
          const owner_badges = Number(args[2] ?? 0);
          const sales_badges = Number(args[3] ?? 0);
          const support_badges = Number(args[4] ?? 0);
          let badge_names_json = '';
          let rental_days = 2;
          let mobile = '';

          if (args.length >= 8) {
            badge_names_json = String(args[5] || '');
            rental_days = Number(args[6] || 2);
            mobile = String(args[7]);
          } else if (args.length === 7) {
            badge_names_json = String(args[5] || '');
            mobile = String(args[6]);
          } else {
            mobile = String(args[args.length - 1]);
          }

          const order = data.exhibitor_orders.find(o => o.mobile === mobile);
          if (order) {
            order.items_json = items_json;
            order.special_notes = special_notes;
            order.owner_badges = owner_badges;
            order.sales_badges = sales_badges;
            order.support_badges = support_badges;
            if (badge_names_json) order.badge_names_json = badge_names_json;
            if (rental_days) order.rental_days = rental_days;
            order.updated_at = new Date().toISOString();
          } else {
            data.exhibitor_orders.push({
              id: data.exhibitor_orders.length + 1,
              mobile,
              items_json,
              special_notes,
              owner_badges,
              sales_badges,
              support_badges,
              badge_names_json: badge_names_json || undefined,
              rental_days,
              updated_at: new Date().toISOString()
            });
          }
          saveData(data);
          return { changes: 1 };
        }

        if (q.includes('insert into exhibitor_orders')) {
          let mobile = '';
          let items_json = '';
          let special_notes = '';
          let owner_badges = 0;
          let sales_badges = 0;
          let support_badges = 0;
          let badge_names_json: string | undefined = undefined;
          let rental_days = 2;

          if (args.length >= 8) {
            mobile = String(args[0]);
            items_json = String(args[1]);
            special_notes = String(args[2]);
            owner_badges = Number(args[3] ?? 0);
            sales_badges = Number(args[4] ?? 0);
            support_badges = Number(args[5] ?? 0);
            badge_names_json = typeof args[6] === 'string' ? args[6] : undefined;
            rental_days = Number(args[7] || 2);
          } else {
            mobile = String(args[0]);
            items_json = String(args[1]);
            special_notes = String(args[2]);
            owner_badges = Number(args[3] ?? 0);
            sales_badges = Number(args[4] ?? 0);
            support_badges = Number(args[5] ?? 0);
            badge_names_json = typeof args[6] === 'string' ? args[6] : undefined;
          }

          const existing = data.exhibitor_orders.find(o => o.mobile === mobile);
          if (existing) {
            existing.items_json = items_json;
            existing.special_notes = special_notes;
            existing.owner_badges = owner_badges;
            existing.sales_badges = sales_badges;
            existing.support_badges = support_badges;
            if (badge_names_json) existing.badge_names_json = badge_names_json;
            if (rental_days) existing.rental_days = rental_days;
            existing.updated_at = new Date().toISOString();
          } else {
            data.exhibitor_orders.push({
              id: data.exhibitor_orders.length + 1,
              mobile,
              items_json,
              special_notes,
              owner_badges,
              sales_badges,
              support_badges,
              badge_names_json,
              rental_days,
              updated_at: new Date().toISOString()
            });
          }
          saveData(data);
          return { changes: 1 };
        }

        if (q.includes('insert or ignore into allowed_exhibitors')) {
          const mobile = String(args[0]);
          const notes = String(args[1] || 'Registered Exhibitor');
          if (!data.allowed_exhibitors.some(a => a.mobile === mobile)) {
            data.allowed_exhibitors.push({
              id: data.allowed_exhibitors.length + 1,
              mobile,
              notes,
              created_at: new Date().toISOString()
            });
            saveData(data);
          }
          return { changes: 1 };
        }

        if (q.includes('insert into lottery_allocations')) {
          const mobile = String(args[0]);
          const brand_name = String(args[1] || '');
          const stall_sqft = String(args[2] || '');
          const stall_number = String(args[3] || '');
          const is_corner = Number(args[4] || 0);
          const shape = (args[5] || 'Linear') as 'L-Shape' | 'Linear';
          const hall = String(args[6] || '');
          const zone = String(args[7] || '');
          const dimensions = String(args[8] || '');
          const slip_id = String(args[9] || '');
          const allocated_at = String(args[10] || new Date().toISOString());

          if (!data.lottery_allocations) data.lottery_allocations = [];
          const existingIdx = data.lottery_allocations.findIndex(l => l.mobile === mobile);
          const record: LotteryAllocationRecord = {
            id: existingIdx >= 0 ? data.lottery_allocations[existingIdx].id : data.lottery_allocations.length + 1,
            mobile,
            brand_name,
            stall_sqft,
            stall_number,
            is_corner,
            shape,
            hall,
            zone,
            dimensions,
            slip_id,
            allocated_at
          };

          if (existingIdx >= 0) {
            data.lottery_allocations[existingIdx] = record;
          } else {
            data.lottery_allocations.push(record);
          }
          saveData(data);
          return { changes: 1 };
        }

        if (q.includes('delete from lottery_allocations where mobile = ?')) {
          const target = String(args[0]);
          if (!data.lottery_allocations) data.lottery_allocations = [];
          const initialLen = data.lottery_allocations.length;
          data.lottery_allocations = data.lottery_allocations.filter(l => l.mobile !== target);
          saveData(data);
          return { changes: initialLen - data.lottery_allocations.length };
        }

        if (q.includes('delete from lottery_allocations')) {
          data.lottery_allocations = [];
          saveData(data);
          return { changes: 1 };
        }

        return { changes: 0 };
      }
    };
  }
};

export function updateExhibitorFiles(
  mobile: string,
  files: {
    logo_file_url?: string;
    cdr_file_url?: string;
    profile_pic_url?: string;
    drive_file_url?: string;
    drive_folder_id?: string;
    drive_folder_url?: string;
  }
): boolean {
  try {
    const data = readData();
    let ex = data.exhibitors.find(e => e.mobile === mobile);
    if (!ex) {
      ex = {
        id: data.exhibitors.length + 1,
        mobile,
        brand_name: '',
        stall_sqft: '',
        exhibitor_name: '',
        company_description: '',
        updated_at: new Date().toISOString()
      };
      data.exhibitors.push(ex);
    }

    if (files.logo_file_url !== undefined) ex.logo_file_url = files.logo_file_url;
    if (files.cdr_file_url !== undefined) ex.cdr_file_url = files.cdr_file_url;
    if (files.profile_pic_url !== undefined) ex.profile_pic_url = files.profile_pic_url;
    if (files.drive_file_url !== undefined) ex.drive_file_url = files.drive_file_url;
    if (files.drive_folder_id !== undefined) ex.drive_folder_id = files.drive_folder_id;
    if (files.drive_folder_url !== undefined) ex.drive_folder_url = files.drive_folder_url;
    ex.updated_at = new Date().toISOString();

    saveData(data);
    return true;
  } catch (err) {
    console.error('Failed to update exhibitor files in db:', err);
    return false;
  }
}

export default db;
