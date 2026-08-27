/**
 * STE 2026 lucky draw, run against the approved floor plan.
 *
 * A draw is only ever random inside the block an exhibitor belongs to. The
 * block is fixed by three things, in this order:
 *
 *   1. Pool    - saree brands draw from the opening run of the floor, everyone
 *                else from the south hall and the three big blocks held back.
 *   2. Size    - only stalls of the size the exhibitor booked are ever offered.
 *   3. Trade   - within that size, only the stalls belonging to the exhibitor's
 *                own trade group, so kurti never lands beside menswear.
 *
 * The trade blocks come from stallAllotment2026, which lays the whole floor out
 * category by category. This module hands those blocks out one at a time, so a
 * live draw shuffles brands inside their own block and never across blocks.
 */

import { STALL_MAP_2026, Stall2026, getStall } from '@/data/stallMap2026';
import { ALLOTMENTS_2026, Allotment2026 } from '@/data/stallAllotment2026';
import { normalizeExhibitorId } from '@/lib/exhibitorId';

export interface DrawUnit {
  /** Stall number, or a split bay half such as "91A". */
  unitId: string;
  stallNumber: number;
  sheetSize: string;
  areaSqft: number;
  pool: string;
  group: string;
  zone: string;
  stall: Stall2026;
}

/** The block an exhibitor may draw from: pool + size + trade. */
export function blockKey(pool: string, sheetSize: string, group: string) {
  return `${pool}|${sheetSize.trim().toLowerCase()}|${group}`;
}

/** Every unit the floor plan lays out, keyed by the block it belongs to. */
const UNITS_BY_BLOCK: Map<string, DrawUnit[]> = (() => {
  const map = new Map<string, DrawUnit[]>();
  for (const a of ALLOTMENTS_2026) {
    const stall = getStall(a.stallNumber);
    if (!stall) continue;
    const unit: DrawUnit = {
      unitId: a.unitId,
      stallNumber: a.stallNumber,
      sheetSize: a.sheetSize,
      areaSqft: a.areaSqft,
      pool: a.pool,
      group: a.group,
      zone: a.zone,
      stall,
    };
    const key = blockKey(a.pool, a.sheetSize, a.group);
    const list = map.get(key);
    if (list) list.push(unit);
    else map.set(key, [unit]);
  }
  for (const list of map.values()) {
    list.sort((x, y) => x.stallNumber - y.stallNumber || x.unitId.localeCompare(y.unitId));
  }
  return map;
})();

/** Brand -> the plan's own entry, used to find an exhibitor's block. */
const BY_BRAND: Map<string, Allotment2026> = new Map(
  ALLOTMENTS_2026.map((a) => [normaliseBrand(a.brand), a])
);
const BY_MOBILE: Map<string, Allotment2026> = new Map(
  ALLOTMENTS_2026.filter((a) => normalizeExhibitorId(a.mobile)).map((a) => [
    normalizeExhibitorId(a.mobile),
    a,
  ])
);

function normaliseBrand(name: string) {
  return name.replace(/\s+/g, ' ').trim().toLowerCase();
}

/** The exhibitor's row on the plan, by mobile first and brand name second. */
export function findOnPlan(mobile: string, brandName?: string) {
  const key = normalizeExhibitorId(mobile);
  return (
    (key && BY_MOBILE.get(key)) ||
    (brandName ? BY_BRAND.get(normaliseBrand(brandName)) : undefined)
  );
}

/** Stalls hand-allotted before the draw; these never go into a draw. */
export function heldUnitFor(mobile: string, brandName?: string) {
  const entry = findOnPlan(mobile, brandName);
  return entry?.held ? entry : undefined;
}

export interface DrawOptions {
  /** Unit ids already taken, so a repeat draw cannot collide. */
  taken?: Iterable<string>;
  /** Supply a generator to make a draw reproducible in tests. */
  random?: () => number;
}

export interface DrawOutcome {
  unit?: DrawUnit;
  /** Why no stall could be offered, when unit is absent. */
  error?: string;
}

/**
 * Draw one stall for an exhibitor from their own pool / size / trade block.
 *
 * Returns an error rather than a stall when the exhibitor is not on the plan,
 * or when every stall in their block is already taken - both are conditions
 * the caller must surface rather than paper over with a wrong-size stall.
 */
export function drawStall(
  mobile: string,
  brandName: string,
  options: DrawOptions = {}
): DrawOutcome {
  const entry = findOnPlan(mobile, brandName);
  if (!entry) {
    return {
      error:
        'This exhibitor is not on the 2026 floor plan. Check the mobile number ' +
        'against the exhibitor sheet.',
    };
  }

  const block = UNITS_BY_BLOCK.get(blockKey(entry.pool, entry.sheetSize, entry.group));
  if (!block || block.length === 0) {
    return { error: `No ${entry.sheetSize} stalls are laid out for ${entry.group}.` };
  }

  const taken = new Set(
    Array.from(options.taken ?? [], (id) => String(id).trim().toUpperCase())
  );
  const free = block.filter((u) => !taken.has(u.unitId.toUpperCase()));
  if (free.length === 0) {
    return {
      error: `Every ${entry.sheetSize} stall in the ${entry.group} block is already allotted.`,
    };
  }

  const roll = options.random ? options.random() : Math.random();
  const unit = free[Math.min(free.length - 1, Math.floor(roll * free.length))];
  return { unit };
}

/** What an exhibitor could still draw, for showing odds before the draw. */
export function blockFor(mobile: string, brandName?: string) {
  const entry = findOnPlan(mobile, brandName);
  if (!entry) return undefined;
  const units = UNITS_BY_BLOCK.get(blockKey(entry.pool, entry.sheetSize, entry.group));
  return units ? { entry, units } : undefined;
}

export const TOTAL_DRAWABLE_UNITS = ALLOTMENTS_2026.filter((a) => !a.held).length;
export const TOTAL_PLAN_STALLS = STALL_MAP_2026.length;
