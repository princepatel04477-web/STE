/**
 * STE 2026 master stall inventory — derived directly from STE_Sitemap.jpeg.
 *
 * The site map is a uniform grid of 604 identical square modules. Each module is
 * one 10ft x 10ft (100 sq ft) shell. Every sellable stall is a contiguous run of
 * those modules, so a 600 sq ft stall is a 2-module-wide x 3-module-deep block.
 *
 * Grid coordinates below were measured off the map artwork itself (module pitch
 * ~29px, 43 column slots x 28 row slots) so on-screen positions and stall numbers
 * always agree with the printed map.
 */

export type StallCategory = '100' | '200' | '300' | '400' | '600' | '800' | '1000' | '1200' | '2000';
export type StallShape = 'L-Shape' | 'Linear';

export const MODULE_SQFT = 100;
export const MODULE_FT = 10;
export const GRID_COLS = 43;
export const GRID_ROWS = 28;

export interface StallItem {
  stallNumber: string;
  categorySqft: StallCategory;
  sqftNumber: number;
  dimensions: string; // e.g. "20ft × 30ft"
  isCorner: boolean;
  shape: StallShape;
  openSides: 1 | 2 | 3 | 4;
  hall: string;
  zone: string;
  description: string;
  block: string;
  /** Sitemap grid footprint, in 10ft modules. */
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
}

type Wing = 'north-gallery' | 'north-hall' | 'south-hall';

interface DoubleRecipe {
  kind: 'double';
  head: number[];      // full-width stalls at the block head (north end)
  midFull: number[];   // full-width stalls immediately below the head
  midLeft: number[];   // single-column stalls, left column
  midRight: number[];  // single-column stalls, right column
  tail: number[];      // full-width stalls at the block tail (south end)
}

interface SingleRecipe {
  kind: 'single';
  column: number[];    // single-module-wide stalls, north to south
}

interface RunRecipe {
  kind: 'run';
  run: number[];       // single-module-deep stalls, west to east along a wall
}

type Recipe = DoubleRecipe | SingleRecipe | RunRecipe;

const dbl = (
  head: number[],
  tail: number[],
  midFull: number[],
  midLeft: number[],
  midRight: number[]
): DoubleRecipe => ({ kind: 'double', head, tail, midFull, midLeft, midRight });

/**
 * Cutting patterns. Every pattern fills its block exactly — buildBlock() throws
 * if a pattern and a block ever drift apart. Large stalls (>= 600 sq ft) always
 * sit at a block head or tail so they get frontage on both the longitudinal
 * aisle and the cross aisle, i.e. a genuine 2-side-open L-shape corner.
 */
const RECIPES: Record<string, Recipe> = {
  // ---- 2 columns x 14 rows (north hall) ----
  GRAND:   dbl([1000], [1000], [400, 400], [], []),
  ANCHOR:  dbl([1000], [600], [400], [200, 200], [300, 100]),
  PREMIUM: dbl([800], [600], [400], [300, 200], [200, 200, 100]),
  CORNER:  dbl([600], [600], [400, 400], [200, 100, 100], [300, 100]),
  MEGA:    dbl([1200], [600], [400], [300], [200, 100]),
  TWIN:    dbl([1000], [800], [], [300, 200], [200, 100, 100, 100]),
  // ---- 2 columns x 10 rows (south hall) ----
  S_QUAD:  dbl([600], [600], [400, 400], [], []),
  S_ARENA: dbl([2000], [], [], [], []),
  S_SPLIT: dbl([600], [600], [], [200, 200], [100, 100, 100, 100]),
  // ---- 2 columns x 9 rows (south hall) ----
  S_PAIR:  dbl([600], [600], [], [300], [200, 100]),
  S_MEGA:  dbl([1200], [600], [], [], []),
  S_MIX:   dbl([600], [600], [], [100, 200], [300]),
  // ---- single-column perimeter blocks ----
  W_LONG:  { kind: 'single', column: [300, 200, 200, 200, 300, 200] },
  E_LONG:  { kind: 'single', column: [300, 200, 200, 200, 200, 100, 100] },
  W_SHORT: { kind: 'single', column: [200, 200, 300, 200, 100] },
  E_SHORT: { kind: 'single', column: [100, 200, 200, 100, 200, 200] },
  // ---- north wall gallery runs ----
  GAL_14:  { kind: 'run', run: [100, 200, 200, 300, 200, 200, 100, 100] },
  GAL_13:  { kind: 'run', run: [100, 200, 200, 300, 200, 200, 100] },
};

