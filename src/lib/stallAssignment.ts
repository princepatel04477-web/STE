/**
 * The exhibitor's allotted stall: one writer, one reader.
 *
 * The draw records itself in lottery_allocations. recordStallAllocation() is
 * the single function that copies the stall onto the exhibitor's own row, so
 * the dashboard, the admin sheet and the invoice all read a stall number
 * without going back to the draw table. It runs on every draw and again
 * whenever a stall is read, so a stall allotted before this existed is written
 * the first time its owner is looked up.
 *
 * A firm known by more than one number is one exhibitor (see
 * registeredExhibitors), so both sides work off every number it answers to.
 */

import db, { LotteryAllocationRecord } from '@/lib/db';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import {
  canonicalMobile,
  findExhibitorByMobile,
  numbersFor,
} from '@/data/registeredExhibitors';

/** Every number this exhibitor's records could be filed under. */
export function allNumbersFor(mobile: string): string[] {
  const reg = findExhibitorByMobile(mobile);
  return reg ? numbersFor(reg) : [mobile];
}

/**
 * The stall an exhibitor holds, or null if they have not drawn.
 *
 * The cloud table is the source of truth - the local store is wiped per
 * instance on Vercel - so it answers first and the local copy is the fallback.
 */
export async function getStallForExhibitor(
  mobile: string
): Promise<LotteryAllocationRecord | null> {
  const numbers = allNumbersFor(mobile);

  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      // Ordered, so the answer cannot change between two reads. A firm should
      // only ever have one row, but if a second one exists under another of
      // its numbers the earliest draw is the one that stands - unordered, the
      // database is free to return either, and the exhibitor watches their
      // stall number change from one refresh to the next.
      const { data, error } = await supabaseAdmin
        .from('lottery_allocations')
        .select('*')
        .in('mobile', numbers)
        .order('allocated_at', { ascending: true });
      if (error) throw error;

      // An answer, including "none". The local store is not consulted after
      // one: it lives in /tmp per instance, so a draw the organisers have
      // since reset can survive there and would otherwise be handed back as
      // the exhibitor's stall long after it stopped being theirs.
      return (data?.[0] as LotteryAllocationRecord) ?? null;
    } catch (err) {
      console.warn('[Stall] Cloud lookup failed, falling back locally:', err);
    }
  }

  for (const number of numbers) {
    const local = db
      .prepare('SELECT * FROM lottery_allocations WHERE mobile = ?')
      .get(number) as LotteryAllocationRecord | undefined;
    if (local) return local;
  }
  return null;
}

/**
 * Write an allotted stall onto the exhibitor's profile.
 *
 * Safe to call repeatedly: it writes the same values, and it is a no-op once
 * the row already carries this stall. The stall columns are added by
 * migration 20260827000006; until that has run the cloud write is skipped and
 * only the local copy is kept, so nothing here can break a draw.
 */
export async function recordStallAllocation(
  allocation: LotteryAllocationRecord | null | undefined
): Promise<void> {
  if (!allocation?.stall_number) return;

  const mobile = canonicalMobile(allocation.mobile);
  const fields = {
    stall_number: allocation.stall_number,
    stall_hall: allocation.hall || '',
    stall_zone: allocation.zone || '',
    stall_dimensions: allocation.dimensions || '',
    stall_allocated_at: allocation.allocated_at || new Date().toISOString(),
  };

  // Local store, so a dev run and the offline fallback agree with the cloud.
  try {
    const existing = db
      .prepare('SELECT * FROM exhibitors WHERE mobile = ?')
      .get(mobile) as Record<string, unknown> | undefined;
    if (existing) {
      db.prepare(
        `UPDATE exhibitors SET stall_number = ?, stall_hall = ?, stall_zone = ?,
         stall_dimensions = ?, stall_allocated_at = ? WHERE mobile = ?`
      ).run(
        fields.stall_number,
        fields.stall_hall,
        fields.stall_zone,
        fields.stall_dimensions,
        fields.stall_allocated_at,
        mobile
      );
    }
  } catch (err) {
    console.warn('[Stall] Local write skipped:', err);
  }

  if (!isSupabaseConfigured || !supabaseAdmin) return;

  try {
    const { data: updated, error } = await supabaseAdmin
      .from('exhibitors')
      .update(fields)
      .eq('mobile', mobile)
      .select('mobile');

    if (error) {
      // 42703 / PGRST204: the stall columns are missing (migration
      // 20260827000006). The draw itself is already safe in
      // lottery_allocations, so this is a warning, not a failure.
      console.warn(
        `[Stall] Could not write stall ${allocation.stall_number} onto ${mobile}: ${error.message}`
      );
      return;
    }

    // An exhibitor can draw before ever saving a profile, so there may be no
    // row to update yet. Open one, carrying what the master sheet knows.
    if (!updated?.length) {
      const reg = findExhibitorByMobile(mobile);
      const { error: insertErr } = await supabaseAdmin.from('exhibitors').insert({
        mobile,
        brand_name: reg?.brandName ?? allocation.brand_name ?? '',
        stall_sqft: reg?.stallSqft ?? allocation.stall_sqft ?? '',
        ...fields,
      });
      if (insertErr) {
        console.warn(
          `[Stall] Could not open a profile for ${mobile}: ${insertErr.message}`
        );
      }
    }
  } catch (err) {
    console.warn('[Stall] Cloud write failed:', err);
  }
}

/**
 * Take the stall back off an exhibitor's profile.
 *
 * The other half of recordStallAllocation: a reset that removed the draw has
 * to remove the copy too, or the exhibitor keeps seeing a stall that is no
 * longer theirs. Pass no mobile to clear every profile, which is what a full
 * reset of the draw needs.
 */
export async function clearStallAllocation(mobile?: string): Promise<void> {
  const blank = {
    stall_number: '',
    stall_hall: '',
    stall_zone: '',
    stall_dimensions: '',
    stall_allocated_at: null,
  };

  const targets = mobile ? [canonicalMobile(mobile)] : [];

  try {
    for (const target of targets) {
      db.prepare(
        `UPDATE exhibitors SET stall_number = ?, stall_hall = ?, stall_zone = ?,
         stall_dimensions = ?, stall_allocated_at = ? WHERE mobile = ?`
      ).run('', '', '', '', '', target);
    }
  } catch (err) {
    console.warn('[Stall] Local clear skipped:', err);
  }

  if (!isSupabaseConfigured || !supabaseAdmin) return;

  try {
    const query = supabaseAdmin.from('exhibitors').update(blank);
    const { error } = mobile
      ? await query.eq('mobile', targets[0])
      : await query.neq('stall_number', '');
    if (error) {
      console.warn(`[Stall] Could not clear the stall copy: ${error.message}`);
    }
  } catch (err) {
    console.warn('[Stall] Cloud clear failed:', err);
  }
}

/**
 * The stall an exhibitor holds, written onto their profile on the way out.
 *
 * This is what the portal calls: it answers "which stall is theirs?" and
 * leaves the profile up to date as a side effect.
 */
export async function resolveAndRecordStall(
  mobile: string
): Promise<LotteryAllocationRecord | null> {
  const allocation = await getStallForExhibitor(mobile);
  if (allocation) await recordStallAllocation(allocation);
  return allocation;
}
