import db, { LotteryAllocationRecord } from '@/lib/db';
import { normalizeExhibitorId } from '@/lib/exhibitorId';
import {
  DrawUnit,
  blockFor,
  drawStall,
  heldUnitFor
} from '@/lib/drawEngine2026';

/**
 * What the caller already knows from the cloud database.
 *
 * The local store lives in /tmp on Vercel, which is per-instance and wiped
 * between cold starts, so it can never be trusted to answer "has this
 * exhibitor already drawn?". The route reads Supabase first and hands the
 * answer down here.
 */
export interface DrawContext {
  /**
   * The allocation already on record for this exhibitor.
   *
   * `null` means the cloud has been asked and there is none - which is not
   * the same as not knowing, so the local store is not consulted. A local row
   * can outlive a reset on another instance, and trusting it would hand back
   * a stall that now belongs to someone else. Leave undefined only when there
   * is no cloud to ask.
   */
  existing?: LotteryAllocationRecord | null;
  /**
   * Every stall number already allotted, from the cloud database.
   *
   * Authoritative when present: the local store is not merged in, because a
   * stall left behind on one instance would be withheld from the whole floor
   * and can exhaust a block that is in fact free.
   */
  taken?: string[];
}

export interface LotteryResult {
  success: boolean;
  isExisting: boolean;
  allocation?: LotteryAllocationRecord;
  error?: string;
}

export function generateSlipId(mobile: string, stallNumber: string): string {
  const cleanMob = mobile.slice(-4);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `STE-2026-${stallNumber}-${cleanMob}-${randomSuffix}`;
}

/**
 * Executes a deterministic / locked random lucky draw for an exhibitor.
 * Respects:
 * 1. Exactly one lucky draw per registered exhibitor (idempotent).
 * 2. Corner / L-Shape preference for stalls >= 600 sq ft (600, 800, 1000+ sq ft).
 * 3. Atomic collision avoidance across concurrent draws.
 */
export function performLuckyDraw(
  mobile: string,
  brandName: string,
  rawSqft: string | number,
  context: DrawContext = {}
): LotteryResult {
  const cleanMobile = normalizeExhibitorId(mobile);

  if (!cleanMobile) {
    return {
      success: false,
      isExisting: false,
      error: 'A registered 10-digit mobile number or user ID is required.'
    };
  }

  // 1. Check if already drawn. One exhibitor draws exactly once, so the cloud
  //    record wins over the local store, which may be an empty cold instance.
  const existing =
    context.existing !== undefined
      ? context.existing
      : (db.prepare('SELECT * FROM lottery_allocations WHERE mobile = ?')
          .get(cleanMobile) as LotteryAllocationRecord | undefined);

  if (existing) {
    return {
      success: true,
      isExisting: true,
      allocation: existing
    };
  }

  // 2. Find the exhibitor's block on the 2026 floor plan and draw inside it.
  //    The block is their pool, their booked size and their trade group, so a
  //    draw can only ever return a stall of the right size standing among the
  //    same trade.
  const held = heldUnitFor(cleanMobile, brandName);
  const occupied =
    context.taken ??
    ((db.prepare('SELECT stall_number FROM lottery_allocations')
      .all() as Array<{ stall_number: string }>) || []).map((a) => a.stall_number);

  let chosen: DrawUnit;
  if (held) {
    // Hand-allotted before the draw - there is nothing to draw for.
    const heldBlock = blockFor(cleanMobile, brandName);
    const unit = heldBlock?.units.find((u) => u.unitId === held.unitId);
    if (!unit) {
      return {
        success: false,
        isExisting: false,
        error: `Stall ${held.unitId} is held for ${held.brand} but is missing from the floor plan.`
      };
    }
    chosen = unit;
  } else {
    const outcome = drawStall(cleanMobile, brandName, { taken: occupied });
    if (!outcome.unit) {
      return { success: false, isExisting: false, error: outcome.error };
    }
    chosen = outcome.unit;
  }

  const chosenStall = {
    stallNumber: chosen.unitId,
    sqftNumber: chosen.areaSqft,
    isCorner: chosen.stall.zone === 'North Wall Strip',
    shape: 'Linear' as const,
    hall: chosen.zone,
    zone: `${chosen.group} · ${chosen.pool} pool`,
    dimensions: chosen.sheetSize
  };

  const slipId = generateSlipId(cleanMobile, chosenStall.stallNumber);
  const allocatedAt = new Date().toISOString();

  // The drawn stall, not yet anyone's. Nothing is written here: the caller
  // offers it to the register of record first and only what that accepts is
  // kept (see saveAllocationLocally).
  const newAllocation: LotteryAllocationRecord = {
    id: 0, // will be assigned in db
    mobile: cleanMobile,
    brand_name: brandName || 'STE Registered Exhibitor',
    stall_sqft: `${chosenStall.sqftNumber} sq ft`,
    stall_number: chosenStall.stallNumber,
    is_corner: chosenStall.isCorner ? 1 : 0,
    shape: chosenStall.shape,
    hall: chosenStall.hall,
    zone: chosenStall.zone,
    dimensions: chosenStall.dimensions,
    slip_id: slipId,
    allocated_at: allocatedAt
  };

  return {
    success: true,
    isExisting: false,
    allocation: newAllocation
  };
}

/**
 * Keep a stall that has been confirmed, in the local store.
 *
 * Called once the allotment is settled - accepted by the cloud database, or
 * drawn on a machine that has no cloud at all. It used to run inside
 * performLuckyDraw, before anyone knew whether the stall had been accepted,
 * which left a losing draw on record: the exhibitor was shown one stall and
 * the fallback read another back, and the stall itself was withheld from the
 * floor for good.
 */
export function saveAllocationLocally(allocation: LotteryAllocationRecord): void {
  try {
    db.prepare(
      `INSERT INTO lottery_allocations
       (mobile, brand_name, stall_sqft, stall_number, is_corner, shape, hall, zone, dimensions, slip_id, allocated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      allocation.mobile,
      allocation.brand_name,
      allocation.stall_sqft,
      allocation.stall_number,
      allocation.is_corner,
      allocation.shape,
      allocation.hall,
      allocation.zone,
      allocation.dimensions,
      allocation.slip_id,
      allocation.allocated_at
    );
  } catch (err) {
    // The cloud row is the allotment; this copy is a convenience.
    console.warn('[Lottery] Local copy of the allotment skipped:', err);
  }
}

export function getAllocatedStallForMobile(mobile: string): LotteryAllocationRecord | null {
  const clean = normalizeExhibitorId(mobile);
  const record = db.prepare('SELECT * FROM lottery_allocations WHERE mobile = ?').get(clean) as LotteryAllocationRecord | undefined;
  return record || null;
}
