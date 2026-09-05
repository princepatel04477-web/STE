/**
 * STE 2026 master stall map - generated from the layout sheet
 * "STE - Proposed Layout 3.9.2026" in Final-Layout-STE-2026.xls.
 *
 * Do not hand-edit. Regenerate with:  python scripts/number_stalls.py
 *
 * RENUMBERED 5 Sep 2026 against "STE - Proposed Layout 5.9.2026" in
 * STE_FINAL_WITH_STALL_NUMBERS.xls - the organisers' approved final layout,
 * read directly off its merged cells (number + brand + size per bay), not
 * from a python regeneration (no python/xlrd on hand for this pass). Ten
 * current stalls have no home in this new drawing at all and are re-parked
 * under a synthetic geometry-less slot rather than dropped or left
 * squatting on a number the new plan gives to someone else - see the
 * PENDING- rows and the note at the top of stallAllotment2026.ts for the
 * full list and why each one is unresolved.
 *
 * Stall numbers 9001+ are synthetic container keys for a lettered pair/solo
 * this new layout draws (e.g. "166A", "143A"/"143B") that no longer shares
 * its numeral with a real bare stall - never printed anywhere, only used so
 * each half still gets its own addressable id via `halves`.
 *
 * 167 stalls, 5355 sqm:
 *   6M x 3M     49
 *   3M x 3M     40
 *   18M x 3M    26
 *   12M x 3M    20
 *   9M x 3M     17
 *   30M x 3M     7
 *   24M x 3M     5
 *   36M x 3M     1
 *   42M x 6M     1
 *   30M x 6M     1
 *
 * Numbers run 1-172, less 111, 154, 155, 156, 171 - retired off the floor and never reissued.
 *
 * A number belongs to the exhibitor holding it, not to a position on
 * the floor: a stall the organisers move keeps its number, a number
 * that comes off the floor is retired rather than reissued, and a bay
 * the plan adds is numbered from the end. See LOCKED_NUMBERS in the
 * generator for what is pinned where.
 *
 * x/y/w/h are the stall's rectangle in the floor plan's own
 * coordinate space (1 metre = 5.638 units), so they can be used to draw
 * or hit-test the plan directly.
 *
 * WIDENED 6 Sep 2026: stall 32's merged cell in the raw drawing only spans
 * 18 rows (rows 33-51), but its own printed label already reads "24M x 3M" -
 * the 6 rows directly above it (27-33, same columns) are blank/unlabeled in
 * the sheet, which is Samprati Creation's 200 sqft folded into Suparshva's
 * stall (see stallAllotment2026.ts) without the merged cell ever being
 * extended to cover it. Widened here to match the label and neighbouring
 * stall 35's identical row-27 start, so the two draw at the same height
 * instead of stall 32 looking short next to it.
 *
 * NOTE for future edits: scripts/build_final_svg.py's parse_stall_map()
 * finds each entry with a regex that expects them back-to-back with no
 * comment lines in between - a comment inserted directly above one entry
 * merges it into its neighbour's match and silently drops it from every
 * regeneration. Put entry-specific notes here in the header instead.
 */

export type StallZone = "North Wall Strip" | "North Hall" | "South Hall";

