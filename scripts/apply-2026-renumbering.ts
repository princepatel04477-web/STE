/**
 * Push the 5 Sep 2026 renumbering (see stallAllotment2026.ts's own header)
 * onto every exhibitor's live profile, matched by mobile number.
 *
 * Only touches a profile whose stall_number actually changes, and only for
 * a brand this pass could place with confidence - the ten PENDING- rows
 * (no mobile match attempted) and any row without a mobile are left alone,
 * since there is nothing safe to write for them yet.
 *
 * Safe to re-run: it writes the same values every time.
 *
 *   npx tsx --env-file=.env.local scripts/apply-2026-renumbering.ts          # dry run, prints the diff only
 *   npx tsx --env-file=.env.local scripts/apply-2026-renumbering.ts --write  # actually writes to Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { ALLOTMENTS_2026 } from '../src/data/stallAllotment2026';

async function main() {
  const write = process.argv.includes('--write');

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: exhibitors, error } = await db
    .from('exhibitors')
    .select('mobile, brand_name, stall_number');
  if (error) throw new Error(error.message);

  const byMobile = new Map((exhibitors ?? []).map((e) => [e.mobile, e]));

  const rows = ALLOTMENTS_2026.filter(
    (a) => a.mobile && !a.unitId.startsWith('PENDING-')
  );

  let changed = 0;
  let unchanged = 0;
  let noProfile = 0;

  for (const a of rows) {
    const current = byMobile.get(a.mobile);
    if (!current) {
      console.log(`  no exhibitor profile for ${a.mobile} (${a.brand})`);
      noProfile++;
      continue;
    }
    const newValue = a.unitId;
    if (String(current.stall_number ?? '') === newValue) {
      unchanged++;
      continue;
    }
    console.log(
      `  ${a.mobile} (${current.brand_name || a.brand}): ${current.stall_number || '(none)'} -> ${newValue}`
    );
    changed++;
    if (write) {
      const { error: upErr } = await db
        .from('exhibitors')
        .update({ stall_number: newValue })
        .eq('mobile', a.mobile);
      if (upErr) console.log(`    FAILED: ${upErr.message}`);
    }
  }

  console.log(
    `\n${changed} profile(s) ${write ? 'updated' : 'would change'}, ${unchanged} already correct, ${noProfile} with no matching profile.`
  );
  if (!write) console.log('Dry run only - pass --write to actually update Supabase.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
