import {
  MASTER_STALL_INVENTORY,
  StallItem,
  normalizeSqftCategory,
  STALL_CATEGORY_LADDER
} from '@/data/stallInventory';
import db, { LotteryAllocationRecord } from '@/lib/db';

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
  rawSqft: string | number
): LotteryResult {
  const cleanMobile = String(mobile).replace(/\D/g, '').slice(-10);

  if (cleanMobile.length < 10) {
    return {
      success: false,
      isExisting: false,
      error: 'Invalid 10-digit mobile number provided.'
    };
  }

  // 1. Check if already drawn
  const existing = db.prepare(
    'SELECT * FROM lottery_allocations WHERE mobile = ?'
  ).get(cleanMobile) as LotteryAllocationRecord | undefined;

  if (existing) {
    return {
      success: true,
      isExisting: true,
      allocation: existing
    };
  }

  // 2. Determine category & fetch master inventory
  const category = normalizeSqftCategory(rawSqft);
  const isLargeStall = parseInt(category, 10) >= 600;

  // 3. Fetch all currently occupied stall numbers
  const allAllocations = (db.prepare(
    'SELECT stall_number FROM lottery_allocations'
  ).all() as Array<{ stall_number: string }>) || [];
  
  const occupiedSet = new Set<string>(
    allAllocations.map((a) => a.stall_number.toUpperCase())
  );

  // 4. Filter available stalls in this category
  const categoryStalls = MASTER_STALL_INVENTORY.filter(
    (s) => s.categorySqft === category
  );
  
  const availableStalls = categoryStalls.filter(
    (s) => !occupiedSet.has(s.stallNumber.toUpperCase())
  );

  let candidatePool: StallItem[] = [];

  if (isLargeStall) {
    // Bookings of 600 sq ft and above always take a corner. The floor plan only
    // ever cuts a >= 600 sq ft stall at a block end, so this filter is a guard
    // against a future layout change rather than a preference.
    candidatePool = availableStalls.filter((s) => s.isCorner);
  } else {
    // Smaller bookings sit in the middle of a block, stepping down from the
    // corners (400 next to a corner, then 300, 200, 100). A small stall only
    // takes an end position in blocks that hold no large stall at all — the
    // single-column perimeter rows and the north gallery — and even then only
    // once the middle of those runs is full.
    const middleCandidates = availableStalls.filter((s) => !s.isCorner);
    candidatePool = middleCandidates.length > 0 ? middleCandidates : availableStalls;
  }

  // Graceful fallback if the paid-for category is sold out: step UP the ladder to
  // the next larger size. Never downgrade — an exhibitor must not receive less
  // floor area than they booked.
  if (candidatePool.length === 0) {
    const startIdx = STALL_CATEGORY_LADDER.indexOf(category);
    for (let i = startIdx + 1; i < STALL_CATEGORY_LADDER.length; i++) {
      const upgrade = STALL_CATEGORY_LADDER[i];
      const pool = MASTER_STALL_INVENTORY.filter(
        (s) => s.categorySqft === upgrade && !occupiedSet.has(s.stallNumber.toUpperCase())
      );
      if (pool.length > 0) {
        candidatePool = pool;
        break;
      }
    }
  }

  if (candidatePool.length === 0) {
    return {
      success: false,
      isExisting: false,
      error: `No ${category} sq ft stall (or larger) remains on the STE 2026 floor plan. Please contact the organiser.`
    };
  }

  // 5. Select uniformly at random from eligible candidates
  const randomIndex = Math.floor(Math.random() * candidatePool.length);
  const chosenStall = candidatePool[randomIndex];

  const slipId = generateSlipId(cleanMobile, chosenStall.stallNumber);
  const allocatedAt = new Date().toISOString();

  // 6. Persist allocation
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

  db.prepare(
    `INSERT INTO lottery_allocations 
     (mobile, brand_name, stall_sqft, stall_number, is_corner, shape, hall, zone, dimensions, slip_id, allocated_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    cleanMobile,
    newAllocation.brand_name,
    newAllocation.stall_sqft,
    newAllocation.stall_number,
    newAllocation.is_corner,
    newAllocation.shape,
    newAllocation.hall,
    newAllocation.zone,
    newAllocation.dimensions,
    newAllocation.slip_id,
    newAllocation.allocated_at
  );

  return {
    success: true,
    isExisting: false,
    allocation: newAllocation
  };
}

export function getAllocatedStallForMobile(mobile: string): LotteryAllocationRecord | null {
  const clean = String(mobile).replace(/\D/g, '').slice(-10);
  const record = db.prepare('SELECT * FROM lottery_allocations WHERE mobile = ?').get(clean) as LotteryAllocationRecord | undefined;
  return record || null;
}
