/**
 * STE 2026 master stall inventory — derived directly from STE_Sitemap.jpeg.
 *
 * The map is a grid of 604 identical squares. One square is a 10ft x 10ft
 * (100 sq ft) module, and the separation lines on the map are the stall
 * divisions.
 *
 * SHAPE RULE
 * Every stall occupies ONE line only — a single column of a block, never two.
 * So 100 sq ft is the only square (10ft x 10ft); every larger stall is a
 * rectangle running back along its line:
 *
 *     200 = 10 x 20    300 = 10 x 30    400 = 10 x 40
 *     600 = 10 x 60    800 = 10 x 80   1000 = 10 x 100
 *
 * (The single exception is block B5, kept whole as the one 2000 sq ft anchor —
 * 20 modules will not fit in a 14-module line.)
 *
 * ARRANGEMENT RULE
 * Each line reads large -> small -> large from end to end. The biggest stalls
 * take the line ends, where they front both the aisle and the cross aisle (an
 * L-shape corner); each successive size steps down toward the middle:
 *
 *     corner 600+ | 400 | 300 | 200 | 100 | 100 | 200 | 300 | 400 | corner 600+
 *
 * Both rules are enforced at load by assertStallRules(); a recipe that breaks
 * either one throws rather than mis-allotting quietly.
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
  dimensions: string; // e.g. "10ft × 30ft"
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

/**
 * Cut patterns — a bill of stall sizes that must exactly fill one line.
 * Placement is never written here; the arrangement rule decides it.
 * Suffix is the line length in modules.
 */
const PATTERNS: Record<string, number[]> = {
  // ---- 14-module lines (north hall + the two long gallery runs) ----
  MEGA_14:   [1200, 200],
  ANCHOR_14: [800, 600],
  GRAND_14:  [1000, 400],
  TWIN_14:   [600, 200, 600],
  CORNER_14: [600, 400, 400],
  QUAD_14:   [400, 200, 100, 100, 200, 400],
  STEP_14:   [300, 300, 200, 200, 100, 100, 100, 100],
  INLINE_14: [200, 200, 200, 200, 100, 100, 100, 100, 100, 100],
  // ---- 13-module lines ----
  TWIN_13:   [600, 100, 600],
  STEP_13:   [400, 300, 200, 200, 200],
  // ---- 10-module lines (south hall) ----
  GRAND_10:  [1000],
  CORNER_10: [600, 400],
  QUAD_10:   [400, 200, 400],
  STEP_10:   [300, 200, 200, 300],
  INLINE_10: [200, 200, 200, 100, 100, 100, 100],
  // ---- 9-module lines (south hall) ----
  CORNER_9:  [600, 300],
  QUAD_9:    [400, 200, 300],
  STEP_9:    [300, 300, 300],
  INLINE_9:  [200, 200, 200, 200, 100],
};

export interface BlockDef {
  id: string;
  cols: number[];      // occupied column slots on the sitemap grid
  rowStart: number;
  rowEnd: number;      // inclusive
  wing: Wing;
  label: string;
  /** One cut pattern per line, west to east. Gallery blocks hold a single
   *  horizontal line, so they name one pattern. */
  columns: string[];
  /** Set when the whole block is one oversized stall (the 2000 sq ft anchor). */
  whole?: number;
}

/**
 * Block layout, read straight off STE_Sitemap.jpeg.
 * North hall: 15 blocks between the north gallery and the central cross aisle.
 * South hall: 5 blocks west of the entry lobby, 5 east of it.
 */
