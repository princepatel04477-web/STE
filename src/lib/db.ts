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

interface Schema {
  allowed_exhibitors: Array<{ id: number; mobile: string; notes: string; created_at: string }>;
  exhibitors: Array<{ id: number; mobile: string; brand_name: string; stall_sqft: string; custom_password?: string; updated_at: string }>;
  extra_products: Array<{ id: string; name: string; category: string; description: string; unit: string; icon_name: string; is_active: number }>;
  exhibitor_orders: Array<{ id: number; mobile: string; items_json: string; special_notes: string; updated_at: string }>;
}

const defaultProducts = [
  { id: 'sofa-2seater', name: 'VIP 2-Seater Leather Sofa', category: 'Furniture', description: 'Luxury black/white leather sofa for lounge area', unit: 'pcs', icon_name: 'sofa', is_active: 1 },
  { id: 'sofa-single', name: 'Single Seater Armchair', category: 'Furniture', description: 'Comfortable plush lounge chair', unit: 'pcs', icon_name: 'chair', is_active: 1 },
  { id: 'exhibition-chair', name: 'Standard Visitor Chair', category: 'Furniture', description: 'Cushioned stackable chair for meeting tables', unit: 'pcs', icon_name: 'chair', is_active: 1 },
  { id: 'glass-table', name: 'Round Glass Meeting Table', category: 'Furniture', description: 'High-end glass top table for discussion', unit: 'pcs', icon_name: 'table', is_active: 1 },
  { id: 'reception-counter', name: 'Lockable Counter Table', category: 'Furniture', description: 'Wooden reception counter with lockable storage', unit: 'pcs', icon_name: 'table', is_active: 1 },
  { id: 'female-model', name: 'Promotional Female Model / Hostess', category: 'Manpower & Models', description: 'Professional booth host for greeting & assisting visitors (Per Day)', unit: 'person/day', icon_name: 'user', is_active: 1 },
  { id: 'male-model', name: 'Promotional Male Model / Host', category: 'Manpower & Models', description: 'Professional booth host for greeting & product demo (Per Day)', unit: 'person/day', icon_name: 'user', is_active: 1 },
  { id: 'spot-light', name: 'LED Yellow/White Spotlight (50W)', category: 'Lighting & Electric', description: 'High brightness spotlight for highlighting fabric displays', unit: 'pcs', icon_name: 'lightbulb', is_active: 1 },
  { id: 'power-socket', name: '5A / 15A Power Socket Connection', category: 'Lighting & Electric', description: 'Multi-plug electrical power extension point', unit: 'point', icon_name: 'zap', is_active: 1 },
  { id: 'tv-screen', name: '55" 4K Smart TV with Floor Stand', category: 'Audio & Visual', description: 'For brand video loops & digital presentation', unit: 'pcs', icon_name: 'tv', is_active: 1 },
  { id: 'display-rack', name: 'Fabric Hangers / Garment Display Rack', category: 'Exhibition Props', description: 'Sturdy metallic garment hanging rack', unit: 'pcs', icon_name: 'hanger', is_active: 1 },
  { id: 'brochure-stand', name: 'Acrylic Catalogue / Brochure Stand', category: 'Exhibition Props', description: 'Zig-zag portable brochure holder', unit: 'pcs', icon_name: 'file-text', is_active: 1 }
];

function readData(): Schema {
  const allowedList = REGISTERED_EXHIBITOR_MOBILES.map((m, idx) => ({
    id: idx + 1,
    mobile: m,
    notes: m === '9106139666' ? 'Demo Exhibitor Account' : 'Registered Exhibitor',
    created_at: new Date().toISOString()
  }));

  try {
    if (fs.existsSync(dbFile)) {
      const content = fs.readFileSync(dbFile, 'utf8');
      const parsed = JSON.parse(content);
      if (parsed.exhibitors && parsed.extra_products && parsed.exhibitor_orders) {
        return {
          allowed_exhibitors: allowedList,
          exhibitors: parsed.exhibitors,
          extra_products: parsed.extra_products,
          exhibitor_orders: parsed.exhibitor_orders
        };
      }
    }
  } catch {}

  // Initial Seed
  const initial: Schema = {
    allowed_exhibitors: allowedList,
    exhibitors: [],
    extra_products: defaultProducts,
    exhibitor_orders: []
  };

  saveData(initial);
  return initial;
}

function saveData(data: Schema) {
  try {
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to persist store JSON:', e);
  }
}

