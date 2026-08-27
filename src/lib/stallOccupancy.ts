/**
 * Which stalls on the approved 2026 plan are taken, and which are still free.
 *
 * The floor plan (stallMap2026) says what exists; the allotment
 * (stallAllotment2026) says who sits where. Joining the two on unit id gives
 * the occupancy the organiser reads off the plan: every lettable unit, the
 * brand on it, and the handful left over.
 *
 * A bay that was cut counts as its parts, so 91A can be taken while 91B is
 * still free.
 */

import { STALL_MAP_2026, Stall2026 } from '@/data/stallMap2026';
import {
  ALLOTMENTS_2026,
  Allotment2026,
  SPLIT_BAYS_2026,
} from '@/data/stallAllotment2026';

/** One addressable unit on the plan, with the rectangle it is drawn as. */
export interface StallUnit {
  /** Stall number, or a bay half such as "91A". */
  id: string;
  stall: Stall2026;
  /** The unit's own size - the cut part, not the whole bay it sits in. */
  size: string;
  areaSqft: number;
  zone: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

const SPLIT = new Set(SPLIT_BAYS_2026);

/** The plan writes sizes as "18M x 3M"; 9 sqm is the organiser's 100 sqft. */
function sqftFromSize(size: string, fallback: number): number {
  const [a, b] = size.match(/\d+(\.\d+)?/g)?.map(Number) ?? [];
  if (!a || !b) return fallback;
  return Math.round((a * b) / 9) * 100;
}

/** Every lettable unit on the floor: a split bay contributes its parts. */
export const STALL_UNITS: StallUnit[] = STALL_MAP_2026.flatMap((stall) => {
  if (SPLIT.has(stall.stallNumber) && stall.halves) {
    return stall.halves.map((half) => {
      const size = half.size ?? '3M x 3M';
      return {
        id: half.id,
        stall,
        size,
        areaSqft: sqftFromSize(size, 100),
        zone: stall.zone,
        x: half.x,
        y: half.y,
        w: half.w,
        h: half.h,
      };
    });
  }
  return [
    {
      id: String(stall.stallNumber),
      stall,
      size: stall.size,
      areaSqft: stall.areaSqft,
      zone: stall.zone,
      x: stall.x,
      y: stall.y,
      w: stall.w,
      h: stall.h,
    },
  ];
});

/** The allotment for a unit, keyed by the unit id in upper case. */
export const ALLOTMENT_BY_UNIT: Map<string, Allotment2026> = new Map(
  ALLOTMENTS_2026.map((a) => [a.unitId.toUpperCase(), a])
);

export function allotmentFor(unitId: string): Allotment2026 | undefined {
  return ALLOTMENT_BY_UNIT.get(unitId.trim().toUpperCase());
}

/** Units nobody has been seated on yet. */
export const FREE_UNITS: StallUnit[] = STALL_UNITS.filter(
  (u) => !ALLOTMENT_BY_UNIT.has(u.id.toUpperCase())
);

export const ALLOTTED_UNITS: StallUnit[] = STALL_UNITS.filter((u) =>
  ALLOTMENT_BY_UNIT.has(u.id.toUpperCase())
);

/** Headline figures for the occupancy panel. */
export const OCCUPANCY_2026 = {
  totalUnits: STALL_UNITS.length,
  allotted: ALLOTTED_UNITS.length,
  free: FREE_UNITS.length,
  freeSqft: FREE_UNITS.reduce((sum, u) => sum + u.areaSqft, 0),
  allottedSqft: ALLOTTED_UNITS.reduce((sum, u) => sum + u.areaSqft, 0),
};

/** Free units grouped by hall, in plan order, for the remaining-stalls list. */
export function freeUnitsByZone(): { zone: string; units: StallUnit[] }[] {
  const byZone = new Map<string, StallUnit[]>();
  for (const unit of FREE_UNITS) {
    const list = byZone.get(unit.zone);
    if (list) list.push(unit);
    else byZone.set(unit.zone, [unit]);
  }
  return [...byZone.entries()].map(([zone, units]) => ({ zone, units }));
}
