export type AllotmentPool = "Saree" | "General";

export interface Allotment2026 {
  unitId: string;
  stallNumber: number;
  brand: string;
  category: string;
  group: string;
  mobile: string;
  sheetSize: string;
  areaSqft: number;
  pool: AllotmentPool;
  zone: string;
  held: boolean;
}

export const ALLOTMENTS_2026: Allotment2026[] = [];
export const SAREE_POOL_STALLS: string[] = [];
export const SPLIT_BAYS_2026: number[] = [91, 107, 9001, 9002, 9003, 9004, 9005, 9006, 9007, 9008, 9009];

export function findAllotmentByMobile(mobile: string) {
  const key = mobile.replace(/\D/g, "").slice(-10);
  return ALLOTMENTS_2026.find((a) => a.mobile === key);
}

export function findAllotmentByUnit(unitId: string) {
  const key = unitId.trim().toUpperCase();
  return ALLOTMENTS_2026.find((a) => a.unitId.toUpperCase() === key);
}
