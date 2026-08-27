/**
 * Write every stall already drawn onto its exhibitor's profile.
 *
 * recordStallAllocation() does this on each draw from now on; this walks the
 * draws that happened before it existed. Safe to re-run - it writes the same
 * values - and it never touches a stall the draw table does not carry.
 *
 *   npx tsx --env-file=.env.local scripts/backfill-stall-numbers.ts
 */

import { createClient } from '@supabase/supabase-js';
import {
  findExhibitorByMobile,
  canonicalMobile,
} from '../src/data/registeredExhibitors';

async function main() {
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: allocations, error } = await db
    .from('lottery_allocations')
    .select('*');
  if (error) throw new Error(error.message);

  console.log(`${allocations?.length ?? 0} draw(s) on record`);

  let written = 0;
  let unknown = 0;

  for (const a of allocations ?? []) {
    if (!findExhibitorByMobile(a.mobile)) {
      console.log(`  skipped ${a.mobile} (${a.brand_name}) - not on the master sheet`);
      unknown++;
      continue;
    }

    // A draw made on a second number belongs to the sheet's own number.
    const mobile = canonicalMobile(a.mobile);
    const fields = {
      stall_number: a.stall_number,
      stall_hall: a.hall ?? '',
      stall_zone: a.zone ?? '',
      stall_dimensions: a.dimensions ?? '',
      stall_allocated_at: a.allocated_at,
    };

    const { data: updated, error: upErr } = await db
      .from('exhibitors')
      .update(fields)
      .eq('mobile', mobile)
      .select('mobile');

    if (upErr) {
      console.log(`  FAILED ${mobile} -> ${a.stall_number}: ${upErr.message}`);
      continue;
    }

    // Drew without ever saving a profile: open the row from the master sheet.
    if (!updated?.length) {
      const reg = findExhibitorByMobile(mobile);
      const { error: insErr } = await db.from('exhibitors').insert({
        mobile,
        brand_name: reg?.brandName ?? a.brand_name ?? '',
        stall_sqft: reg?.stallSqft ?? a.stall_sqft ?? '',
        ...fields,
      });
      if (insErr) {
        console.log(`  FAILED to open ${mobile}: ${insErr.message}`);
        continue;
      }
      console.log(`  opened a profile for ${mobile} (${reg?.brandName}) -> ${a.stall_number}`);
    }
    written++;
  }

  console.log(`wrote ${written} stall number(s); ${unknown} draw(s) belong to nobody on the sheet`);

  const { count } = await db
    .from('exhibitors')
    .select('mobile', { count: 'exact', head: true })
    .neq('stall_number', '');
  console.log(`profiles now carrying a stall number: ${count ?? 0}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
