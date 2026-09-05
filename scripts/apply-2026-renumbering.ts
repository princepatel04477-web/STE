/**
 * Push the 5 Sep 2026 renumbering (see stallAllotment2026.ts's own header)
 * onto every exhibitor's live profile, matched by mobile number.
 *
 * Only touches a profile whose stall_number actually changes, and only for
 * a brand this pass could place with confidence - the PENDING- rows (no
 * mobile match attempted) and any row without a mobile are left alone,
 * since there is nothing safe to write for them yet.
 *
 * A mobile with no existing profile gets one opened (mirrors
 * backfill-stall-numbers.ts), but only using registeredExhibitors.ts's own
 * spelling of the brand and size - that is the list the portal actually
 * lets people in on, so a profile opened here has to agree with it.
 *
 * SKIPPED explicitly: 9810550285 (Saraogi Super Sales). Their main record
 * is parked as PENDING-39 (2800 sqft anchor), but SSS_Numbers.xlsx also
 * gives stall 50 the same mobile - the small "SSS" sub-let unit inside
 * their own anchor. Writing 50 over their live 39 would be a real change
 * to their public number, not just a data-quality fix, so it needs an
 * explicit decision first rather than happening as a side effect of
 * registering the other 14 SSS sub-tenants.
 *
 * Safe to re-run: it writes the same values every time.
 *
 *   npx tsx --env-file=.env.local scripts/apply-2026-renumbering.ts          # dry run, prints the diff only
 *   npx tsx --env-file=.env.local scripts/apply-2026-renumbering.ts --write  # actually writes to Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { ALLOTMENTS_2026 } from '../src/data/stallAllotment2026';
import { findExhibitorByMobile } from '../src/data/registeredExhibitors';

const SKIP_MOBILES = new Set(['9810550285']);

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
    (a) => a.mobile && !a.unitId.startsWith('PENDING-') && !SKIP_MOBILES.has(a.mobile)
  );

  let changed = 0;
  let unchanged = 0;
  let opened = 0;
  let noProfile = 0;

  for (const a of rows) {
    const current = byMobile.get(a.mobile);
    const newValue = a.unitId;

    if (!current) {
      const reg = findExhibitorByMobile(a.mobile);
      if (!reg) {
        console.log(`  no exhibitor profile AND not on registeredExhibitors for ${a.mobile} (${a.brand})`);
        noProfile++;
        continue;
      }
      console.log(`  opening a profile for ${a.mobile} (${reg.brandName}) -> ${newValue}`);
      opened++;
      if (write) {
        const { error: insErr } = await db.from('exhibitors').insert({
          mobile: a.mobile,
          brand_name: reg.brandName,
          stall_sqft: reg.stallSqft,
          stall_number: newValue,
        });
        if (insErr) console.log(`    FAILED to open ${a.mobile}: ${insErr.message}`);
      }
      continue;
    }

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
    `\n${changed} profile(s) ${write ? 'updated' : 'would change'}, ${opened} ${write ? 'opened' : 'would open'}, ${unchanged} already correct, ${noProfile} with no matching profile.`
  );
  if (!write) console.log('Dry run only - pass --write to actually update Supabase.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