export interface BlockDef {
  id: string;
  cols: number[];      // occupied column slots on the sitemap grid
  rowStart: number;
  rowEnd: number;      // inclusive
  wing: Wing;
  label: string;
  recipe: string;
}

/**
 * Block layout, read straight off STE_Sitemap.jpeg.
 * North hall: 15 blocks between the north gallery and the central cross aisle.
 * South hall: 5 blocks west of the entry lobby, 5 east of it.
 */
export const SITEMAP_BLOCKS: BlockDef[] = [
  // North hall — rows 2..15 (block A15 is one row shorter on the map)
  { id: 'A1',  cols: [0],      rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'West Wall Row',       recipe: 'W_LONG' },
  { id: 'A2',  cols: [2, 3],   rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'Aisle 1 West',        recipe: 'GRAND' },
  { id: 'A3',  cols: [5, 6],   rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'Aisle 1 East',        recipe: 'GRAND' },
  { id: 'A4',  cols: [8, 9],   rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'Aisle 2 West',        recipe: 'GRAND' },
  { id: 'A5',  cols: [11, 12], rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'Aisle 2 East',        recipe: 'ANCHOR' },
  { id: 'A6',  cols: [14, 15], rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'Aisle 3 West',        recipe: 'ANCHOR' },
  { id: 'A7',  cols: [17, 18], rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'Aisle 3 East',        recipe: 'PREMIUM' },
  { id: 'A8',  cols: [20, 21], rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'Central Aisle West',  recipe: 'PREMIUM' },
  { id: 'A9',  cols: [24, 25], rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'Central Aisle East',  recipe: 'TWIN' },
  { id: 'A10', cols: [27, 28], rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'Aisle 4 West',        recipe: 'CORNER' },
  { id: 'A11', cols: [30, 31], rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'Aisle 4 East',        recipe: 'CORNER' },
  { id: 'A12', cols: [33, 34], rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'Aisle 5 West',        recipe: 'CORNER' },
  { id: 'A13', cols: [36, 37], rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'Aisle 5 East',        recipe: 'CORNER' },
  { id: 'A14', cols: [39, 40], rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'Aisle 6 West',        recipe: 'MEGA' },
  { id: 'A15', cols: [42],     rowStart: 2, rowEnd: 14, wing: 'north-hall', label: 'East Wall Row',       recipe: 'E_LONG' },

  // South hall — rows 18..27 (alternating blocks are one row shorter on the map)
  { id: 'B1',  cols: [0],      rowStart: 18, rowEnd: 27, wing: 'south-hall', label: 'West Wall Row',      recipe: 'W_SHORT' },
  { id: 'B2',  cols: [2, 3],   rowStart: 18, rowEnd: 26, wing: 'south-hall', label: 'Exit Aisle West',    recipe: 'S_MEGA' },
  { id: 'B3',  cols: [5, 6],   rowStart: 18, rowEnd: 27, wing: 'south-hall', label: 'Exit Aisle East',    recipe: 'S_QUAD' },
  { id: 'B4',  cols: [8, 9],   rowStart: 18, rowEnd: 26, wing: 'south-hall', label: 'South Aisle 1',      recipe: 'S_PAIR' },
  { id: 'B5',  cols: [11, 12], rowStart: 18, rowEnd: 27, wing: 'south-hall', label: 'South Aisle 2',      recipe: 'S_ARENA' },
  { id: 'B6',  cols: [30, 31], rowStart: 18, rowEnd: 26, wing: 'south-hall', label: 'South Aisle 3',      recipe: 'S_MIX' },
  { id: 'B7',  cols: [33, 34], rowStart: 18, rowEnd: 27, wing: 'south-hall', label: 'South Aisle 4',      recipe: 'S_SPLIT' },
  { id: 'B8',  cols: [36, 37], rowStart: 18, rowEnd: 26, wing: 'south-hall', label: 'Entry Aisle West',   recipe: 'S_PAIR' },
  { id: 'B9',  cols: [39, 40], rowStart: 18, rowEnd: 27, wing: 'south-hall', label: 'Entry Aisle East',   recipe: 'S_QUAD' },
  { id: 'B10', cols: [42],     rowStart: 18, rowEnd: 27, wing: 'south-hall', label: 'East Wall Row',      recipe: 'E_SHORT' },

  // North wall gallery — one module deep, split by the two washrooms
  { id: 'NG1', cols: [0, 13],  rowStart: 0, rowEnd: 0, wing: 'north-gallery', label: 'North Gallery West',   recipe: 'GAL_14' },
  { id: 'NG2', cols: [15, 27], rowStart: 0, rowEnd: 0, wing: 'north-gallery', label: 'North Gallery Centre', recipe: 'GAL_13' },
  { id: 'NG3', cols: [29, 42], rowStart: 0, rowEnd: 0, wing: 'north-gallery', label: 'North Gallery East',   recipe: 'GAL_14' },
];