/** One 100 sqft module of a 200 sqft bay that was split. */
export interface StallHalf {
  /** The bay number with an A or B suffix, e.g. "91A". */
  id: string;
  /** The part's own size. Defaults to 3M x 3M, the half of a 200 sqft bay. */
  size?: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * A bay the stall's holder has sub-let inside it. Recorded and drawn,
 * but never a lettable unit: the stall is let whole, on one number.
 */
export interface SubStall {
  /** The stall number with the bay's position, e.g. "39-1". */
  id: string;
  /** The block's own numbering for this bay, e.g. "1 & 2". */
  units: string;
  brand: string;
  size: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Stall2026 {
  /** 1..172, less any retired. Walked west to east: north wall strip,
   *  north hall, south hall. */
  stallNumber: number;
  /** As written on the floor plan, e.g. "18M x 3M". */
  size: string;
  /** The stall's real floor dimension, e.g. "3m x 18m" - join on this. */
  sheetSize: string;
  /** Other spellings the exhibitor sheet uses for this same size. */
  sheetAliases?: string[];
  areaSqm: number;
  /** The organiser's own sqft figure for this size. */
  areaSqft: number;
  zone: StallZone;
  widthM: number;
  depthM: number;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Number printed on the original drawing, where one was. */
  legacyNumber?: string;
  /** Hand-allotted before the draw - excluded from the lucky draw. */
  reservedFor?: string;
  /** Set only on the bays the saree pool needed split, e.g. 91A / 91B. */
  halves?: StallHalf[];
  /** Bays the holder has sub-let inside this stall. Not lettable. */
  subStalls?: SubStall[];
}

export const STALL_MAP_2026: Stall2026[] = [
  { stallNumber: 1, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Wall Strip", widthM: 6, depthM: 3, x: 40.71, y: 47.51, w: 33.84, h: 16.9 },
  { stallNumber: 2, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Wall Strip", widthM: 6, depthM: 3, x: 74.54, y: 47.51, w: 33.84, h: 16.9 },
  { stallNumber: 3, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Wall Strip", widthM: 6, depthM: 3, x: 108.38, y: 47.51, w: 33.84, h: 16.9 },
  { stallNumber: 4, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Wall Strip", widthM: 6, depthM: 3, x: 142.22, y: 47.51, w: 33.84, h: 16.9 },
  { stallNumber: 5, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Wall Strip", widthM: 6, depthM: 3, x: 176.06, y: 47.51, w: 33.84, h: 16.9 },
  { stallNumber: 6, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Wall Strip", widthM: 6, depthM: 3, x: 209.9, y: 47.51, w: 33.84, h: 16.9 },
  { stallNumber: 7, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Wall Strip", widthM: 6, depthM: 3, x: 243.74, y: 47.51, w: 33.84, h: 16.9 },
  { stallNumber: 8, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Wall Strip", widthM: 6, depthM: 3, x: 294.49, y: 47.51, w: 33.84, h: 16.9 },
  { stallNumber: 9, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Wall Strip", widthM: 6, depthM: 3, x: 328.33, y: 47.51, w: 33.84, h: 16.9 },
  { stallNumber: 10, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Wall Strip", widthM: 6, depthM: 3, x: 362.17, y: 47.51, w: 33.84, h: 16.9 },
  { stallNumber: 11, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Wall Strip", widthM: 6, depthM: 3, x: 396.01, y: 47.51, w: 33.84, h: 16.9 },
  { stallNumber: 12, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Wall Strip", widthM: 6, depthM: 3, x: 429.85, y: 47.51, w: 33.84, h: 16.9 },
  { stallNumber: 13, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Wall Strip", widthM: 6, depthM: 3, x: 463.69, y: 47.51, w: 33.84, h: 16.9 },
  { stallNumber: 14, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Wall Strip", widthM: 6, depthM: 3, x: 497.53, y: 47.51, w: 33.84, h: 16.9 },
  { stallNumber: 15, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Wall Strip", widthM: 6, depthM: 3, x: 548.28, y: 47.51, w: 33.84, h: 16.9 },
  { stallNumber: 16, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Wall Strip", widthM: 6, depthM: 3, x: 582.12, y: 47.51, w: 33.84, h: 16.9 },
  { stallNumber: 17, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Wall Strip", widthM: 6, depthM: 3, x: 615.96, y: 47.51, w: 33.84, h: 16.9 },
  { stallNumber: 18, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Wall Strip", widthM: 6, depthM: 3, x: 649.8, y: 47.51, w: 33.84, h: 16.9 },
  { stallNumber: 19, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Wall Strip", widthM: 6, depthM: 3, x: 683.64, y: 47.51, w: 33.84, h: 16.9 },
  { stallNumber: 20, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Wall Strip", widthM: 6, depthM: 3, x: 717.47, y: 47.51, w: 33.84, h: 16.9 },
  { stallNumber: 21, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Wall Strip", widthM: 6, depthM: 3, x: 751.31, y: 47.51, w: 33.84, h: 16.9 },
  { stallNumber: 22, size: "12M x 3M", sheetSize: "3m x 12m", areaSqm: 36, areaSqft: 400, zone: "North Hall", widthM: 3, depthM: 12, x: 40.71, y: 81.3, w: 16.92, h: 67.58 },
  { stallNumber: 23, size: "30M x 3M", sheetSize: "3m x 30m", areaSqm: 90, areaSqft: 1000, zone: "North Hall", widthM: 3, depthM: 30, x: 40.71, y: 148.89, w: 16.92, h: 168.96 },
  { stallNumber: 24, size: "30M x 3M", sheetSize: "3m x 30m", areaSqm: 90, areaSqft: 1000, zone: "North Hall", widthM: 3, depthM: 30, x: 74.54, y: 148.89, w: 16.92, h: 168.96 },
  { stallNumber: 25, size: "12M x 3M", sheetSize: "3m x 12m", areaSqm: 36, areaSqft: 400, zone: "North Hall", widthM: 3, depthM: 12, x: 74.54, y: 81.3, w: 16.92, h: 67.58 },
  { stallNumber: 26, size: "12M x 3M", sheetSize: "3m x 12m", areaSqm: 36, areaSqft: 400, zone: "North Hall", widthM: 3, depthM: 12, x: 91.46, y: 81.3, w: 16.92, h: 67.58 },
  { stallNumber: 27, size: "30M x 3M", sheetSize: "3m x 30m", areaSqm: 90, areaSqft: 1000, zone: "North Hall", widthM: 3, depthM: 30, x: 91.46, y: 148.89, w: 16.92, h: 168.96 },
  { stallNumber: 28, size: "30M x 3M", sheetSize: "3m x 30m", areaSqm: 90, areaSqft: 1000, zone: "North Hall", widthM: 3, depthM: 30, x: 125.3, y: 148.89, w: 16.92, h: 168.96 },
  { stallNumber: 29, size: "12M x 3M", sheetSize: "3m x 12m", areaSqm: 36, areaSqft: 400, zone: "North Hall", widthM: 3, depthM: 12, x: 125.3, y: 81.3, w: 16.92, h: 67.58 },
  { stallNumber: 30, size: "12M x 3M", sheetSize: "3m x 12m", areaSqm: 36, areaSqft: 400, zone: "North Hall", widthM: 3, depthM: 12, x: 142.22, y: 81.3, w: 16.92, h: 67.58 },
  { stallNumber: 31, size: "30M x 3M", sheetSize: "3m x 30m", areaSqm: 90, areaSqft: 1000, zone: "North Hall", widthM: 3, depthM: 30, x: 142.22, y: 148.89, w: 16.92, h: 168.96 },
  { stallNumber: 32, size: "24M x 3M", sheetSize: "3m x 24m", areaSqm: 72, areaSqft: 800, zone: "North Hall", widthM: 3, depthM: 24, x: 176.06, y: 182.68, w: 16.92, h: 135.17 },
  { stallNumber: 33, size: "18M x 3M", sheetSize: "3m x 18m", areaSqm: 54, areaSqft: 600, zone: "North Hall", widthM: 3, depthM: 18, x: 176.06, y: 81.3, w: 16.92, h: 101.38 },
  { stallNumber: 34, size: "18M x 3M", sheetSize: "3m x 18m", areaSqm: 54, areaSqft: 600, zone: "North Hall", widthM: 3, depthM: 18, x: 192.98, y: 81.3, w: 16.92, h: 101.38 },
  { stallNumber: 35, size: "24M x 3M", sheetSize: "3m x 24m", areaSqm: 72, areaSqft: 800, zone: "North Hall", widthM: 3, depthM: 24, x: 192.98, y: 182.68, w: 16.92, h: 135.17 },
  { stallNumber: 36, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Hall", widthM: 3, depthM: 6, x: 226.82, y: 284.05, w: 16.92, h: 33.79 },
  { stallNumber: 37, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Hall", widthM: 3, depthM: 6, x: 226.82, y: 250.26, w: 16.92, h: 33.79 },
  { stallNumber: 38, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Hall", widthM: 3, depthM: 6, x: 226.82, y: 216.47, w: 16.92, h: 33.79 },
  { stallNumber: 39, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "North Hall", widthM: 3, depthM: 3, x: 226.82, y: 199.57, w: 16.92, h: 16.9 },
  { stallNumber: 40, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "North Hall", widthM: 3, depthM: 3, x: 226.82, y: 182.68, w: 16.92, h: 16.9 },
  { stallNumber: 41, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Hall", widthM: 3, depthM: 6, x: 226.82, y: 148.89, w: 16.92, h: 33.79 },
  { stallNumber: 42, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Hall", widthM: 3, depthM: 6, x: 226.82, y: 115.09, w: 16.92, h: 33.79 },
  { stallNumber: 43, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Hall", widthM: 3, depthM: 6, x: 226.82, y: 81.3, w: 16.92, h: 33.79 },
  { stallNumber: 44, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Hall", widthM: 3, depthM: 6, x: 243.74, y: 81.3, w: 16.92, h: 33.79 },
  { stallNumber: 45, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Hall", widthM: 3, depthM: 6, x: 243.74, y: 115.09, w: 16.92, h: 33.79 },
  { stallNumber: 46, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Hall", widthM: 3, depthM: 6, x: 243.74, y: 148.89, w: 16.92, h: 33.79 },
  { stallNumber: 47, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Hall", widthM: 3, depthM: 6, x: 243.74, y: 182.68, w: 16.92, h: 33.79 },
  { stallNumber: 48, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Hall", widthM: 3, depthM: 6, x: 243.74, y: 216.47, w: 16.92, h: 33.79 },
  { stallNumber: 49, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Hall", widthM: 3, depthM: 6, x: 243.74, y: 250.26, w: 16.92, h: 33.79 },
  { stallNumber: 50, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Hall", widthM: 3, depthM: 6, x: 243.74, y: 284.05, w: 16.92, h: 33.79 },
  { stallNumber: 51, size: "30M x 6M", sheetSize: "30m x 6m", areaSqm: 180, areaSqft: 2000, zone: "North Hall", widthM: 6, depthM: 30, x: 277.58, y: 148.89, w: 33.84, h: 168.96 },
  { stallNumber: 52, size: "12M x 3M", sheetSize: "3m x 12m", areaSqm: 36, areaSqft: 400, zone: "North Hall", widthM: 3, depthM: 12, x: 277.58, y: 81.3, w: 16.92, h: 67.58 },
  { stallNumber: 53, size: "12M x 3M", sheetSize: "3m x 12m", areaSqm: 36, areaSqft: 400, zone: "North Hall", widthM: 3, depthM: 12, x: 294.49, y: 81.3, w: 16.92, h: 67.58 },
  { stallNumber: 54, size: "12M x 3M", sheetSize: "3m x 12m", areaSqm: 36, areaSqft: 400, zone: "North Hall", widthM: 3, depthM: 12, x: 328.33, y: 81.3, w: 16.92, h: 67.58 },
  { stallNumber: 55, size: "12M x 3M", sheetSize: "3m x 12m", areaSqm: 36, areaSqft: 400, zone: "North Hall", widthM: 3, depthM: 12, x: 328.33, y: 148.89, w: 16.92, h: 67.58 },
  { stallNumber: 56, size: "18M x 3M", sheetSize: "3m x 18m", areaSqm: 54, areaSqft: 600, zone: "North Hall", widthM: 3, depthM: 18, x: 328.33, y: 216.47, w: 16.92, h: 101.38 },
  { stallNumber: 57, size: "18M x 3M", sheetSize: "3m x 18m", areaSqm: 54, areaSqft: 600, zone: "North Hall", widthM: 3, depthM: 18, x: 345.25, y: 216.47, w: 16.92, h: 101.38 },
  { stallNumber: 58, size: "12M x 3M", sheetSize: "3m x 12m", areaSqm: 36, areaSqft: 400, zone: "North Hall", widthM: 3, depthM: 12, x: 345.25, y: 148.89, w: 16.92, h: 67.58 },
  { stallNumber: 59, size: "12M x 3M", sheetSize: "3m x 12m", areaSqm: 36, areaSqft: 400, zone: "North Hall", widthM: 3, depthM: 12, x: 345.25, y: 81.3, w: 16.92, h: 67.58 },
  { stallNumber: 60, size: "12M x 3M", sheetSize: "3m x 12m", areaSqm: 36, areaSqft: 400, zone: "North Hall", widthM: 3, depthM: 12, x: 379.09, y: 81.3, w: 16.92, h: 67.58 },
  { stallNumber: 61, size: "12M x 3M", sheetSize: "3m x 12m", areaSqm: 36, areaSqft: 400, zone: "North Hall", widthM: 3, depthM: 12, x: 379.09, y: 148.89, w: 16.92, h: 67.58 },
  { stallNumber: 62, size: "18M x 3M", sheetSize: "3m x 18m", areaSqm: 54, areaSqft: 600, zone: "North Hall", widthM: 3, depthM: 18, x: 379.09, y: 216.47, w: 16.92, h: 101.38 },
  { stallNumber: 63, size: "18M x 3M", sheetSize: "3m x 18m", areaSqm: 54, areaSqft: 600, zone: "North Hall", widthM: 3, depthM: 18, x: 396.01, y: 216.47, w: 16.92, h: 101.38 },
  { stallNumber: 64, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Hall", widthM: 3, depthM: 6, x: 396.01, y: 182.68, w: 16.92, h: 33.79 },
  { stallNumber: 65, size: "9M x 3M", sheetSize: "3m x 9m", areaSqm: 27, areaSqft: 300, zone: "North Hall", widthM: 3, depthM: 9, x: 396.01, y: 81.3, w: 16.92, h: 50.69 },
  { stallNumber: 66, size: "18M x 3M", sheetSize: "3m x 18m", areaSqm: 54, areaSqft: 600, zone: "North Hall", widthM: 3, depthM: 18, x: 429.85, y: 81.3, w: 16.92, h: 101.38 },
  { stallNumber: 67, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Hall", widthM: 3, depthM: 6, x: 429.85, y: 182.68, w: 16.92, h: 33.79 },
  { stallNumber: 68, size: "18M x 3M", sheetSize: "3m x 18m", areaSqm: 54, areaSqft: 600, zone: "North Hall", widthM: 3, depthM: 18, x: 429.85, y: 216.47, w: 16.92, h: 101.38 },
  { stallNumber: 69, size: "18M x 3M", sheetSize: "3m x 18m", areaSqm: 54, areaSqft: 600, zone: "North Hall", widthM: 3, depthM: 18, x: 446.77, y: 216.47, w: 16.92, h: 101.38 },
  { stallNumber: 70, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Hall", widthM: 3, depthM: 6, x: 446.77, y: 182.68, w: 16.92, h: 33.79 },
  { stallNumber: 71, size: "18M x 3M", sheetSize: "3m x 18m", areaSqm: 54, areaSqft: 600, zone: "North Hall", widthM: 3, depthM: 18, x: 446.77, y: 81.3, w: 16.92, h: 101.38 },
  { stallNumber: 72, size: "18M x 3M", sheetSize: "3m x 18m", areaSqm: 54, areaSqft: 600, zone: "North Hall", widthM: 3, depthM: 18, x: 480.61, y: 81.3, w: 16.92, h: 101.38 },
  { stallNumber: 73, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Hall", widthM: 3, depthM: 6, x: 480.61, y: 182.68, w: 16.92, h: 33.79 },
  { stallNumber: 74, size: "18M x 3M", sheetSize: "3m x 18m", areaSqm: 54, areaSqft: 600, zone: "North Hall", widthM: 3, depthM: 18, x: 480.61, y: 216.47, w: 16.92, h: 101.38 },
  { stallNumber: 75, size: "18M x 3M", sheetSize: "3m x 18m", areaSqm: 54, areaSqft: 600, zone: "North Hall", widthM: 3, depthM: 18, x: 497.53, y: 216.47, w: 16.92, h: 101.38 },
  { stallNumber: 76, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Hall", widthM: 3, depthM: 6, x: 497.53, y: 182.68, w: 16.92, h: 33.79 },
  { stallNumber: 77, size: "18M x 3M", sheetSize: "3m x 18m", areaSqm: 54, areaSqft: 600, zone: "North Hall", widthM: 3, depthM: 18, x: 497.53, y: 81.3, w: 16.92, h: 101.38 },
  { stallNumber: 78, size: "18M x 3M", sheetSize: "3m x 18m", areaSqm: 54, areaSqft: 600, zone: "North Hall", widthM: 3, depthM: 18, x: 531.36, y: 81.3, w: 16.92, h: 101.38 },
  { stallNumber: 79, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Hall", widthM: 3, depthM: 6, x: 531.36, y: 182.68, w: 16.92, h: 33.79 },
  { stallNumber: 80, size: "18M x 3M", sheetSize: "3m x 18m", areaSqm: 54, areaSqft: 600, zone: "North Hall", widthM: 3, depthM: 18, x: 531.36, y: 216.47, w: 16.92, h: 101.38 },
  { stallNumber: 81, size: "18M x 3M", sheetSize: "3m x 18m", areaSqm: 54, areaSqft: 600, zone: "North Hall", widthM: 3, depthM: 18, x: 548.28, y: 216.47, w: 16.92, h: 101.38 },
  { stallNumber: 82, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Hall", widthM: 3, depthM: 6, x: 548.28, y: 182.68, w: 16.92, h: 33.79 },
  { stallNumber: 83, size: "18M x 3M", sheetSize: "3m x 18m", areaSqm: 54, areaSqft: 600, zone: "North Hall", widthM: 3, depthM: 18, x: 548.28, y: 81.3, w: 16.92, h: 101.38 },
  { stallNumber: 84, size: "9M x 3M", sheetSize: "3m x 9m", areaSqm: 27, areaSqft: 300, zone: "North Hall", widthM: 3, depthM: 9, x: 582.12, y: 81.3, w: 16.92, h: 50.69 },
  { stallNumber: 85, size: "9M x 3M", sheetSize: "3m x 9m", areaSqm: 27, areaSqft: 300, zone: "North Hall", widthM: 3, depthM: 9, x: 582.12, y: 131.99, w: 16.92, h: 50.69 },
  { stallNumber: 86, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Hall", widthM: 3, depthM: 6, x: 582.12, y: 182.68, w: 16.92, h: 33.79 },
  { stallNumber: 87, size: "18M x 3M", sheetSize: "3m x 18m", areaSqm: 54, areaSqft: 600, zone: "North Hall", widthM: 3, depthM: 18, x: 582.12, y: 216.47, w: 16.92, h: 101.38 },
  { stallNumber: 88, size: "18M x 3M", sheetSize: "3m x 18m", areaSqm: 54, areaSqft: 600, zone: "North Hall", widthM: 3, depthM: 18, x: 599.04, y: 216.47, w: 16.92, h: 101.38 },
  { stallNumber: 89, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Hall", widthM: 3, depthM: 6, x: 599.04, y: 182.68, w: 16.92, h: 33.79 },
  { stallNumber: 90, size: "9M x 3M", sheetSize: "3m x 9m", areaSqm: 27, areaSqft: 300, zone: "North Hall", widthM: 3, depthM: 9, x: 599.04, y: 131.99, w: 16.92, h: 50.69 },
  { stallNumber: 91, size: "9M x 3M", sheetSize: "3m x 9m", areaSqm: 27, areaSqft: 300, zone: "North Hall", widthM: 3, depthM: 9, x: 599.04, y: 81.3, w: 16.92, h: 50.69 },
  { stallNumber: 92, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Hall", widthM: 3, depthM: 6, x: 632.88, y: 81.3, w: 16.92, h: 33.79 },
  { stallNumber: 93, size: "9M x 3M", sheetSize: "3m x 9m", areaSqm: 27, areaSqft: 300, zone: "North Hall", widthM: 3, depthM: 9, x: 632.88, y: 131.99, w: 16.92, h: 50.69 },
  { stallNumber: 94, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Hall", widthM: 3, depthM: 6, x: 632.88, y: 182.68, w: 16.92, h: 33.79 },
  { stallNumber: 95, size: "9M x 3M", sheetSize: "3m x 9m", areaSqm: 27, areaSqft: 300, zone: "North Hall", widthM: 3, depthM: 9, x: 632.88, y: 216.47, w: 16.92, h: 50.69 },
  { stallNumber: 96, size: "9M x 3M", sheetSize: "3m x 9m", areaSqm: 27, areaSqft: 300, zone: "North Hall", widthM: 3, depthM: 9, x: 632.88, y: 267.16, w: 16.92, h: 50.69 },
  { stallNumber: 97, size: "9M x 3M", sheetSize: "3m x 9m", areaSqm: 27, areaSqft: 300, zone: "North Hall", widthM: 3, depthM: 9, x: 649.8, y: 267.16, w: 16.92, h: 50.69 },
  { stallNumber: 98, size: "9M x 3M", sheetSize: "3m x 9m", areaSqm: 27, areaSqft: 300, zone: "North Hall", widthM: 3, depthM: 9, x: 649.8, y: 216.47, w: 16.92, h: 50.69 },
  { stallNumber: 99, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "North Hall", widthM: 3, depthM: 6, x: 649.8, y: 182.68, w: 16.92, h: 33.79 },
  { stallNumber: 100, size: "9M x 3M", sheetSize: "3m x 9m", areaSqm: 27, areaSqft: 300, zone: "North Hall", widthM: 3, depthM: 9, x: 649.8, y: 131.99, w: 16.92, h: 50.69 },
  { stallNumber: 101, size: "9M x 3M", sheetSize: "3m x 9m", areaSqm: 27, areaSqft: 300, zone: "North Hall", widthM: 3, depthM: 9, x: 649.8, y: 81.3, w: 16.92, h: 50.69 },
  { stallNumber: 102, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "North Hall", widthM: 3, depthM: 3, x: 683.64, y: 81.3, w: 16.92, h: 16.9 },
  { stallNumber: 103, size: "36M x 3M", sheetSize: "3m x 36m", areaSqm: 108, areaSqft: 1200, zone: "North Hall", widthM: 3, depthM: 36, x: 683.64, y: 115.09, w: 16.92, h: 202.75 },
  { stallNumber: 104, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "North Hall", widthM: 3, depthM: 3, x: 700.56, y: 300.95, w: 16.92, h: 16.9 },
  { stallNumber: 105, size: "9M x 3M", sheetSize: "3m x 9m", areaSqm: 27, areaSqft: 300, zone: "North Hall", widthM: 3, depthM: 9, x: 700.56, y: 250.26, w: 16.92, h: 50.69 },
  { stallNumber: 106, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "North Hall", widthM: 3, depthM: 3, x: 700.56, y: 233.37, w: 16.92, h: 16.9 },
  { stallNumber: 107, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "North Hall", widthM: 3, depthM: 3, x: 700.56, y: 216.47, w: 16.92, h: 16.9 },
  { stallNumber: 108, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "North Hall", widthM: 3, depthM: 3, x: 700.56, y: 199.57, w: 16.92, h: 16.9 },
  { stallNumber: 109, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "North Hall", widthM: 3, depthM: 3, x: 700.56, y: 182.68, w: 16.92, h: 16.9 },
  { stallNumber: 110, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "North Hall", widthM: 3, depthM: 3, x: 700.56, y: 165.78, w: 16.92, h: 16.9 },
  { stallNumber: 111, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "North Hall", widthM: 3, depthM: 3, x: 700.56, y: 148.89, w: 16.92, h: 16.9 },
  { stallNumber: 112, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "North Hall", widthM: 3, depthM: 3, x: 700.56, y: 131.99, w: 16.92, h: 16.9 },
  { stallNumber: 113, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "North Hall", widthM: 3, depthM: 3, x: 700.56, y: 115.09, w: 16.92, h: 16.9 },
  { stallNumber: 114, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "North Hall", widthM: 3, depthM: 3, x: 700.56, y: 98.2, w: 16.92, h: 16.9 },
  { stallNumber: 115, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "North Hall", widthM: 3, depthM: 3, x: 700.56, y: 81.3, w: 16.92, h: 16.9 },
  { stallNumber: 116, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "North Hall", widthM: 3, depthM: 3, x: 734.39, y: 81.3, w: 16.92, h: 16.9 },
  { stallNumber: 117, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "North Hall", widthM: 3, depthM: 3, x: 734.39, y: 98.2, w: 16.92, h: 16.9 },
  { stallNumber: 118, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "North Hall", widthM: 3, depthM: 3, x: 734.39, y: 115.09, w: 16.92, h: 16.9 },
  { stallNumber: 119, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "North Hall", widthM: 3, depthM: 3, x: 734.39, y: 131.99, w: 16.92, h: 16.9 },
  { stallNumber: 120, size: "30M x 3M", sheetSize: "3m x 30m", areaSqm: 90, areaSqft: 1000, zone: "North Hall", widthM: 3, depthM: 30, x: 734.39, y: 148.89, w: 16.92, h: 168.96 },
  { stallNumber: 121, size: "24M x 3M", sheetSize: "3m x 24m", areaSqm: 72, areaSqft: 800, zone: "North Hall", widthM: 3, depthM: 24, x: 751.31, y: 182.68, w: 16.92, h: 135.17 },
  { stallNumber: 122, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "North Hall", widthM: 3, depthM: 3, x: 751.31, y: 165.78, w: 16.92, h: 16.9 },
  { stallNumber: 123, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "North Hall", widthM: 3, depthM: 3, x: 751.31, y: 148.89, w: 16.92, h: 16.9 },
  { stallNumber: 124, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "North Hall", widthM: 3, depthM: 3, x: 751.31, y: 131.99, w: 16.92, h: 16.9 },
  { stallNumber: 125, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "North Hall", widthM: 3, depthM: 3, x: 751.31, y: 115.09, w: 16.92, h: 16.9 },
  { stallNumber: 126, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "North Hall", widthM: 3, depthM: 3, x: 751.31, y: 98.2, w: 16.92, h: 16.9 },
  { stallNumber: 127, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "North Hall", widthM: 3, depthM: 3, x: 751.31, y: 81.3, w: 16.92, h: 16.9 },
  { stallNumber: 128, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "South Hall", widthM: 3, depthM: 3, x: 773.87, y: 351.64, w: 16.92, h: 16.9 },
  { stallNumber: 129, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "South Hall", widthM: 3, depthM: 3, x: 773.87, y: 368.53, w: 16.92, h: 16.9 },
  { stallNumber: 130, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "South Hall", widthM: 3, depthM: 3, x: 773.87, y: 385.43, w: 16.92, h: 16.9 },
  { stallNumber: 131, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "South Hall", widthM: 3, depthM: 3, x: 773.87, y: 402.33, w: 16.92, h: 16.9 },
  { stallNumber: 132, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "South Hall", widthM: 3, depthM: 3, x: 773.87, y: 419.22, w: 16.92, h: 16.9 },
  { stallNumber: 133, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "South Hall", widthM: 3, depthM: 3, x: 773.87, y: 436.12, w: 16.92, h: 16.9 },
  { stallNumber: 134, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "South Hall", widthM: 3, depthM: 3, x: 773.87, y: 453.01, w: 16.92, h: 16.9 },
  { stallNumber: 135, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "South Hall", widthM: 3, depthM: 3, x: 773.87, y: 469.91, w: 16.92, h: 16.9 },
  { stallNumber: 136, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "South Hall", widthM: 3, depthM: 3, x: 773.87, y: 486.81, w: 16.92, h: 16.9 },
  { stallNumber: 137, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "South Hall", widthM: 3, depthM: 6, x: 740.03, y: 486.81, w: 16.92, h: 33.79 },
  { stallNumber: 138, size: "12M x 3M", sheetSize: "3m x 12m", areaSqm: 36, areaSqft: 400, zone: "South Hall", widthM: 3, depthM: 12, x: 740.03, y: 419.22, w: 16.92, h: 67.58 },
  { stallNumber: 139, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "South Hall", widthM: 3, depthM: 3, x: 740.03, y: 402.33, w: 16.92, h: 16.9 },
  { stallNumber: 140, size: "18M x 3M", sheetSize: "3m x 18m", areaSqm: 54, areaSqft: 600, zone: "South Hall", widthM: 3, depthM: 18, x: 723.11, y: 351.64, w: 16.92, h: 101.38 },
  { stallNumber: 141, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "South Hall", widthM: 3, depthM: 6, x: 723.11, y: 453.01, w: 16.92, h: 33.79 },
  { stallNumber: 142, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "South Hall", widthM: 3, depthM: 6, x: 723.11, y: 486.81, w: 16.92, h: 33.79 },
  { stallNumber: 143, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "South Hall", widthM: 3, depthM: 3, x: 689.28, y: 503.7, w: 16.92, h: 16.9 },
  { stallNumber: 144, size: "9M x 3M", sheetSize: "3m x 9m", areaSqm: 27, areaSqft: 300, zone: "South Hall", widthM: 3, depthM: 9, x: 689.28, y: 419.22, w: 16.92, h: 50.69 },
  { stallNumber: 145, size: "9M x 3M", sheetSize: "3m x 9m", areaSqm: 27, areaSqft: 300, zone: "South Hall", widthM: 3, depthM: 9, x: 689.28, y: 351.64, w: 16.92, h: 50.69 },
  { stallNumber: 146, size: "12M x 3M", sheetSize: "3m x 12m", areaSqm: 36, areaSqft: 400, zone: "South Hall", widthM: 3, depthM: 12, x: 672.36, y: 351.64, w: 16.92, h: 67.58 },
  { stallNumber: 147, size: "9M x 3M", sheetSize: "3m x 9m", areaSqm: 27, areaSqft: 300, zone: "South Hall", widthM: 3, depthM: 9, x: 672.36, y: 419.22, w: 16.92, h: 50.69 },
  { stallNumber: 148, size: "9M x 3M", sheetSize: "3m x 9m", areaSqm: 27, areaSqft: 300, zone: "South Hall", widthM: 3, depthM: 9, x: 672.36, y: 469.91, w: 16.92, h: 50.69 },
  { stallNumber: 149, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "South Hall", widthM: 3, depthM: 6, x: 638.52, y: 486.81, w: 16.92, h: 33.79 },
  { stallNumber: 150, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "South Hall", widthM: 3, depthM: 6, x: 638.52, y: 453.01, w: 16.92, h: 33.79 },
  { stallNumber: 151, size: "18M x 3M", sheetSize: "3m x 18m", areaSqm: 54, areaSqft: 600, zone: "South Hall", widthM: 3, depthM: 18, x: 638.52, y: 351.64, w: 16.92, h: 101.38 },
  { stallNumber: 152, size: "18M x 3M", sheetSize: "3m x 18m", areaSqm: 54, areaSqft: 600, zone: "South Hall", widthM: 3, depthM: 18, x: 621.6, y: 351.64, w: 16.92, h: 101.38 },
  { stallNumber: 153, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "South Hall", widthM: 3, depthM: 6, x: 621.6, y: 453.01, w: 16.92, h: 33.79 },
  { stallNumber: 154, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "South Hall", widthM: 3, depthM: 6, x: 621.6, y: 486.81, w: 16.92, h: 33.79 },
  { stallNumber: 155, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "South Hall", widthM: 3, depthM: 6, x: 587.76, y: 486.81, w: 16.92, h: 33.79 },
  { stallNumber: 156, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "South Hall", widthM: 3, depthM: 6, x: 587.76, y: 453.01, w: 16.92, h: 33.79 },
  { stallNumber: 157, size: "18M x 3M", sheetSize: "3m x 18m", areaSqm: 54, areaSqft: 600, zone: "South Hall", widthM: 3, depthM: 18, x: 587.76, y: 351.64, w: 16.92, h: 101.38 },
  { stallNumber: 158, size: "18M x 3M", sheetSize: "3m x 18m", areaSqm: 54, areaSqft: 600, zone: "South Hall", widthM: 3, depthM: 18, x: 570.84, y: 351.64, w: 16.92, h: 101.38 },
  { stallNumber: 159, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "South Hall", widthM: 3, depthM: 6, x: 570.84, y: 453.01, w: 16.92, h: 33.79 },
  { stallNumber: 160, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "South Hall", widthM: 3, depthM: 6, x: 570.84, y: 486.81, w: 16.92, h: 33.79 },
  { stallNumber: 161, size: "18M x 3M", sheetSize: "3m x 18m", areaSqm: 54, areaSqft: 600, zone: "South Hall", widthM: 3, depthM: 18, x: 260.66, y: 351.64, w: 16.92, h: 101.38 },
  { stallNumber: 162, size: "24M x 3M", sheetSize: "3m x 24m", areaSqm: 72, areaSqft: 800, zone: "South Hall", widthM: 3, depthM: 24, x: 226.82, y: 351.64, w: 16.92, h: 135.17 },
  { stallNumber: 163, size: "24M x 3M", sheetSize: "3m x 24m", areaSqm: 72, areaSqft: 800, zone: "South Hall", widthM: 3, depthM: 24, x: 209.9, y: 351.64, w: 16.92, h: 135.17 },
  { stallNumber: 164, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "South Hall", widthM: 3, depthM: 6, x: 176.06, y: 419.22, w: 16.92, h: 33.79 },
  { stallNumber: 165, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "South Hall", widthM: 3, depthM: 6, x: 176.06, y: 385.43, w: 16.92, h: 33.79 },
  { stallNumber: 166, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "South Hall", widthM: 3, depthM: 3, x: 176.06, y: 368.53, w: 16.92, h: 16.9 },
  { stallNumber: 167, size: "12M x 3M", sheetSize: "3m x 12m", areaSqm: 36, areaSqft: 400, zone: "South Hall", widthM: 3, depthM: 12, x: 159.14, y: 351.64, w: 16.92, h: 67.58 },
  { stallNumber: 168, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "South Hall", widthM: 3, depthM: 6, x: 159.14, y: 419.22, w: 16.92, h: 33.79 },
  { stallNumber: 169, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "South Hall", widthM: 3, depthM: 3, x: 226.82, y: 520.6, w: 16.92, h: 16.9 },
  { stallNumber: 170, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "South Hall", widthM: 3, depthM: 3, x: 243.74, y: 520.6, w: 16.92, h: 16.9 },
  { stallNumber: 172, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "South Hall", widthM: 3, depthM: 3, x: 260.66, y: 520.6, w: 16.92, h: 16.9 },
  { stallNumber: 9001, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "South Hall", widthM: 3, depthM: 3, x: 773.87, y: 503.7, w: 16.92, h: 16.9,
    halves: [
      { id: "136A", size: "3M x 3M", x: 773.87, y: 503.7, w: 16.92, h: 16.9 },
    ] },
  { stallNumber: 9002, size: "9M x 3M", sheetSize: "3m x 9m", areaSqm: 27, areaSqft: 300, zone: "South Hall", widthM: 3, depthM: 9, x: 740.03, y: 351.64, w: 16.92, h: 50.69,
    halves: [
      { id: "139A", size: "9M x 3M", x: 740.03, y: 351.64, w: 16.92, h: 50.69 },
    ] },
  { stallNumber: 9003, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "South Hall", widthM: 3, depthM: 3, x: 176.06, y: 351.64, w: 16.92, h: 16.9,
    halves: [
      { id: "166A", size: "3M x 3M", x: 176.06, y: 351.64, w: 16.92, h: 16.9 },
    ] },
  { stallNumber: 9004, size: "6M x 3M", sheetSize: "3m x 6m", areaSqm: 18, areaSqft: 200, zone: "South Hall", widthM: 3, depthM: 6, x: 176.06, y: 453.01, w: 16.92, h: 33.79,
    halves: [
      { id: "163A", size: "6M x 3M", x: 176.06, y: 453.01, w: 16.92, h: 33.79 },
    ] },
  { stallNumber: 9005, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "South Hall", widthM: 3, depthM: 3, x: 689.28, y: 469.91, w: 16.92, h: 16.9,
    halves: [
      { id: "143B", size: "3M x 3M", x: 689.28, y: 469.91, w: 16.92, h: 16.9 },
      { id: "143A", size: "3M x 3M", x: 689.28, y: 486.81, w: 16.92, h: 16.9 },
    ] },
  { stallNumber: 9006, size: "12M x 3M", sheetSize: "3m x 12m", areaSqm: 36, areaSqft: 400, zone: "South Hall", widthM: 3, depthM: 12, x: 260.66, y: 453.01, w: 16.92, h: 67.58,
    halves: [
      { id: "161A", size: "12M x 3M", x: 260.66, y: 453.01, w: 16.92, h: 67.58 },
    ] },
  { stallNumber: 9007, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "North Hall", widthM: 3, depthM: 3, x: 632.88, y: 115.09, w: 16.92, h: 16.9,
    halves: [
      { id: "92A", size: "3M x 3M", x: 632.88, y: 115.09, w: 16.92, h: 16.9 },
    ] },
  { stallNumber: 9008, size: "3M x 3M", sheetSize: "3m x 3m", areaSqm: 9, areaSqft: 100, zone: "North Hall", widthM: 3, depthM: 3, x: 683.64, y: 98.2, w: 16.92, h: 16.9,
    halves: [
      { id: "102A", size: "3M x 3M", x: 683.64, y: 98.2, w: 16.92, h: 16.9 },
    ] },
];

export const TOTAL_STALLS_2026 = STALL_MAP_2026.length;

export const STALL_COUNT_BY_SIZE: Record<string, number> = {
  "6M x 3M": 49,
  "3M x 3M": 40,
  "18M x 3M": 26,
  "12M x 3M": 20,
  "9M x 3M": 17,
  "30M x 3M": 7,
  "24M x 3M": 5,
  "36M x 3M": 1,
  "42M x 6M": 1,
  "30M x 6M": 1,
};

export function getStall(stallNumber: number): Stall2026 | undefined {
  return STALL_MAP_2026.find((s) => s.stallNumber === stallNumber);
}

export function getStallsBySize(size: string): Stall2026[] {
  return STALL_MAP_2026.filter((s) => s.size === size);
}

/**
 * Every lettable 100 sqft module on the floor: a 200 sqft bay counts as
 * its two halves, everything else as itself. A 200 sqft exhibitor takes
 * both halves of one bay.
 */
export const STALL_UNITS_2026: {
  id: string;
  stallNumber: number;
  areaSqft: number;
}[] = STALL_MAP_2026.flatMap((s) =>
  s.halves
    ? s.halves.map((h) => {
        let sqft = 100;
        if (h.size) {
          const match = h.size.match(/^(\d+)M\s*x\s*(\d+)M$/i);
          if (match) {
            sqft = Math.round((parseInt(match[1], 10) * parseInt(match[2], 10)) / 0.09);
          }
        }
        return {
          id: h.id,
          stallNumber: s.stallNumber,
          areaSqft: sqft,
        };
      })
    : [{ id: String(s.stallNumber), stallNumber: s.stallNumber,
         areaSqft: s.areaSqft }]
);

/** The two halves of a 200 sqft bay, or [] for any other stall. */
export function getHalves(stallNumber: number): StallHalf[] {
  return getStall(stallNumber)?.halves ?? [];
}

/** Hand-allotted before the draw. */
export const RESERVED_STALLS_2026: Stall2026[] =
  STALL_MAP_2026.filter((s) => s.reservedFor);

/** The stalls the lucky draw may allot. */
export const DRAWABLE_STALLS_2026: Stall2026[] =
  STALL_MAP_2026.filter((s) => !s.reservedFor);

/**
 * Stalls matching a size as the exhibitor sheet writes it, e.g. "3m x 18m".
 * Accepts the sheet's older spellings too, so "3m x 60m" still finds the
 * 30m x 6m block and "3m x 78m" the 42m x 6m one.
 */
export function getStallsBySheetSize(sheetSize: string): Stall2026[] {
  const wanted = sheetSize.trim().toLowerCase();
  return STALL_MAP_2026.filter(
    (s) => s.sheetSize === wanted || s.sheetAliases?.includes(wanted)
  );
}
