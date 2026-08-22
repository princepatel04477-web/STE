export type StallStatus = "available" | "held" | "booked" | "premium";

export interface Stall {
  id: string;
  number: string;
  size: string;
  areaSqm: number;
  status: StallStatus;
  hall: string;
  category?: string;
}

export const TOTAL_STALL_CAPACITY = 650;

// Sample representative floor plan layout (Hall A & Hall B)
export const FLOOR_PLAN_STALLS: Stall[] = Array.from({ length: 60 }, (_, i) => {
  const num = i + 1;
  const id = `A-${num.toString().padStart(2, "0")}`;
  // Deterministic realistic status split
  let status: StallStatus = "available";
  if (num % 5 === 0) status = "booked";
  else if (num % 8 === 0) status = "held";
  else if (num % 7 === 0) status = "premium";

  return {
    id,
    number: `A-${num}`,
    size: num > 40 ? "6m x 6m" : num > 20 ? "6m x 3m" : "3m x 3m",
    areaSqm: num > 40 ? 36 : num > 20 ? 18 : 9,
    status,
    hall: "Hall A (Main Dome)",
    category: num % 2 === 0 ? "Sarees" : "Lehengas",
  };
});

export function getFloorPlanStats() {
  const bookedCount = FLOOR_PLAN_STALLS.filter((s) => s.status === "booked").length + 280; // Total confirmed bookings across all halls
  const heldCount = FLOOR_PLAN_STALLS.filter((s) => s.status === "held").length + 45;
  const availableStalls = TOTAL_STALL_CAPACITY - bookedCount - heldCount;

  return {
    totalCapacity: TOTAL_STALL_CAPACITY,
    bookedCount,
    heldCount,
    availableStalls,
  };
}