export const SITEMAP_BLOCKS: BlockDef[] = [
  // North hall — 14-module lines (block A15 is one module shorter on the map)
  { id: 'A1',  cols: [0],      rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'West Wall Row',      columns: ['STEP_14'] },
  { id: 'A2',  cols: [2, 3],   rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'Aisle 1 West',       columns: ['GRAND_14', 'GRAND_14'] },
  { id: 'A3',  cols: [5, 6],   rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'Aisle 1 East',       columns: ['GRAND_14', 'GRAND_14'] },
  { id: 'A4',  cols: [8, 9],   rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'Aisle 2 West',       columns: ['GRAND_14', 'GRAND_14'] },
  { id: 'A5',  cols: [11, 12], rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'Aisle 2 East',       columns: ['ANCHOR_14', 'ANCHOR_14'] },
  { id: 'A6',  cols: [14, 15], rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'Aisle 3 West',       columns: ['ANCHOR_14', 'MEGA_14'] },
  { id: 'A7',  cols: [17, 18], rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'Aisle 3 East',       columns: ['MEGA_14', 'TWIN_14'] },
  { id: 'A8',  cols: [20, 21], rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'Central Aisle West', columns: ['TWIN_14', 'TWIN_14'] },
  { id: 'A9',  cols: [24, 25], rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'Central Aisle East', columns: ['TWIN_14', 'TWIN_14'] },
  { id: 'A10', cols: [27, 28], rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'Aisle 4 West',       columns: ['TWIN_14', 'TWIN_14'] },
  { id: 'A11', cols: [30, 31], rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'Aisle 4 East',       columns: ['TWIN_14', 'CORNER_14'] },
  { id: 'A12', cols: [33, 34], rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'Aisle 5 West',       columns: ['CORNER_14', 'QUAD_14'] },
  { id: 'A13', cols: [36, 37], rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'Aisle 5 East',       columns: ['QUAD_14', 'QUAD_14'] },
  { id: 'A14', cols: [39, 40], rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'Aisle 6 West',       columns: ['QUAD_14', 'STEP_14'] },
  { id: 'A15', cols: [42],     rowStart: 2, rowEnd: 14, wing: 'north-hall', label: 'East Wall Row',      columns: ['TWIN_13'] },

  // South hall — 10- and 9-module lines, alternating as drawn
  { id: 'B1',  cols: [0],      rowStart: 18, rowEnd: 27, wing: 'south-hall', label: 'West Wall Row',    columns: ['INLINE_10'] },
  { id: 'B2',  cols: [2, 3],   rowStart: 18, rowEnd: 26, wing: 'south-hall', label: 'Exit Aisle West',  columns: ['CORNER_9', 'CORNER_9'] },
  { id: 'B3',  cols: [5, 6],   rowStart: 18, rowEnd: 27, wing: 'south-hall', label: 'Exit Aisle East',  columns: ['GRAND_10', 'GRAND_10'] },
  { id: 'B4',  cols: [8, 9],   rowStart: 18, rowEnd: 26, wing: 'south-hall', label: 'South Aisle 1',    columns: ['QUAD_9', 'QUAD_9'] },
  { id: 'B5',  cols: [11, 12], rowStart: 18, rowEnd: 27, wing: 'south-hall', label: 'South Aisle 2',    columns: [], whole: 2000 },
  { id: 'B6',  cols: [30, 31], rowStart: 18, rowEnd: 26, wing: 'south-hall', label: 'South Aisle 3',    columns: ['QUAD_9', 'STEP_9'] },
  { id: 'B7',  cols: [33, 34], rowStart: 18, rowEnd: 27, wing: 'south-hall', label: 'South Aisle 4',    columns: ['GRAND_10', 'CORNER_10'] },
  { id: 'B8',  cols: [36, 37], rowStart: 18, rowEnd: 26, wing: 'south-hall', label: 'Entry Aisle West', columns: ['INLINE_9', 'INLINE_9'] },
  { id: 'B9',  cols: [39, 40], rowStart: 18, rowEnd: 27, wing: 'south-hall', label: 'Entry Aisle East', columns: ['CORNER_10', 'QUAD_10'] },
  { id: 'B10', cols: [42],     rowStart: 18, rowEnd: 27, wing: 'south-hall', label: 'East Wall Row',    columns: ['STEP_10'] },

  // North wall gallery — one module deep, split by the two washrooms
  { id: 'NG1', cols: [0, 13],  rowStart: 0, rowEnd: 0, wing: 'north-gallery', label: 'North Gallery West',   columns: ['STEP_14'] },
  { id: 'NG2', cols: [15, 27], rowStart: 0, rowEnd: 0, wing: 'north-gallery', label: 'North Gallery Centre', columns: ['STEP_13'] },
  { id: 'NG3', cols: [29, 42], rowStart: 0, rowEnd: 0, wing: 'north-gallery', label: 'North Gallery East',   columns: ['INLINE_14'] },
];

const HALL_NAMES: Record<Wing, string> = {
  'north-gallery': 'North Wall Gallery',
  'north-hall': 'Main Hall — North Wing',
  'south-hall': 'Main Hall — South Wing',
};

/**
 * The arrangement rule: deal the largest stall to one end, the next largest to
 * the other end, and work inward, so the line reads large -> small -> large.
 */
function arrangeLine(sizes: number[]): number[] {
  const descending = [...sizes].sort((a, b) => b - a);
  const head: number[] = [];
  const tail: number[] = [];
  descending.forEach((size, i) => (i % 2 === 0 ? head : tail).push(size));
  return [...head, ...tail.reverse()];
}

interface Placed {
  size: number;
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
  wholeBlock: boolean;
}

