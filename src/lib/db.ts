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

interface Schema {
  allowed_exhibitors: Array<{ id: number; mobile: string; notes: string; created_at: string }>;
  exhibitors: Array<{ id: number; mobile: string; brand_name: string; stall_sqft: string; updated_at: string }>;
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
  try {
    if (fs.existsSync(dbFile)) {
      const content = fs.readFileSync(dbFile, 'utf8');
      const parsed = JSON.parse(content);
      if (parsed.allowed_exhibitors && parsed.exhibitors && parsed.extra_products && parsed.exhibitor_orders) {
        return parsed;
      }
    }
  } catch {}

  // Initial Seed
  const initial: Schema = {
    allowed_exhibitors: [{ id: 1, mobile: '9106139666', notes: 'Demo Exhibitor Account', created_at: new Date().toISOString() }],
    exhibitors: [],
    extra_products: defaultProducts,
    exhibitor_orders: []
  };

  // Seed registered numbers file if present
  try {
    const numbersFile = path.join(process.cwd(), 'STE-Registerd-Mobile-Numbers.md');
    if (fs.existsSync(numbersFile)) {
      const fileData = fs.readFileSync(numbersFile, 'utf8');
      const lines = fileData.split(/\r?\n/);
      let idCounter = 2;
      const seen = new Set(['9106139666']);
      lines.forEach(line => {
        const clean = line.replace(/\D/g, '');
        if (clean.length >= 10) {
          const mob = clean.slice(-10);
          if (!seen.has(mob)) {
            seen.add(mob);
            initial.allowed_exhibitors.push({
              id: idCounter++,
              mobile: mob,
              notes: 'Registered Exhibitor',
              created_at: new Date().toISOString()
            });
          }
        }
      });
    }
  } catch {}

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
