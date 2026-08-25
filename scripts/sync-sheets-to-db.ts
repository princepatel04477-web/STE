import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { REGISTERED_EXHIBITORS_LIST } from '../src/data/registeredExhibitors';

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
  console.error('❌ Supabase credentials missing in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

async function syncDailyMasterData() {
  console.log('🔄 Syncing master exhibitors list with Supabase database...');

  const allowedRows = REGISTERED_EXHIBITORS_LIST.map((reg) => ({
    mobile: reg.mobile,
    notes: `${reg.brandName} (${reg.stallSqft})`,
    created_at: new Date().toISOString()
  }));

  const { error: allowErr } = await supabase
    .from('allowed_exhibitors')
    .upsert(allowedRows, { onConflict: 'mobile' });

  if (allowErr) {
    console.error('❌ Error updating allowed_exhibitors:', allowErr.message);
  } else {
    console.log(`✓ Synchronized ${allowedRows.length} whitelisted exhibitors in Supabase.`);
  }

  const exhibitorRows = REGISTERED_EXHIBITORS_LIST.map((reg) => ({
    mobile: reg.mobile,
    brand_name: reg.brandName,
    stall_sqft: reg.stallSqft,
    fascia_names_json: [reg.brandName, '', '', ''],
    updated_at: new Date().toISOString()
  }));

  const { error: exErr } = await supabase
    .from('exhibitors')
    .upsert(exhibitorRows, { onConflict: 'mobile' });

  if (exErr) {
    console.error('❌ Error updating exhibitors:', exErr.message);
  } else {
    console.log(`✓ Synchronized ${exhibitorRows.length} exhibitor profiles in Supabase.`);
  }

  console.log('🎉 Database sync complete!');
}

syncDailyMasterData().catch(console.error);
