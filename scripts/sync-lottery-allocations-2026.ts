/**
 * Make the live lottery_allocations table agree with the 5 Sep 2026
 * renumbering - this is the table /api/exhibitor/profile actually re-derives
 * a stall number from on every load (getStallForExhibitor), so writing
 * stall_number onto exhibitors alone (apply-2026-renumbering.ts) never
 * reaches a real exhibitor's dashboard: a lottery_allocations row, once it
 * exists, wins over that copy every time.
 *
 * For a mobile with an existing row: updates stall_number/hall/zone/
 * dimensions if they differ, keeps everything else (slip_id, allocated_at,
 * is_corner, shape) untouched - a slip already printed keeps its own id.
 *
 * For a mobile with no row at all (a held/hand-placed stall, or a firm that
 * was never part of the live draw - the 14 SSS sub-tenants, for example):
 * opens one, so resolveAndRecordStall() has something to find. is_corner
 * and shape are set to safe, inert defaults (0 / "Linear") since nothing
 * here is drawing for real - only recording where the organisers have
 * already put someone.
 *
 * Explicitly SKIPPED: 9810550285 (Saraogi Super Sales) - see
 * apply-2026-renumbering.ts's own header for why their number is not
 * touched yet.
 *
 * Safe to re-run.
 *
 *   npx tsx --env-file=.env.local scripts/sync-lottery-allocations-2026.ts          # dry run
 *   npx tsx --env-file=.env.local scripts/sync-lottery-allocations-2026.ts --write  # write to Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { ALLOTMENTS_2026 } from '../src/data/stallAllotment2026';

const SKIP_MOBILES = new Set(['9810550285']);

function slipId(mobile: string, stallNumber: string): string {
  const last4 = mobile.slice(-4);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `STE-2026-${stallNumber}-${last4}-${rand}`;
}

async function main() {
  const write = process.argv.includes('--write');

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { data: allocations, error } = await db.from('lottery_allocations').select('*');
  if (error) throw new Error(error.message);
  // A firm can be on record under a login mobile that differs from its own
  // firm_mobile (getStallForExhibitor matches on either) - index both so a
  // row like that is still found as "existing" rather than double-booked.
  const byMobile = new Map<string, (typeof allocations)[number]>();
  for (const r of allocations ?? []) {
    byMobile.set(r.mobile, r);
    if (r.firm_mobile && !byMobile.has(r.firm_mobile)) byMobile.set(r.firm_mobile, r);
  }

  const rows = ALLOTMENTS_2026.filter(
    (a) => a.mobile && !a.unitId.startsWith('PENDING-') && !SKIP_MOBILES.has(a.mobile)
  );

  const toUpdate = rows.filter((a) => byMobile.has(a.mobile));
  const toInsert = rows.filter((a) => !byMobile.has(a.mobile));

  console.log(`${toUpdate.length} existing row(s) to check, ${toInsert.length} to insert.`);

  // Phase 1: every existing row that is about to move parks on a unique,
  // never-a-real-stall-number placeholder first. stall_number carries a
  // UNIQUE constraint, so reassigning A's old number to B before A has let
  // go of it fails outright - parking everyone first frees every number
  // this pass touches in one pass, with no ordering to get right.
  if (write) {
    for (const a of toUpdate) {
      const existing = byMobile.get(a.mobile)!;
      if (String(existing.stall_number) === a.unitId) continue; // already there, nothing to park
      const { error: parkErr } = await db
        .from('lottery_allocations')
        .update({ stall_number: `TMP-${a.mobile}` })
        .eq('mobile', existing.mobile);
      if (parkErr) console.log(`  PARK FAILED for ${a.mobile}: ${parkErr.message}`);
    }
  }

  let updated = 0;
  let unchanged = 0;
  let blocked = 0;

  // Phase 2: everyone lands on their real final number.
  for (const a of toUpdate) {
    const existing = byMobile.get(a.mobile)!;
    const newValue = a.unitId;
    const hall = a.zone;
    const zoneDesc = `${a.pool} · ${a.pool === 'Saree' ? 'Saree pool' : 'General pool'}`;
    const dimensions = a.sheetSize;

    if (
      String(existing.stall_number) === newValue &&
      existing.hall === hall &&
      existing.zone === zoneDesc &&
      existing.dimensions === dimensions
    ) {
      unchanged++;
      continue;
    }
    console.log(
      `  UPDATE ${a.mobile} (${existing.brand_name || a.brand}): stall ${existing.stall_number} -> ${newValue}`
    );
    updated++;
    if (write) {
      const { error: upErr } = await db
        .from('lottery_allocations')
        .update({ stall_number: newValue, hall, zone: zoneDesc, dimensions })
        .eq('mobile', existing.mobile);
      if (upErr) {
        console.log(`    FAILED (still parked on TMP-${a.mobile}): ${upErr.message}`);
        blocked++;
      }
    }
  }

  let inserted = 0;
  for (const a of toInsert) {
    const newValue = a.unitId;
    const hall = a.zone;
    const zoneDesc = `${a.pool} · ${a.pool === 'Saree' ? 'Saree pool' : 'General pool'}`;
    const dimensions = a.sheetSize;
    console.log(`  INSERT ${a.mobile} (${a.brand}) -> stall ${newValue}`);
    inserted++;
    if (write) {
      const { error: insErr } = await db.from('lottery_allocations').insert({
        mobile: a.mobile,
        brand_name: a.brand,
        stall_sqft: String(a.areaSqft),
        stall_number: newValue,
        is_corner: 0,
        shape: 'Linear',
        hall,
        zone: zoneDesc,
        dimensions,
        slip_id: slipId(a.mobile, newValue),
        allocated_at: new Date().toISOString(),
        firm_mobile: a.mobile,
      });
      if (insErr) {
        console.log(`    FAILED (not inserted - stall ${newValue} still taken): ${insErr.message}`);
        blocked++;
        inserted--;
      }
    }
  }

  console.log(
    `\n${updated} row(s) ${write ? 'updated' : 'would update'}, ${inserted} ${write ? 'inserted' : 'would insert'}, ${unchanged} already correct${write ? `, ${blocked} blocked (see FAILED lines above)` : ''}.`
  );
  if (!write) console.log('Dry run only - pass --write to actually update Supabase.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
