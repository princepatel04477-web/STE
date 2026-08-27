/**
 * STE 2026 master stall map - generated from Final-Layout-STE-2026.svg.
 *
 * Do not hand-edit. Regenerate with:  python scripts/number_stalls.py
 *
 * 153 stalls, 5229 sqm:
 *   6M x 3M     47
 *   3M x 3M     29
 *   18M x 3M    26
 *   12M x 3M    19
 *   9M x 3M     16
 *   30M x 3M     7
 *   24M x 3M     6
 *   36M x 3M     1
 *   42M x 6M     1
 *   30M x 6M     1
 *
 * x/y/w/h are the stall's rectangle in the floor-plan SVG's own
 * coordinate space (1 metre = 5.638 units), so they can be used to draw
 * or hit-test the plan directly.
 */

export type StallZone = "North Wall Strip" | "North Hall" | "South Hall";

/** One lettable part of a bay that was cut. */
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

export interface Stall2026 {
  /** 1..153, walked west to east: north wall strip, north hall, south hall. */
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
}

export const STALL_MAP_2026: Stall2026[] = [
  { stallNumber: 1,   size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "North Wall Strip",   widthM:  6, depthM:  3, x:   41.04, y:  47.88, w:  32.76, h:  15.84, legacyNumber: "111" },
  { stallNumber: 2,   size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "North Wall Strip",   widthM:  6, depthM:  3, x:   74.52, y:  47.88, w:  33.12, h:  15.84, legacyNumber: "112" },
  { stallNumber: 3,   size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "North Wall Strip",   widthM:  6, depthM:  3, x:  108.36, y:  47.88, w:  33.12, h:  15.84, legacyNumber: undefined },
  { stallNumber: 4,   size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "North Wall Strip",   widthM:  6, depthM:  3, x:  142.20, y:  47.88, w:  33.12, h:  15.84, legacyNumber: undefined },
  { stallNumber: 5,   size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "North Wall Strip",   widthM:  6, depthM:  3, x:  176.04, y:  47.88, w:  33.12, h:  15.84, legacyNumber: undefined },
  { stallNumber: 6,   size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "North Wall Strip",   widthM:  6, depthM:  3, x:  209.88, y:  47.88, w:  33.12, h:  15.84, legacyNumber: undefined },
  { stallNumber: 7,   size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "North Wall Strip",   widthM:  6, depthM:  3, x:  243.72, y:  47.88, w:  33.12, h:  15.84, legacyNumber: undefined },
  { stallNumber: 8,   size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "North Wall Strip",   widthM:  6, depthM:  3, x:  294.48, y:  47.88, w:  33.12, h:  15.84, legacyNumber: undefined },
  { stallNumber: 9,   size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "North Wall Strip",   widthM:  6, depthM:  3, x:  328.32, y:  47.88, w:  33.12, h:  15.84, legacyNumber: undefined },
  { stallNumber: 10,  size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "North Wall Strip",   widthM:  6, depthM:  3, x:  362.16, y:  47.88, w:  33.12, h:  15.84, legacyNumber: undefined },
  { stallNumber: 11,  size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "North Wall Strip",   widthM:  6, depthM:  3, x:  396.00, y:  47.88, w:  33.12, h:  15.84, legacyNumber: undefined },
  { stallNumber: 12,  size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "North Wall Strip",   widthM:  6, depthM:  3, x:  429.84, y:  47.88, w:  33.12, h:  15.84, legacyNumber: undefined },
  { stallNumber: 13,  size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "North Wall Strip",   widthM:  6, depthM:  3, x:  463.68, y:  47.88, w:  33.12, h:  15.84, legacyNumber: undefined },
  { stallNumber: 14,  size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "North Wall Strip",   widthM:  6, depthM:  3, x:  497.52, y:  47.88, w:  33.12, h:  15.84, legacyNumber: undefined },
  { stallNumber: 15,  size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "North Wall Strip",   widthM:  6, depthM:  3, x:  548.28, y:  47.88, w:  33.12, h:  15.84, legacyNumber: undefined },
  { stallNumber: 16,  size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "North Wall Strip",   widthM:  6, depthM:  3, x:  582.12, y:  47.88, w:  33.12, h:  15.84, legacyNumber: undefined },
  { stallNumber: 17,  size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "North Wall Strip",   widthM:  6, depthM:  3, x:  615.96, y:  47.88, w:  33.12, h:  15.84, legacyNumber: undefined },
  { stallNumber: 18,  size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "North Wall Strip",   widthM:  6, depthM:  3, x:  649.80, y:  47.88, w:  33.12, h:  15.84, legacyNumber: undefined },
  { stallNumber: 19,  size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "North Wall Strip",   widthM:  6, depthM:  3, x:  683.64, y:  47.88, w:  33.12, h:  15.84, legacyNumber: undefined },
  { stallNumber: 20,  size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "North Wall Strip",   widthM:  6, depthM:  3, x:  717.48, y:  47.88, w:  33.12, h:  15.84, legacyNumber: undefined },
  { stallNumber: 21,  size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "North Wall Strip",   widthM:  6, depthM:  3, x:  751.32, y:  47.88, w:  32.88, h:  15.84, legacyNumber: undefined },
  { stallNumber: 22,  size: "30M x 3M",  sheetSize: "3m x 30m",  areaSqm: 90,   areaSqft: 1000,  zone: "North Hall",         widthM:  3, depthM: 30, x:   40.68, y: 148.56, w:  16.20, h: 168.48, legacyNumber: "109" },
  { stallNumber: 23,  size: "30M x 3M",  sheetSize: "3m x 30m",  areaSqm: 90,   areaSqft: 1000,  zone: "North Hall",         widthM:  3, depthM: 30, x:   74.52, y: 148.56, w:  16.20, h: 168.48, legacyNumber: "108" },
  { stallNumber: 24,  size: "30M x 3M",  sheetSize: "3m x 30m",  areaSqm: 90,   areaSqft: 1000,  zone: "North Hall",         widthM:  3, depthM: 30, x:   91.44, y: 148.56, w:  16.20, h: 168.48, legacyNumber: "107" },
  { stallNumber: 25,  size: "30M x 3M",  sheetSize: "3m x 30m",  areaSqm: 90,   areaSqft: 1000,  zone: "North Hall",         widthM:  3, depthM: 30, x:  125.28, y: 148.56, w:  16.20, h: 168.48, legacyNumber: "106" },
  { stallNumber: 26,  size: "30M x 3M",  sheetSize: "3m x 30m",  areaSqm: 90,   areaSqft: 1000,  zone: "North Hall",         widthM:  3, depthM: 30, x:  142.20, y: 148.56, w:  16.20, h: 168.48, legacyNumber: "105" },
  { stallNumber: 27,  size: "36M x 3M",  sheetSize: "3m x 36m",  areaSqm: 108,  areaSqft: 1200,  zone: "North Hall",         widthM:  3, depthM: 36, x:  683.64, y: 114.96, w:  16.20, h: 202.08, legacyNumber: "103", reservedFor: "K.K. Garments" },
  { stallNumber: 28,  size: "30M x 3M",  sheetSize: "3m x 30m",  areaSqm: 90,   areaSqft: 1000,  zone: "North Hall",         widthM:  3, depthM: 30, x:  700.56, y: 148.56, w:  16.20, h: 168.48, legacyNumber: "106" },
  { stallNumber: 29,  size: "30M x 3M",  sheetSize: "3m x 30m",  areaSqm: 90,   areaSqft: 1000,  zone: "North Hall",         widthM:  3, depthM: 30, x:  734.40, y: 148.56, w:  16.20, h: 168.48, legacyNumber: "105" },
  { stallNumber: 30,  size: "12M x 3M",  sheetSize: "3m x 12m",  areaSqm: 36,   areaSqft: 400,   zone: "North Hall",         widthM:  3, depthM: 12, x:   41.04, y:  81.36, w:  15.84, h:  66.48, legacyNumber: undefined },
  { stallNumber: 31,  size: "12M x 3M",  sheetSize: "3m x 12m",  areaSqm: 36,   areaSqft: 400,   zone: "North Hall",         widthM:  3, depthM: 12, x:   74.52, y:  81.36, w:  16.20, h:  66.48, legacyNumber: undefined },
  { stallNumber: 32,  size: "12M x 3M",  sheetSize: "3m x 12m",  areaSqm: 36,   areaSqft: 400,   zone: "North Hall",         widthM:  3, depthM: 12, x:   91.44, y:  81.36, w:  16.20, h:  66.48, legacyNumber: undefined },
  { stallNumber: 33,  size: "12M x 3M",  sheetSize: "3m x 12m",  areaSqm: 36,   areaSqft: 400,   zone: "North Hall",         widthM:  3, depthM: 12, x:  125.28, y:  81.36, w:  16.20, h:  66.48, legacyNumber: undefined },
  { stallNumber: 34,  size: "12M x 3M",  sheetSize: "3m x 12m",  areaSqm: 36,   areaSqft: 400,   zone: "North Hall",         widthM:  3, depthM: 12, x:  142.20, y:  81.36, w:  16.20, h:  66.48, legacyNumber: undefined },
  { stallNumber: 35,  size: "24M x 3M",  sheetSize: "3m x 24m",  areaSqm: 72,   areaSqft: 800,   zone: "North Hall",         widthM:  3, depthM: 24, x:  176.04, y: 182.40, w:  16.20, h: 134.64, legacyNumber: undefined },
  { stallNumber: 36,  size: "18M x 3M",  sheetSize: "3m x 18m",  areaSqm: 54,   areaSqft: 600,   zone: "North Hall",         widthM:  3, depthM: 18, x:  176.04, y:  81.36, w:  16.20, h: 100.32, legacyNumber: undefined },
  { stallNumber: 37,  size: "24M x 3M",  sheetSize: "3m x 24m",  areaSqm: 72,   areaSqft: 800,   zone: "North Hall",         widthM:  3, depthM: 24, x:  192.96, y: 182.40, w:  16.20, h: 134.64, legacyNumber: undefined },
  { stallNumber: 38,  size: "18M x 3M",  sheetSize: "3m x 18m",  areaSqm: 54,   areaSqft: 600,   zone: "North Hall",         widthM:  3, depthM: 18, x:  192.96, y:  81.36, w:  16.20, h: 100.32, legacyNumber: undefined },
  { stallNumber: 39,  size: "42M x 6M",  sheetSize: "42m x 6m",  areaSqm: 252,  areaSqft: 2600,  zone: "North Hall",         widthM:  6, depthM: 42, x:  226.80, y:  81.36, w:  33.12, h: 235.68, legacyNumber: "101", sheetAliases: ["3m x 78m"], reservedFor: "SARAOGI SUPER SALES PRIVATE LIMITED" },
  { stallNumber: 40,  size: "30M x 6M",  sheetSize: "30m x 6m",  areaSqm: 180,  areaSqft: 2000,  zone: "North Hall",         widthM:  6, depthM: 30, x:  277.56, y: 148.56, w:  33.12, h: 168.48, legacyNumber: "102", sheetAliases: ["3m x 60m"], reservedFor: "Murtidhara Sarees / Shyamraj" },
  { stallNumber: 41,  size: "12M x 3M",  sheetSize: "3m x 12m",  areaSqm: 36,   areaSqft: 400,   zone: "North Hall",         widthM:  3, depthM: 12, x:  277.56, y:  81.36, w:  16.20, h:  66.48, legacyNumber: undefined },
  { stallNumber: 42,  size: "12M x 3M",  sheetSize: "3m x 12m",  areaSqm: 36,   areaSqft: 400,   zone: "North Hall",         widthM:  3, depthM: 12, x:  294.48, y:  81.36, w:  16.20, h:  66.48, legacyNumber: undefined },
  { stallNumber: 43,  size: "18M x 3M",  sheetSize: "3m x 18m",  areaSqm: 54,   areaSqft: 600,   zone: "North Hall",         widthM:  3, depthM: 18, x:  328.32, y: 216.24, w:  16.20, h: 100.80, legacyNumber: undefined },
  { stallNumber: 44,  size: "12M x 3M",  sheetSize: "3m x 12m",  areaSqm: 36,   areaSqft: 400,   zone: "North Hall",         widthM:  3, depthM: 12, x:  328.32, y: 148.56, w:  16.20, h:  66.96, legacyNumber: undefined },
  { stallNumber: 45,  size: "12M x 3M",  sheetSize: "3m x 12m",  areaSqm: 36,   areaSqft: 400,   zone: "North Hall",         widthM:  3, depthM: 12, x:  328.32, y:  81.36, w:  16.20, h:  66.48, legacyNumber: undefined },
  { stallNumber: 46,  size: "18M x 3M",  sheetSize: "3m x 18m",  areaSqm: 54,   areaSqft: 600,   zone: "North Hall",         widthM:  3, depthM: 18, x:  345.24, y: 216.24, w:  16.20, h: 100.80, legacyNumber: undefined },
  { stallNumber: 47,  size: "12M x 3M",  sheetSize: "3m x 12m",  areaSqm: 36,   areaSqft: 400,   zone: "North Hall",         widthM:  3, depthM: 12, x:  345.24, y: 148.56, w:  16.20, h:  66.96, legacyNumber: undefined },
  { stallNumber: 48,  size: "12M x 3M",  sheetSize: "3m x 12m",  areaSqm: 36,   areaSqft: 400,   zone: "North Hall",         widthM:  3, depthM: 12, x:  345.24, y:  81.36, w:  16.20, h:  66.48, legacyNumber: undefined },
  { stallNumber: 49,  size: "18M x 3M",  sheetSize: "3m x 18m",  areaSqm: 54,   areaSqft: 600,   zone: "North Hall",         widthM:  3, depthM: 18, x:  379.08, y: 216.24, w:  16.20, h: 100.80, legacyNumber: undefined },
  { stallNumber: 50,  size: "12M x 3M",  sheetSize: "3m x 12m",  areaSqm: 36,   areaSqft: 400,   zone: "North Hall",         widthM:  3, depthM: 12, x:  379.08, y: 148.56, w:  16.20, h:  66.96, legacyNumber: undefined },
  { stallNumber: 51,  size: "12M x 3M",  sheetSize: "3m x 12m",  areaSqm: 36,   areaSqft: 400,   zone: "North Hall",         widthM:  3, depthM: 12, x:  379.08, y:  81.36, w:  16.20, h:  66.48, legacyNumber: undefined },
  { stallNumber: 52,  size: "18M x 3M",  sheetSize: "3m x 18m",  areaSqm: 54,   areaSqft: 600,   zone: "North Hall",         widthM:  3, depthM: 18, x:  396.00, y: 216.24, w:  16.20, h: 100.80, legacyNumber: undefined },
  { stallNumber: 53,  size: "18M x 3M",  sheetSize: "3m x 18m",  areaSqm: 54,   areaSqft: 600,   zone: "North Hall",         widthM:  3, depthM: 18, x:  396.00, y: 114.96, w:  16.20, h: 100.56, legacyNumber: undefined },
  { stallNumber: 54,  size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "North Hall",         widthM:  3, depthM:  6, x:  396.00, y:  81.36, w:  16.20, h:  32.88, legacyNumber: undefined },
  { stallNumber: 55,  size: "18M x 3M",  sheetSize: "3m x 18m",  areaSqm: 54,   areaSqft: 600,   zone: "North Hall",         widthM:  3, depthM: 18, x:  429.84, y: 216.24, w:  16.20, h: 100.80, legacyNumber: undefined },
  { stallNumber: 56,  size: "18M x 3M",  sheetSize: "3m x 18m",  areaSqm: 54,   areaSqft: 600,   zone: "North Hall",         widthM:  3, depthM: 18, x:  429.84, y: 114.96, w:  16.20, h: 100.56, legacyNumber: undefined },
  { stallNumber: 57,  size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "North Hall",         widthM:  3, depthM:  6, x:  429.84, y:  81.36, w:  16.20, h:  32.88, legacyNumber: undefined },
  { stallNumber: 58,  size: "18M x 3M",  sheetSize: "3m x 18m",  areaSqm: 54,   areaSqft: 600,   zone: "North Hall",         widthM:  3, depthM: 18, x:  446.76, y: 216.24, w:  16.20, h: 100.80, legacyNumber: undefined },
  { stallNumber: 59,  size: "18M x 3M",  sheetSize: "3m x 18m",  areaSqm: 54,   areaSqft: 600,   zone: "North Hall",         widthM:  3, depthM: 18, x:  446.76, y: 114.96, w:  16.20, h: 100.56, legacyNumber: undefined },
  { stallNumber: 60,  size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "North Hall",         widthM:  3, depthM:  6, x:  446.76, y:  81.36, w:  16.20, h:  32.88, legacyNumber: undefined },
  { stallNumber: 61,  size: "18M x 3M",  sheetSize: "3m x 18m",  areaSqm: 54,   areaSqft: 600,   zone: "North Hall",         widthM:  3, depthM: 18, x:  480.60, y: 216.24, w:  16.20, h: 100.80, legacyNumber: undefined },
  { stallNumber: 62,  size: "18M x 3M",  sheetSize: "3m x 18m",  areaSqm: 54,   areaSqft: 600,   zone: "North Hall",         widthM:  3, depthM: 18, x:  480.60, y: 114.96, w:  16.20, h: 100.56, legacyNumber: undefined },
  { stallNumber: 63,  size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "North Hall",         widthM:  3, depthM:  6, x:  480.60, y:  81.36, w:  16.20, h:  32.88, legacyNumber: undefined },
  { stallNumber: 64,  size: "18M x 3M",  sheetSize: "3m x 18m",  areaSqm: 54,   areaSqft: 600,   zone: "North Hall",         widthM:  3, depthM: 18, x:  497.52, y: 216.24, w:  16.20, h: 100.80, legacyNumber: undefined },
  { stallNumber: 65,  size: "18M x 3M",  sheetSize: "3m x 18m",  areaSqm: 54,   areaSqft: 600,   zone: "North Hall",         widthM:  3, depthM: 18, x:  497.52, y: 114.96, w:  16.20, h: 100.56, legacyNumber: undefined },
  { stallNumber: 66,  size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "North Hall",         widthM:  3, depthM:  6, x:  497.52, y:  81.36, w:  16.20, h:  32.88, legacyNumber: undefined },
  { stallNumber: 67,  size: "18M x 3M",  sheetSize: "3m x 18m",  areaSqm: 54,   areaSqft: 600,   zone: "North Hall",         widthM:  3, depthM: 18, x:  531.36, y: 216.24, w:  16.20, h: 100.80, legacyNumber: undefined },
  { stallNumber: 68,  size: "18M x 3M",  sheetSize: "3m x 18m",  areaSqm: 54,   areaSqft: 600,   zone: "North Hall",         widthM:  3, depthM: 18, x:  531.36, y: 114.96, w:  16.20, h: 100.56, legacyNumber: undefined },
  { stallNumber: 69,  size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "North Hall",         widthM:  3, depthM:  6, x:  531.36, y:  81.36, w:  16.20, h:  32.88, legacyNumber: undefined },
  { stallNumber: 70,  size: "18M x 3M",  sheetSize: "3m x 18m",  areaSqm: 54,   areaSqft: 600,   zone: "North Hall",         widthM:  3, depthM: 18, x:  548.28, y: 216.24, w:  16.20, h: 100.80, legacyNumber: undefined },
  { stallNumber: 71,  size: "18M x 3M",  sheetSize: "3m x 18m",  areaSqm: 54,   areaSqft: 600,   zone: "North Hall",         widthM:  3, depthM: 18, x:  548.28, y: 114.96, w:  16.20, h: 100.56, legacyNumber: undefined },
  { stallNumber: 72,  size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "North Hall",         widthM:  3, depthM:  6, x:  548.28, y:  81.36, w:  16.20, h:  32.88, legacyNumber: undefined },
  { stallNumber: 73,  size: "18M x 3M",  sheetSize: "3m x 18m",  areaSqm: 54,   areaSqft: 600,   zone: "North Hall",         widthM:  3, depthM: 18, x:  582.12, y: 216.24, w:  16.20, h: 100.80, legacyNumber: undefined },
  { stallNumber: 74,  size: "9M x 3M",   sheetSize: "3m x 9m",   areaSqm: 27,   areaSqft: 300,   zone: "North Hall",         widthM:  3, depthM:  9, x:  582.12, y: 165.48, w:  16.20, h:  50.04, legacyNumber: undefined },
  { stallNumber: 75,  size: "9M x 3M",   sheetSize: "3m x 9m",   areaSqm: 27,   areaSqft: 300,   zone: "North Hall",         widthM:  3, depthM:  9, x:  582.12, y: 114.96, w:  16.20, h:  49.80, legacyNumber: undefined },
  { stallNumber: 76,  size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "North Hall",         widthM:  3, depthM:  6, x:  582.12, y:  81.36, w:  16.20, h:  32.88, legacyNumber: undefined },
  { stallNumber: 77,  size: "18M x 3M",  sheetSize: "3m x 18m",  areaSqm: 54,   areaSqft: 600,   zone: "North Hall",         widthM:  3, depthM: 18, x:  599.04, y: 216.24, w:  16.20, h: 100.80, legacyNumber: undefined },
  { stallNumber: 78,  size: "9M x 3M",   sheetSize: "3m x 9m",   areaSqm: 27,   areaSqft: 300,   zone: "North Hall",         widthM:  3, depthM:  9, x:  599.04, y: 165.48, w:  16.20, h:  50.04, legacyNumber: undefined },
  { stallNumber: 79,  size: "9M x 3M",   sheetSize: "3m x 9m",   areaSqm: 27,   areaSqft: 300,   zone: "North Hall",         widthM:  3, depthM:  9, x:  599.04, y: 114.96, w:  16.20, h:  49.80, legacyNumber: undefined },
  { stallNumber: 80,  size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "North Hall",         widthM:  3, depthM:  6, x:  599.04, y:  81.36, w:  16.20, h:  32.88, legacyNumber: undefined },
  { stallNumber: 81,  size: "9M x 3M",   sheetSize: "3m x 9m",   areaSqm: 27,   areaSqft: 300,   zone: "North Hall",         widthM:  3, depthM:  9, x:  632.88, y: 267.00, w:  16.20, h:  50.04, legacyNumber: undefined },
  { stallNumber: 82,  size: "9M x 3M",   sheetSize: "3m x 9m",   areaSqm: 27,   areaSqft: 300,   zone: "North Hall",         widthM:  3, depthM:  9, x:  632.88, y: 216.24, w:  16.20, h:  50.04, legacyNumber: undefined },
  { stallNumber: 83,  size: "9M x 3M",   sheetSize: "3m x 9m",   areaSqm: 27,   areaSqft: 300,   zone: "North Hall",         widthM:  3, depthM:  9, x:  632.88, y: 165.48, w:  16.20, h:  50.04, legacyNumber: undefined },
  { stallNumber: 84,  size: "9M x 3M",   sheetSize: "3m x 9m",   areaSqm: 27,   areaSqft: 300,   zone: "North Hall",         widthM:  3, depthM:  9, x:  632.88, y: 114.96, w:  16.20, h:  49.80, legacyNumber: undefined },
  { stallNumber: 85,  size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "North Hall",         widthM:  3, depthM:  6, x:  632.88, y:  81.36, w:  16.20, h:  32.88, legacyNumber: undefined },
  { stallNumber: 86,  size: "9M x 3M",   sheetSize: "3m x 9m",   areaSqm: 27,   areaSqft: 300,   zone: "North Hall",         widthM:  3, depthM:  9, x:  649.80, y: 267.00, w:  16.20, h:  50.04, legacyNumber: undefined },
  { stallNumber: 87,  size: "9M x 3M",   sheetSize: "3m x 9m",   areaSqm: 27,   areaSqft: 300,   zone: "North Hall",         widthM:  3, depthM:  9, x:  649.80, y: 216.24, w:  16.20, h:  50.04, legacyNumber: undefined },
  { stallNumber: 88,  size: "9M x 3M",   sheetSize: "3m x 9m",   areaSqm: 27,   areaSqft: 300,   zone: "North Hall",         widthM:  3, depthM:  9, x:  649.80, y: 165.48, w:  16.20, h:  50.04, legacyNumber: undefined },
  { stallNumber: 89,  size: "9M x 3M",   sheetSize: "3m x 9m",   areaSqm: 27,   areaSqft: 300,   zone: "North Hall",         widthM:  3, depthM:  9, x:  649.80, y: 114.96, w:  16.20, h:  49.80, legacyNumber: undefined },
  { stallNumber: 90,  size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "North Hall",         widthM:  3, depthM:  6, x:  649.80, y:  81.36, w:  16.20, h:  32.88, legacyNumber: undefined },
  { stallNumber: 91,  size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "North Hall",         widthM:  3, depthM:  6, x:  683.64, y:  81.36, w:  16.20, h:  32.88, legacyNumber: undefined, halves: [{ id: "91A", x: 683.64, y: 97.80, w: 16.20, h: 16.44 }, { id: "91B", x: 683.64, y: 81.36, w: 16.20, h: 16.44 }] },
  { stallNumber: 92,  size: "3M x 3M",   sheetSize: "3m x 3m",   areaSqm: 9,    areaSqft: 100,   zone: "North Hall",         widthM:  3, depthM:  3, x:  700.56, y: 131.64, w:  16.20, h:  16.20, legacyNumber: undefined },
  { stallNumber: 93,  size: "3M x 3M",   sheetSize: "3m x 3m",   areaSqm: 9,    areaSqft: 100,   zone: "North Hall",         widthM:  3, depthM:  3, x:  700.56, y: 114.96, w:  16.20, h:  15.96, legacyNumber: undefined },
  { stallNumber: 94,  size: "3M x 3M",   sheetSize: "3m x 3m",   areaSqm: 9,    areaSqft: 100,   zone: "North Hall",         widthM:  3, depthM:  3, x:  700.56, y:  98.28, w:  16.20, h:  15.96, legacyNumber: undefined },
  { stallNumber: 95,  size: "3M x 3M",   sheetSize: "3m x 3m",   areaSqm: 9,    areaSqft: 100,   zone: "North Hall",         widthM:  3, depthM:  3, x:  700.56, y:  81.36, w:  16.20, h:  16.20, legacyNumber: undefined },
  { stallNumber: 96,  size: "3M x 3M",   sheetSize: "3m x 3m",   areaSqm: 9,    areaSqft: 100,   zone: "North Hall",         widthM:  3, depthM:  3, x:  734.40, y: 131.64, w:  16.20, h:  16.20, legacyNumber: undefined },
  { stallNumber: 97,  size: "3M x 3M",   sheetSize: "3m x 3m",   areaSqm: 9,    areaSqft: 100,   zone: "North Hall",         widthM:  3, depthM:  3, x:  734.40, y: 114.96, w:  16.20, h:  15.96, legacyNumber: undefined },
  { stallNumber: 98,  size: "3M x 3M",   sheetSize: "3m x 3m",   areaSqm: 9,    areaSqft: 100,   zone: "North Hall",         widthM:  3, depthM:  3, x:  734.40, y:  98.28, w:  16.20, h:  15.96, legacyNumber: undefined },
  { stallNumber: 99,  size: "3M x 3M",   sheetSize: "3m x 3m",   areaSqm: 9,    areaSqft: 100,   zone: "North Hall",         widthM:  3, depthM:  3, x:  734.40, y:  81.36, w:  16.20, h:  16.20, legacyNumber: undefined },
  { stallNumber: 100, size: "24M x 3M",  sheetSize: "3m x 24m",  areaSqm: 72,   areaSqft: 800,   zone: "North Hall",         widthM:  3, depthM: 24, x:  751.32, y: 182.40, w:  16.20, h: 134.64, legacyNumber: undefined, halves: [{ id: "100A", size: "6M x 3M", x: 751.32, y: 283.38, w: 16.20, h: 33.66 }, { id: "100B", size: "18M x 3M", x: 751.32, y: 182.40, w: 16.20, h: 100.98 }] },
  { stallNumber: 101, size: "3M x 3M",   sheetSize: "3m x 3m",   areaSqm: 9,    areaSqft: 100,   zone: "North Hall",         widthM:  3, depthM:  3, x:  751.32, y: 165.48, w:  16.20, h:  16.20, legacyNumber: undefined },
  { stallNumber: 102, size: "3M x 3M",   sheetSize: "3m x 3m",   areaSqm: 9,    areaSqft: 100,   zone: "North Hall",         widthM:  3, depthM:  3, x:  751.32, y: 148.56, w:  16.20, h:  16.20, legacyNumber: undefined },
  { stallNumber: 103, size: "3M x 3M",   sheetSize: "3m x 3m",   areaSqm: 9,    areaSqft: 100,   zone: "North Hall",         widthM:  3, depthM:  3, x:  751.32, y: 131.64, w:  16.20, h:  16.20, legacyNumber: undefined },
  { stallNumber: 104, size: "3M x 3M",   sheetSize: "3m x 3m",   areaSqm: 9,    areaSqft: 100,   zone: "North Hall",         widthM:  3, depthM:  3, x:  751.32, y: 114.96, w:  16.20, h:  15.96, legacyNumber: undefined },
  { stallNumber: 105, size: "3M x 3M",   sheetSize: "3m x 3m",   areaSqm: 9,    areaSqft: 100,   zone: "North Hall",         widthM:  3, depthM:  3, x:  751.32, y:  98.28, w:  16.20, h:  15.96, legacyNumber: undefined },
  { stallNumber: 106, size: "3M x 3M",   sheetSize: "3m x 3m",   areaSqm: 9,    areaSqft: 100,   zone: "North Hall",         widthM:  3, depthM:  3, x:  751.32, y:  81.36, w:  16.20, h:  16.20, legacyNumber: undefined },
  { stallNumber: 107, size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "South Hall",         widthM:  3, depthM:  6, x:  176.04, y: 351.60, w:  16.20, h:  33.12, legacyNumber: undefined, halves: [{ id: "107A", x: 176.04, y: 351.60, w: 16.20, h: 16.56 }, { id: "107B", x: 176.04, y: 368.16, w: 16.20, h: 16.56 }] },
  { stallNumber: 108, size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "South Hall",         widthM:  3, depthM:  6, x:  176.04, y: 385.44, w:  16.20, h:  33.12, legacyNumber: undefined },
  { stallNumber: 109, size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "South Hall",         widthM:  3, depthM:  6, x:  176.04, y: 419.28, w:  16.20, h:  33.12, legacyNumber: undefined },
  { stallNumber: 110, size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "South Hall",         widthM:  3, depthM:  6, x:  176.04, y: 453.12, w:  16.20, h:  33.12, legacyNumber: undefined },
  { stallNumber: 111, size: "18M x 3M",  sheetSize: "3m x 18m",  areaSqm: 54,   areaSqft: 600,   zone: "South Hall",         widthM: 18, depthM:  3, x:  176.04, y: 503.88, w: 100.80, h:  15.96, legacyNumber: undefined },
  { stallNumber: 112, size: "24M x 3M",  sheetSize: "3m x 24m",  areaSqm: 72,   areaSqft: 800,   zone: "South Hall",         widthM:  3, depthM: 24, x:  209.88, y: 351.60, w:  16.20, h: 134.64, legacyNumber: undefined },
  { stallNumber: 113, size: "24M x 3M",  sheetSize: "3m x 24m",  areaSqm: 72,   areaSqft: 800,   zone: "South Hall",         widthM:  3, depthM: 24, x:  226.80, y: 351.60, w:  16.20, h: 134.64, legacyNumber: undefined },
  { stallNumber: 114, size: "24M x 3M",  sheetSize: "3m x 24m",  areaSqm: 72,   areaSqft: 800,   zone: "South Hall",         widthM:  3, depthM: 24, x:  260.64, y: 351.60, w:  15.96, h: 134.64, legacyNumber: undefined },
  { stallNumber: 115, size: "18M x 3M",  sheetSize: "3m x 18m",  areaSqm: 54,   areaSqft: 600,   zone: "South Hall",         widthM:  3, depthM: 18, x:  570.84, y: 351.60, w:  16.20, h: 100.80, legacyNumber: undefined },
  { stallNumber: 116, size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "South Hall",         widthM:  3, depthM:  6, x:  570.84, y: 453.12, w:  16.20, h:  33.12, legacyNumber: undefined },
  { stallNumber: 117, size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "South Hall",         widthM:  3, depthM:  6, x:  570.84, y: 486.96, w:  16.20, h:  33.12, legacyNumber: undefined },
  { stallNumber: 118, size: "18M x 3M",  sheetSize: "3m x 18m",  areaSqm: 54,   areaSqft: 600,   zone: "South Hall",         widthM:  3, depthM: 18, x:  587.76, y: 351.60, w:  16.20, h: 100.80, legacyNumber: undefined },
  { stallNumber: 119, size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "South Hall",         widthM:  3, depthM:  6, x:  587.76, y: 453.12, w:  16.20, h:  33.12, legacyNumber: undefined },
  { stallNumber: 120, size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "South Hall",         widthM:  3, depthM:  6, x:  587.76, y: 486.96, w:  16.20, h:  33.12, legacyNumber: undefined },
  { stallNumber: 121, size: "18M x 3M",  sheetSize: "3m x 18m",  areaSqm: 54,   areaSqft: 600,   zone: "South Hall",         widthM:  3, depthM: 18, x:  621.60, y: 351.60, w:  16.20, h: 100.80, legacyNumber: undefined },
  { stallNumber: 122, size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "South Hall",         widthM:  3, depthM:  6, x:  621.60, y: 453.12, w:  16.20, h:  33.12, legacyNumber: undefined },
  { stallNumber: 123, size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "South Hall",         widthM:  3, depthM:  6, x:  621.60, y: 486.96, w:  16.20, h:  33.12, legacyNumber: undefined },
  { stallNumber: 124, size: "3M x 3M",   sheetSize: "3m x 3m",   areaSqm: 9,    areaSqft: 100,   zone: "South Hall",         widthM:  3, depthM:  3, x:  621.60, y: 520.80, w:  16.20, h:  15.96, legacyNumber: undefined },
  { stallNumber: 125, size: "18M x 3M",  sheetSize: "3m x 18m",  areaSqm: 54,   areaSqft: 600,   zone: "South Hall",         widthM:  3, depthM: 18, x:  638.52, y: 351.60, w:  16.20, h: 100.80, legacyNumber: undefined },
  { stallNumber: 126, size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "South Hall",         widthM:  3, depthM:  6, x:  638.52, y: 453.12, w:  16.20, h:  33.12, legacyNumber: undefined },
  { stallNumber: 127, size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "South Hall",         widthM:  3, depthM:  6, x:  638.52, y: 486.96, w:  16.20, h:  33.12, legacyNumber: undefined },
  { stallNumber: 128, size: "3M x 3M",   sheetSize: "3m x 3m",   areaSqm: 9,    areaSqft: 100,   zone: "South Hall",         widthM:  3, depthM:  3, x:  638.52, y: 520.80, w:  16.20, h:  15.96, legacyNumber: undefined },
  { stallNumber: 129, size: "12M x 3M",  sheetSize: "3m x 12m",  areaSqm: 36,   areaSqft: 400,   zone: "South Hall",         widthM:  3, depthM: 12, x:  672.36, y: 351.60, w:  16.20, h:  66.96, legacyNumber: undefined },
  { stallNumber: 130, size: "9M x 3M",   sheetSize: "3m x 9m",   areaSqm: 27,   areaSqft: 300,   zone: "South Hall",         widthM:  3, depthM:  9, x:  672.36, y: 419.28, w:  16.20, h:  50.04, legacyNumber: undefined },
  { stallNumber: 131, size: "9M x 3M",   sheetSize: "3m x 9m",   areaSqm: 27,   areaSqft: 300,   zone: "South Hall",         widthM:  3, depthM:  9, x:  672.36, y: 470.04, w:  16.20, h:  50.04, legacyNumber: undefined },
  { stallNumber: 132, size: "12M x 3M",  sheetSize: "3m x 12m",  areaSqm: 36,   areaSqft: 400,   zone: "South Hall",         widthM:  3, depthM: 12, x:  689.28, y: 351.60, w:  16.20, h:  66.96, legacyNumber: undefined },
  { stallNumber: 133, size: "9M x 3M",   sheetSize: "3m x 9m",   areaSqm: 27,   areaSqft: 300,   zone: "South Hall",         widthM:  3, depthM:  9, x:  689.28, y: 419.28, w:  16.20, h:  50.04, legacyNumber: undefined },
  { stallNumber: 134, size: "9M x 3M",   sheetSize: "3m x 9m",   areaSqm: 27,   areaSqft: 300,   zone: "South Hall",         widthM:  3, depthM:  9, x:  689.28, y: 470.04, w:  16.20, h:  50.04, legacyNumber: undefined },
  { stallNumber: 135, size: "12M x 3M",  sheetSize: "3m x 12m",  areaSqm: 36,   areaSqft: 400,   zone: "South Hall",         widthM:  3, depthM: 12, x:  723.12, y: 351.60, w:  16.20, h:  66.96, legacyNumber: undefined },
  { stallNumber: 136, size: "12M x 3M",  sheetSize: "3m x 12m",  areaSqm: 36,   areaSqft: 400,   zone: "South Hall",         widthM:  3, depthM: 12, x:  723.12, y: 419.28, w:  16.20, h:  66.96, legacyNumber: undefined },
  { stallNumber: 137, size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "South Hall",         widthM:  3, depthM:  6, x:  723.12, y: 486.96, w:  16.20, h:  33.12, legacyNumber: undefined },
  { stallNumber: 138, size: "3M x 3M",   sheetSize: "3m x 3m",   areaSqm: 9,    areaSqft: 100,   zone: "South Hall",         widthM:  3, depthM:  3, x:  723.12, y: 520.80, w:  16.20, h:  15.96, legacyNumber: undefined },
  { stallNumber: 139, size: "12M x 3M",  sheetSize: "3m x 12m",  areaSqm: 36,   areaSqft: 400,   zone: "South Hall",         widthM:  3, depthM: 12, x:  740.04, y: 351.60, w:  16.20, h:  66.96, legacyNumber: undefined },
  { stallNumber: 140, size: "12M x 3M",  sheetSize: "3m x 12m",  areaSqm: 36,   areaSqft: 400,   zone: "South Hall",         widthM:  3, depthM: 12, x:  740.04, y: 419.28, w:  16.20, h:  66.96, legacyNumber: undefined },
  { stallNumber: 141, size: "6M x 3M",   sheetSize: "3m x 6m",   areaSqm: 18,   areaSqft: 200,   zone: "South Hall",         widthM:  3, depthM:  6, x:  740.04, y: 486.96, w:  16.20, h:  33.12, legacyNumber: undefined },
  { stallNumber: 142, size: "3M x 3M",   sheetSize: "3m x 3m",   areaSqm: 9,    areaSqft: 100,   zone: "South Hall",         widthM:  3, depthM:  3, x:  740.04, y: 520.80, w:  16.20, h:  15.96, legacyNumber: undefined },
  { stallNumber: 143, size: "3M x 3M",   sheetSize: "3m x 3m",   areaSqm: 9,    areaSqft: 100,   zone: "South Hall",         widthM:  3, depthM:  3, x:  773.88, y: 351.60, w:  15.96, h:  16.20, legacyNumber: undefined },
  { stallNumber: 144, size: "3M x 3M",   sheetSize: "3m x 3m",   areaSqm: 9,    areaSqft: 100,   zone: "South Hall",         widthM:  3, depthM:  3, x:  773.88, y: 368.52, w:  15.96, h:  16.20, legacyNumber: undefined },
  { stallNumber: 145, size: "3M x 3M",   sheetSize: "3m x 3m",   areaSqm: 9,    areaSqft: 100,   zone: "South Hall",         widthM:  3, depthM:  3, x:  773.88, y: 385.44, w:  15.96, h:  16.20, legacyNumber: undefined },
  { stallNumber: 146, size: "3M x 3M",   sheetSize: "3m x 3m",   areaSqm: 9,    areaSqft: 100,   zone: "South Hall",         widthM:  3, depthM:  3, x:  773.88, y: 402.36, w:  15.96, h:  16.20, legacyNumber: undefined },
  { stallNumber: 147, size: "3M x 3M",   sheetSize: "3m x 3m",   areaSqm: 9,    areaSqft: 100,   zone: "South Hall",         widthM:  3, depthM:  3, x:  773.88, y: 419.28, w:  15.96, h:  16.20, legacyNumber: undefined },
  { stallNumber: 148, size: "3M x 3M",   sheetSize: "3m x 3m",   areaSqm: 9,    areaSqft: 100,   zone: "South Hall",         widthM:  3, depthM:  3, x:  773.88, y: 436.20, w:  15.96, h:  16.20, legacyNumber: undefined },
  { stallNumber: 149, size: "3M x 3M",   sheetSize: "3m x 3m",   areaSqm: 9,    areaSqft: 100,   zone: "South Hall",         widthM:  3, depthM:  3, x:  773.88, y: 453.12, w:  15.96, h:  16.20, legacyNumber: undefined },
  { stallNumber: 150, size: "3M x 3M",   sheetSize: "3m x 3m",   areaSqm: 9,    areaSqft: 100,   zone: "South Hall",         widthM:  3, depthM:  3, x:  773.88, y: 470.04, w:  15.96, h:  16.20, legacyNumber: undefined },
  { stallNumber: 151, size: "3M x 3M",   sheetSize: "3m x 3m",   areaSqm: 9,    areaSqft: 100,   zone: "South Hall",         widthM:  3, depthM:  3, x:  773.88, y: 486.96, w:  15.96, h:  16.20, legacyNumber: undefined },
  { stallNumber: 152, size: "3M x 3M",   sheetSize: "3m x 3m",   areaSqm: 9,    areaSqft: 100,   zone: "South Hall",         widthM:  3, depthM:  3, x:  773.88, y: 503.88, w:  15.96, h:  16.20, legacyNumber: undefined },
  { stallNumber: 153, size: "3M x 3M",   sheetSize: "3m x 3m",   areaSqm: 9,    areaSqft: 100,   zone: "South Hall",         widthM:  3, depthM:  3, x:  773.88, y: 520.80, w:  15.96, h:  15.96, legacyNumber: undefined },
];

export const TOTAL_STALLS_2026 = STALL_MAP_2026.length;

export const STALL_COUNT_BY_SIZE: Record<string, number> = {
  "6M x 3M": 47,
  "3M x 3M": 29,
  "18M x 3M": 26,
  "12M x 3M": 19,
  "9M x 3M": 16,
  "30M x 3M": 7,
  "24M x 3M": 6,
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
    ? s.halves.map((h) => ({
        id: h.id,
        stallNumber: s.stallNumber,
        areaSqft: 100,
      }))
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
