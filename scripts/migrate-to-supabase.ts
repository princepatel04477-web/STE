import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { REGISTERED_EXHIBITORS_LIST } from '../src/data/registeredExhibitors';

// Simple .env parser to load .env.local if not already in process.env
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const p = path.join(process.cwd(), file);
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf-8');
      content.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const idx = trimmed.indexOf('=');
          const k = trimmed.slice(0, idx).trim();
          let v = trimmed.slice(idx + 1).trim();
          if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
            v = v.slice(1, -1);
          }
          if (!process.env[k]) {
            process.env[k] = v;
          }
        }
      });
    }
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('\n❌ ERROR: Supabase credentials missing.');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local or environment variables.\n');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

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

async function runMigration() {
  console.log('=====================================================');
  console.log('🚀 Surat Textile Expo 2026 -> Supabase Migration CLI');
  console.log('=====================================================');
  console.log(`Target Supabase URL: ${SUPABASE_URL}\n`);

  // Read local store if available
  const storePath = path.join(process.cwd(), 'data', 'ste_store.json');
  const passPath = path.join(process.cwd(), 'data', 'ste_passwords.json');

  let localStore: any = {
    allowed_exhibitors: [],
    exhibitors: [],
    extra_products: defaultProducts,
    exhibitor_orders: [],
    lottery_allocations: []
  };

  let passwordsMap: Record<string, string> = {};

  if (fs.existsSync(storePath)) {
    try {
      localStore = JSON.parse(fs.readFileSync(storePath, 'utf-8'));
    } catch (e) {
      console.warn('⚠️ Could not parse data/ste_store.json, using defaults.');
    }
  }

  if (fs.existsSync(passPath)) {
    try {
      passwordsMap = JSON.parse(fs.readFileSync(passPath, 'utf-8'));
    } catch {}
  }

  // 1. Migrate Whitelisted Exhibitors
  console.log('📦 Step 1: Migrating Allowed Exhibitors whitelist...');
  const allowedMobiles = Array.from(new Set([
    ...REGISTERED_EXHIBITORS_LIST.map((r) => r.mobile),
    ...(localStore.allowed_exhibitors || []).map((a: any) => a.mobile)
  ]));

  const allowedData = allowedMobiles.map((mob) => {
    const existing = (localStore.allowed_exhibitors || []).find((a: any) => a.mobile === mob);
    const reg = REGISTERED_EXHIBITORS_LIST.find((r) => r.mobile === mob);
    return {
      mobile: mob,
      notes: existing?.notes || (reg ? `${reg.brandName} (${reg.stallSqft})` : 'Pre-whitelisted exhibitor'),
      created_at: existing?.created_at || new Date().toISOString()
    };
  });

  const { error: allowedErr } = await supabase
    .from('allowed_exhibitors')
    .upsert(allowedData, { onConflict: 'mobile' });

  if (allowedErr) {
    console.error('❌ Failed to migrate allowed_exhibitors:', allowedErr.message);
  } else {
    console.log(`✓ Successfully migrated ${allowedData.length} whitelisted exhibitors.`);
  }

  // 2. Migrate Extra Products
  console.log('\n📦 Step 2: Migrating Extra Products catalogue...');
  const { error: prodErr } = await supabase
    .from('extra_products')
    .upsert(defaultProducts, { onConflict: 'id' });

  if (prodErr) {
    console.error('❌ Failed to migrate extra_products:', prodErr.message);
  } else {
    console.log(`✓ Successfully migrated ${defaultProducts.length} extra rental products.`);
  }

  // 3. Migrate Exhibitors Profiles & Master list
  console.log('\n📦 Step 3: Migrating Exhibitors Profiles...');
  const exhibitorsToInsert: any[] = [];

  // Start with all registered exhibitors from master list
  REGISTERED_EXHIBITORS_LIST.forEach((reg) => {
    const localEx = (localStore.exhibitors || []).find((e: any) => e.mobile === reg.mobile);
    const customPass = passwordsMap[reg.mobile] || localEx?.custom_password;
    
    let fasciaNames = [reg.brandName, '', '', ''];
    if (localEx?.fascia_names_json) {
      try {
        fasciaNames = typeof localEx.fascia_names_json === 'string'
          ? JSON.parse(localEx.fascia_names_json)
          : localEx.fascia_names_json;
      } catch {}
    }

    exhibitorsToInsert.push({
      mobile: reg.mobile,
      brand_name: localEx?.brand_name || reg.brandName,
      stall_sqft: localEx?.stall_sqft || reg.stallSqft,
      custom_password: customPass || null,
      fascia_names_json: fasciaNames,
      logo_file_url: localEx?.logo_file_url || null,
      cdr_file_url: localEx?.cdr_file_url || null,
      drive_file_url: localEx?.drive_file_url || null,
      drive_folder_id: localEx?.drive_folder_id || null,
      drive_folder_url: localEx?.drive_folder_url || null,
      updated_at: localEx?.updated_at || new Date().toISOString()
    });
  });

  // Also include any exhibitors in local store not in REGISTERED_EXHIBITORS
  (localStore.exhibitors || []).forEach((e: any) => {
    if (!exhibitorsToInsert.some((x) => x.mobile === e.mobile)) {
      exhibitorsToInsert.push({
        mobile: e.mobile,
        brand_name: e.brand_name || '',
        stall_sqft: e.stall_sqft || '',
        custom_password: passwordsMap[e.mobile] || e.custom_password || null,
        fascia_names_json: e.fascia_names_json || [],
        logo_file_url: e.logo_file_url || null,
        cdr_file_url: e.cdr_file_url || null,
        drive_file_url: e.drive_file_url || null,
        drive_folder_id: e.drive_folder_id || null,
        drive_folder_url: e.drive_folder_url || null,
        updated_at: e.updated_at || new Date().toISOString()
      });
    }
  });

  const { error: exErr } = await supabase
    .from('exhibitors')
    .upsert(exhibitorsToInsert, { onConflict: 'mobile' });

  if (exErr) {
    console.error('❌ Failed to migrate exhibitors:', exErr.message);
  } else {
    console.log(`✓ Successfully migrated ${exhibitorsToInsert.length} exhibitor profiles.`);
  }

  // 4. Migrate Orders
  console.log('\n📦 Step 4: Migrating Exhibitor Orders...');
  if (localStore.exhibitor_orders && localStore.exhibitor_orders.length > 0) {
    const ordersData = localStore.exhibitor_orders.map((o: any) => ({
      mobile: o.mobile,
      items_json: typeof o.items_json === 'string' ? JSON.parse(o.items_json) : (o.items_json || []),
      special_notes: o.special_notes || '',
      owner_badges: o.owner_badges || 0,
      sales_badges: o.sales_badges || 0,
      support_badges: o.support_badges || 0,
      badge_names_json: typeof o.badge_names_json === 'string' ? JSON.parse(o.badge_names_json) : (o.badge_names_json || {}),
      rental_days: o.rental_days || 2,
      updated_at: o.updated_at || new Date().toISOString()
    }));

    const { error: orderErr } = await supabase
      .from('exhibitor_orders')
      .upsert(ordersData, { onConflict: 'mobile' });

    if (orderErr) {
      console.error('❌ Failed to migrate exhibitor_orders:', orderErr.message);
    } else {
      console.log(`✓ Successfully migrated ${ordersData.length} orders.`);
    }
  } else {
    console.log('✓ No existing orders found to migrate.');
  }

  // 5. Migrate Stall Lottery Allocations
  console.log('\n📦 Step 5: Migrating Stall Lottery Allocations...');
  if (localStore.lottery_allocations && localStore.lottery_allocations.length > 0) {
    const allocData = localStore.lottery_allocations.map((l: any) => ({
      mobile: l.mobile,
      brand_name: l.brand_name,
      stall_sqft: l.stall_sqft,
      stall_number: l.stall_number,
      is_corner: l.is_corner ? 1 : 0,
      shape: l.shape || 'Linear',
      hall: l.hall,
      zone: l.zone,
      dimensions: l.dimensions,
      slip_id: l.slip_id,
      allocated_at: l.allocated_at || new Date().toISOString()
    }));

    const { error: allocErr } = await supabase
      .from('lottery_allocations')
      .upsert(allocData, { onConflict: 'mobile' });

    if (allocErr) {
      console.error('❌ Failed to migrate lottery_allocations:', allocErr.message);
    } else {
      console.log(`✓ Successfully migrated ${allocData.length} stall allocations.`);
    }
  } else {
    console.log('✓ No existing lottery allocations found to migrate.');
  }

  // 6. Ensure Storage Bucket
  console.log('\n📦 Step 6: Checking Supabase Storage bucket (exhibitor-assets)...');
  try {
    const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
    if (!bErr && buckets) {
      const exists = buckets.some((b) => b.name === 'exhibitor-assets');
      if (!exists) {
        const { error: createErr } = await supabase.storage.createBucket('exhibitor-assets', {
          public: true,
          fileSizeLimit: 52428800 // 50MB
        });
        if (createErr) {
          console.warn('⚠️ Could not create storage bucket via API (create in Supabase dashboard if needed):', createErr.message);
        } else {
          console.log('✓ Created "exhibitor-assets" storage bucket.');
        }
      } else {
        console.log('✓ Storage bucket "exhibitor-assets" is ready.');
      }
    }
  } catch (err: any) {
    console.warn('⚠️ Note on Storage bucket check:', err.message);
  }

  console.log('\n=====================================================');
  console.log('🎉 Migration completed successfully!');
  console.log('=====================================================\n');
}

runMigration().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