const HALL_NAMES: Record<Wing, string> = {
  'north-gallery': 'North Wall Gallery',
  'north-hall': 'Main Hall — North Wing',
  'south-hall': 'Main Hall — South Wing',
};

interface Placed {
  size: number;
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
  atHead: boolean;
  atTail: boolean;
  fullWidth: boolean;
}

function buildBlock(block: BlockDef): Placed[] {
  const recipe = RECIPES[block.recipe];
  if (!recipe) throw new Error(`Unknown recipe "${block.recipe}" on block ${block.id}`);
  const placed: Placed[] = [];
  const rows = block.rowEnd - block.rowStart + 1;

  if (recipe.kind === 'run') {
    // Gallery run: stalls march west to east along a single row.
    const width = block.cols[1] - block.cols[0] + 1;
    const used = recipe.run.reduce((sum, size) => sum + size / MODULE_SQFT, 0);
    if (used !== width) throw new Error(`Recipe ${block.recipe} covers ${used} of ${width} modules on ${block.id}`);
    let col = block.cols[0];
    recipe.run.forEach((size, i) => {
      const colSpan = size / MODULE_SQFT;
      placed.push({
        size, col, row: block.rowStart, colSpan, rowSpan: 1,
        atHead: i === 0, atTail: i === recipe.run.length - 1, fullWidth: false,
      });
      col += colSpan;
    });
    return placed;
  }

  if (recipe.kind === 'single') {
    const used = recipe.column.reduce((sum, size) => sum + size / MODULE_SQFT, 0);
    if (used !== rows) throw new Error(`Recipe ${block.recipe} covers ${used} of ${rows} rows on ${block.id}`);
    let row = block.rowStart;
    recipe.column.forEach((size, i) => {
      const rowSpan = size / MODULE_SQFT;
      placed.push({
        size, col: block.cols[0], row, colSpan: 1, rowSpan,
        atHead: i === 0, atTail: i === recipe.column.length - 1, fullWidth: false,
      });
      row += rowSpan;
    });
    return placed;
  }

  // Double-loaded block: full-width stalls at head/tail, single-column stalls between.
  const fullRows = (sizes: number[]) => sizes.reduce((sum, size) => sum + size / (MODULE_SQFT * 2), 0);
  const [leftCol, rightCol] = block.cols;
  const tailStart = block.rowEnd - fullRows(recipe.tail) + 1;
  let cursor = block.rowStart;

  const pushFull = (size: number, atHead: boolean, atTail: boolean, row: number) => {
    placed.push({
      size, col: leftCol, row, colSpan: rightCol - leftCol + 1,
      rowSpan: size / (MODULE_SQFT * 2), atHead, atTail, fullWidth: true,
    });
  };

  recipe.head.forEach((size) => {
    pushFull(size, cursor === block.rowStart, false, cursor);
    cursor += size / (MODULE_SQFT * 2);
  });
  recipe.midFull.forEach((size) => {
    pushFull(size, false, false, cursor);
    cursor += size / (MODULE_SQFT * 2);
  });

  const midStart = cursor;
  const midColumns: Array<[number[], number]> = [[recipe.midLeft, leftCol], [recipe.midRight, rightCol]];
  midColumns.forEach(([sizes, col]) => {
    let row = midStart;
    sizes.forEach((size) => {
      placed.push({
        size, col, row, colSpan: 1, rowSpan: size / MODULE_SQFT,
        atHead: false, atTail: false, fullWidth: false,
      });
      row += size / MODULE_SQFT;
    });
    if (sizes.length && row !== tailStart) {
      throw new Error(`Recipe ${block.recipe} column ends at row ${row}, expected ${tailStart} on ${block.id}`);
    }
  });
  if (!recipe.midLeft.length && !recipe.midRight.length && midStart !== tailStart) {
    throw new Error(`Recipe ${block.recipe} leaves rows ${midStart}..${tailStart - 1} empty on ${block.id}`);
  }

  let tailCursor = tailStart;
  recipe.tail.forEach((size, i) => {
    pushFull(size, false, i === recipe.tail.length - 1, tailCursor);
    tailCursor += size / (MODULE_SQFT * 2);
  });

  // A head stall deep enough to also reach the tail (the 2000 sq ft arena) is open at both ends.
  placed.forEach((p) => {
    if (p.fullWidth && p.row + p.rowSpan - 1 === block.rowEnd) p.atTail = true;
  });

  const covered = placed.reduce((sum, p) => sum + p.colSpan * p.rowSpan, 0);
  const capacity = block.cols.length * rows;
  if (covered !== capacity) throw new Error(`Block ${block.id} covers ${covered} of ${capacity} modules`);
  return placed;
}