const STORE_ID = 'ff8081819f7e10ae019fd336b0567bfa';
const STORE_URL = `https://api.restful-api.dev/objects/${STORE_ID}`;
let remotePassMapCache: Record<string, string> | null = null;

export async function fetchRemotePasswords(): Promise<Record<string, string>> {
  try {
    const res = await fetch(STORE_URL, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.data && json.data.pass_map) {
        remotePassMapCache = json.data.pass_map;
        return json.data.pass_map;
      }
    }
  } catch (e) {
    console.error('Error fetching remote passwords:', e);
  }
  return remotePassMapCache || {};
}

export async function saveRemotePassword(mobile: string, customPass: string): Promise<boolean> {
  try {
    const currentMap = await fetchRemotePasswords();
    currentMap[mobile] = customPass;
    remotePassMapCache = currentMap;

    await fetch(STORE_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'ste_passwords',
        data: { pass_map: currentMap }
      })
    });
    return true;
  } catch (e) {
    console.error('Error saving remote password:', e);
    return false;
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
        if (q.includes('select items_json, special_notes')) {
          const target = String(args[0]);
          return data.exhibitor_orders.find(o => o.mobile === target);
        }
        if (q.includes('select id from exhibitor_orders where mobile = ?')) {
          const target = String(args[0]);
          return data.exhibitor_orders.find(o => o.mobile === target);
        }
        return undefined;
      },

      all(...args: any[]) {
        const data = readData();

        if (q.includes('from extra_products')) {
          return data.extra_products.filter(p => p.is_active === 1);
        }

        if (q.includes('from exhibitors e left join exhibitor_orders')) {
          return data.exhibitors.map(ex => {
            const order = data.exhibitor_orders.find(o => o.mobile === ex.mobile);
            return {
              mobile: ex.mobile,
              brand_name: ex.brand_name,
              stall_sqft: ex.stall_sqft,
              profile_updated: ex.updated_at,
              items_json: order ? order.items_json : null,
              special_notes: order ? order.special_notes : null,
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
              updated_at: new Date().toISOString()
            });
            saveData(data);
          }
          return { changes: 1 };
        }

        if (q.includes('update exhibitors set brand_name = ?, stall_sqft = ?')) {
          const brand_name = String(args[0]);
          const stall_sqft = String(args[1]);
          const mobile = String(args[2]);
          const ex = data.exhibitors.find(e => e.mobile === mobile);
          if (ex) {
            ex.brand_name = brand_name;
            ex.stall_sqft = stall_sqft;
            ex.updated_at = new Date().toISOString();
          } else {
            data.exhibitors.push({
              id: data.exhibitors.length + 1,
              mobile,
              brand_name,
              stall_sqft,
              updated_at: new Date().toISOString()
            });
          }
          saveData(data);
          return { changes: 1 };
        }

        if (q.includes('update exhibitors set custom_password = ?')) {
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

        if (q.includes('insert into exhibitors (mobile, brand_name, stall_sqft)')) {
          const mobile = String(args[0]);
          const brand_name = String(args[1]);
          const stall_sqft = String(args[2]);
          data.exhibitors.push({
            id: data.exhibitors.length + 1,
            mobile,
            brand_name,
            stall_sqft,
            updated_at: new Date().toISOString()
          });
          saveData(data);
          return { changes: 1 };
        }

        if (q.includes('update exhibitor_orders set items_json = ?, special_notes = ?')) {
          const items_json = String(args[0]);
          const special_notes = String(args[1]);
          const mobile = String(args[2]);
          const order = data.exhibitor_orders.find(o => o.mobile === mobile);
          if (order) {
            order.items_json = items_json;
            order.special_notes = special_notes;
            order.updated_at = new Date().toISOString();
          } else {
            data.exhibitor_orders.push({
              id: data.exhibitor_orders.length + 1,
              mobile,
              items_json,
              special_notes,
              updated_at: new Date().toISOString()
            });
          }
          saveData(data);
          return { changes: 1 };
        }

        if (q.includes('insert into exhibitor_orders (mobile, items_json, special_notes)')) {
          const mobile = String(args[0]);
          const items_json = String(args[1]);
          const special_notes = String(args[2]);
          data.exhibitor_orders.push({
            id: data.exhibitor_orders.length + 1,
            mobile,
            items_json,
            special_notes,
            updated_at: new Date().toISOString()
          });
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

        return { changes: 0 };
      }
    };
  }
};

export default db;
