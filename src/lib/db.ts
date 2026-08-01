import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'ste_exhibitors.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS allowed_exhibitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mobile TEXT UNIQUE NOT NULL,
    notes TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS exhibitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mobile TEXT UNIQUE NOT NULL,
    brand_name TEXT DEFAULT '',
    stall_sqft TEXT DEFAULT '',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS extra_products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT DEFAULT '',
    unit TEXT DEFAULT 'pcs',
    icon_name TEXT DEFAULT 'box',
    is_active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS exhibitor_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mobile TEXT UNIQUE NOT NULL,
    items_json TEXT NOT NULL,
    special_notes TEXT DEFAULT '',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed initial default products if table is empty
const productCount = db.prepare('SELECT COUNT(*) as count FROM extra_products').get() as { count: number };
if (productCount.count === 0) {
  const insertProduct = db.prepare(
    'INSERT INTO extra_products (id, name, category, description, unit, icon_name) VALUES (?, ?, ?, ?, ?, ?)'
  );

  const defaultProducts = [
    { id: 'sofa-2seater', name: 'VIP 2-Seater Leather Sofa', category: 'Furniture', description: 'Luxury black/white leather sofa for lounge area', unit: 'pcs', icon_name: 'sofa' },
    { id: 'sofa-single', name: 'Single Seater Armchair', category: 'Furniture', description: 'Comfortable plush lounge chair', unit: 'pcs', icon_name: 'chair' },
    { id: 'exhibition-chair', name: 'Standard Visitor Chair', category: 'Furniture', description: 'Cushioned stackable chair for meeting tables', unit: 'pcs', icon_name: 'chair' },
    { id: 'glass-table', name: 'Round Glass Meeting Table', category: 'Furniture', description: 'High-end glass top table for discussion', unit: 'pcs', icon_name: 'table' },
    { id: 'reception-counter', name: 'Lockable Counter Table', category: 'Furniture', description: 'Wooden reception counter with lockable storage', unit: 'pcs', icon_name: 'table' },
    { id: 'female-model', name: 'Promotional Female Model / Hostess', category: 'Manpower & Models', description: 'Professional booth host for greeting & assisting visitors (Per Day)', unit: 'person/day', icon_name: 'user' },
    { id: 'male-model', name: 'Promotional Male Model / Host', category: 'Manpower & Models', description: 'Professional booth host for greeting & product demo (Per Day)', unit: 'person/day', icon_name: 'user' },
    { id: 'spot-light', name: 'LED Yellow/White Spotlight (50W)', category: 'Lighting & Electric', description: 'High brightness spotlight for highlighting fabric displays', unit: 'pcs', icon_name: 'lightbulb' },
    { id: 'power-socket', name: '5A / 15A Power Socket Connection', category: 'Lighting & Electric', description: 'Multi-plug electrical power extension point', unit: 'point', icon_name: 'zap' },
    { id: 'tv-screen', name: '55" 4K Smart TV with Floor Stand', category: 'Audio & Visual', description: 'For brand video loops & digital presentation', unit: 'pcs', icon_name: 'tv' },
    { id: 'display-rack', name: 'Fabric Hangers / Garment Display Rack', category: 'Exhibition Props', description: 'Sturdy metallic garment hanging rack', unit: 'pcs', icon_name: 'hanger' },
    { id: 'brochure-stand', name: 'Acrylic Catalogue / Brochure Stand', category: 'Exhibition Props', description: 'Zig-zag portable brochure holder', unit: 'pcs', icon_name: 'file-text' }
  ];

  const insertMany = db.transaction((products) => {
    for (const p of products) {
      insertProduct.run(p.id, p.name, p.category, p.description, p.unit, p.icon_name);
    }
  });

  insertMany(defaultProducts);
}

export default db;