function describe(p: Placed): { openSides: 1 | 2 | 3 | 4; isCorner: boolean; shape: StallShape; kind: string } {
  const endFrontage = p.atHead || p.atTail;
  const openSides = (p.fullWidth ? (endFrontage ? 3 : 2) : (endFrontage ? 2 : 1)) as 1 | 2 | 3 | 4;
  const kind = endFrontage
    ? `${openSides}-Side Open L-Shape Corner`
    : p.fullWidth
      ? 'Twin-Aisle Island'
      : 'In-Line';

  return { openSides, isCorner: endFrontage, shape: endFrontage ? 'L-Shape' : 'Linear', kind };
}

function generateStallInventory(): StallItem[] {
  const stalls: StallItem[] = [];

  SITEMAP_BLOCKS.forEach((block) => {
    const placed = buildBlock(block).sort((a, b) => (a.row - b.row) || (a.col - b.col));

    placed.forEach((p, i) => {
      const { openSides, isCorner, shape, kind } = describe(p);

      stalls.push({
        stallNumber: `${block.id}-${String(i + 1).padStart(2, '0')}`,
        categorySqft: String(p.size) as StallCategory,
        sqftNumber: p.size,
        dimensions: `${p.colSpan * MODULE_FT}ft × ${p.rowSpan * MODULE_FT}ft`,
        isCorner,
        shape,
        openSides,
        hall: HALL_NAMES[block.wing],
        zone: `Block ${block.id} · ${block.label}`,
        description: `${p.size} sq ft ${kind} Stall`,
        block: block.id,
        col: p.col,
        row: p.row,
        colSpan: p.colSpan,
        rowSpan: p.rowSpan,
      });
    });
  });

  return stalls;
}

export const MASTER_STALL_INVENTORY: StallItem[] = generateStallInventory();

/** Non-stall features drawn on the map, in grid coordinates. */
export const SITEMAP_LANDMARKS = {
  washrooms: [{ col: 14, row: -1 }, { col: 28, row: -1 }],
  emergencyGates: [
    { col: 1, row: -1, orient: 'h' as const, label: 'Emergency Gate' },
    { col: 41, row: -1, orient: 'h' as const, label: 'Emergency Gate' },
    { col: -1, row: 14, orient: 'v' as const, label: 'Emergency Gate' },
    { col: 43, row: 14, orient: 'v' as const, label: 'Emergency Gate' },
    { col: 28, row: 18, orient: 'v' as const, label: 'Emergency Gate' },
  ],
  exit: { col: 15, row: 17, colSpan: 2, rowSpan: 3 },
  entry: { col: 25, row: 17, colSpan: 2, rowSpan: 3 },
};

/** Ascending category ladder — used for normalising and for upward fallback. */
export const STALL_CATEGORY_LADDER: StallCategory[] = ['100', '200', '300', '400', '600', '800', '1000', '1200', '2000'];

export function getStallByNumber(stallNumber: string): StallItem | undefined {
  return MASTER_STALL_INVENTORY.find((s) => s.stallNumber.toUpperCase() === stallNumber.toUpperCase());
}

export function getStallsByCategory(categorySqft: string): StallItem[] {
  const normCat = normalizeSqftCategory(categorySqft);
  return MASTER_STALL_INVENTORY.filter((s) => s.categorySqft === normCat);
}

export function normalizeSqftCategory(sqftInput: string | number): StallCategory {
  const num = parseInt(String(sqftInput).replace(/\D/g, ''), 10);
  if (!Number.isFinite(num) || num <= 0) return '100';
  // Snap down to the largest category the exhibitor has actually paid for.
  let match: StallCategory = '100';
  STALL_CATEGORY_LADDER.forEach((cat) => {
    if (num >= parseInt(cat, 10)) match = cat;
  });
  return match;
}