function buildBlock(block: BlockDef): Placed[] {
  const rows = block.rowEnd - block.rowStart + 1;

  // The one oversized anchor: a whole block kept as a single stall.
  if (block.whole) {
    const colSpan = block.cols.length;
    if (block.whole !== colSpan * rows * MODULE_SQFT) {
      throw new Error(`Block ${block.id} holds ${colSpan * rows} modules, not ${block.whole / MODULE_SQFT}`);
    }
    return [{ size: block.whole, col: block.cols[0], row: block.rowStart, colSpan, rowSpan: rows, wholeBlock: true }];
  }

  const placed: Placed[] = [];

  // Gallery: one horizontal line running west to east along the wall.
  if (block.wing === 'north-gallery') {
    const width = block.cols[1] - block.cols[0] + 1;
    const sizes = PATTERNS[block.columns[0]];
    if (!sizes) throw new Error(`Unknown pattern "${block.columns[0]}" on block ${block.id}`);
    const used = sizes.reduce((sum, size) => sum + size / MODULE_SQFT, 0);
    if (used !== width) throw new Error(`Pattern ${block.columns[0]} fills ${used} of ${width} modules on ${block.id}`);

    let col = block.cols[0];
    arrangeLine(sizes).forEach((size) => {
      const colSpan = size / MODULE_SQFT;
      placed.push({ size, col, row: block.rowStart, colSpan, rowSpan: 1, wholeBlock: false });
      col += colSpan;
    });
    return placed;
  }

  // Hall block: each column is an independent line, cut on its own pattern.
  if (block.columns.length !== block.cols.length) {
    throw new Error(`Block ${block.id} has ${block.cols.length} lines but ${block.columns.length} patterns`);
  }

  block.cols.forEach((col, i) => {
    const name = block.columns[i];
    const sizes = PATTERNS[name];
    if (!sizes) throw new Error(`Unknown pattern "${name}" on block ${block.id}`);
    const used = sizes.reduce((sum, size) => sum + size / MODULE_SQFT, 0);
    if (used !== rows) throw new Error(`Pattern ${name} fills ${used} of ${rows} modules on ${block.id}`);

    let row = block.rowStart;
    arrangeLine(sizes).forEach((size) => {
      const rowSpan = size / MODULE_SQFT;
      placed.push({ size, col, row, colSpan: 1, rowSpan, wholeBlock: false });
      row += rowSpan;
    });
  });

  return placed;
}

/** Frontage is read back off the finished geometry, never asserted by hand. */
function describe(p: Placed, block: BlockDef) {
  const atEnd =
    block.wing === 'north-gallery'
      ? p.col === block.cols[0] || p.col + p.colSpan - 1 === block.cols[1]
      : p.row === block.rowStart || p.row + p.rowSpan - 1 === block.rowEnd;

  // A single-line stall fronts its own aisle; an end position adds the cross
  // aisle. The whole-block anchor fronts both flanking aisles plus both ends.
  const openSides = (p.wholeBlock ? 4 : atEnd ? 2 : 1) as 1 | 2 | 3 | 4;
  const kind = atEnd ? `${openSides}-Side Open L-Shape Corner` : 'In-Line';

  return { openSides, isCorner: atEnd, shape: (atEnd ? 'L-Shape' : 'Linear') as StallShape, kind };
}

/**
 * Guards both rules at module load, so a future pattern edit that breaks the
 * shape or the gradient fails immediately instead of mis-allotting silently.
 */
function assertStallRules(stalls: StallItem[]): void {
  // Shape: one line only. 100 sq ft is the sole square.
  stalls.forEach((s) => {
    const block = SITEMAP_BLOCKS.find((b) => b.id === s.block)!;
    if (block.whole) return;
    const across = block.wing === 'north-gallery' ? s.rowSpan : s.colSpan;
    if (across !== 1) {
      throw new Error(`Stall ${s.stallNumber} spans ${across} lines — every stall must occupy one line`);
    }
  });

  // Gradient: each line steps down to the middle and back up to the far corner.
  SITEMAP_BLOCKS.forEach((block) => {
    if (block.whole) return;
    const inBlock = stalls.filter((s) => s.block === block.id);
    const lines =
      block.wing === 'north-gallery'
        ? [[...inBlock].sort((a, b) => a.col - b.col)]
        : block.cols.map((c) => inBlock.filter((s) => s.col === c).sort((a, b) => a.row - b.row));

    lines.forEach((line) => {
      const sizes = line.map((s) => s.sqftNumber);
      let i = 1;
      while (i < sizes.length && sizes[i] <= sizes[i - 1]) i++; // stepping down toward the middle
      while (i < sizes.length && sizes[i] >= sizes[i - 1]) i++; // stepping back up to the far corner
      if (i !== sizes.length) {
        throw new Error(`Block ${block.id} breaks the arrangement rule: ${sizes.join(' → ')}`);
      }
    });
  });

  const stranded = stalls.filter((s) => s.sqftNumber >= 600 && !s.isCorner);
  if (stranded.length) {
    throw new Error(
      `${stranded.length} stall(s) of 600 sq ft or more are not on a corner: ${stranded.map((s) => s.stallNumber).join(', ')}`
    );
  }
}

function generateStallInventory(): StallItem[] {
  const stalls: StallItem[] = [];

  SITEMAP_BLOCKS.forEach((block) => {
    // Numbered line by line, north to south, so consecutive numbers are neighbours.
    const placed = buildBlock(block).sort((a, b) => (a.col - b.col) || (a.row - b.row));

    placed.forEach((p, i) => {
      const { openSides, isCorner, shape, kind } = describe(p, block);

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

  assertStallRules(stalls);
  return stalls;
}

export const MASTER_STALL_INVENTORY: StallItem[] = generateStallInventory();

/** Total 100 sq ft modules on the floor plan. */
export const TOTAL_MODULES = MASTER_STALL_INVENTORY.reduce((sum, s) => sum + s.colSpan * s.rowSpan, 0);

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
