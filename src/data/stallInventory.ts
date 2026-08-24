/**
 * STE 2026 master stall inventory — derived directly from STE_Sitemap.jpeg.
 *
 * The site map is a uniform grid of identical square modules. One module is a
 * 10ft x 10ft (100 sq ft) shell — the smallest sellable stall. Every larger
 * booking is a contiguous run of those modules, so a 600 sq ft stall is a
 * 2-module-wide x 3-module-deep block.
 *
 * Grid coordinates were measured off the map artwork itself (module pitch ~29px,
 * 43 column slots x 28 row slots) so on-screen positions and stall numbers always
 * agree with the printed map.
 *
 * ARRANGEMENT RULE (organiser's, enforced by arrangeOutward below):
 * every block reads large -> small -> large from end to end. The biggest stalls
 * take the block ends, where they get frontage on both the aisle and the cross
 * aisle (an L-shape corner); each successive size steps down toward the middle:
 *
 *     corner 600+ | 400 | 300 | 200 | 100 | 100 | 200 | 300 | 400 | corner 600+
 *
 * That guarantees every >= 600 sq ft booking lands on a corner, and that a 400
 * sits next to a corner, a 300 next to a 400, and so on.
 */

export type StallCategory = '100' | '200' | '300' | '400' | '600' | '800' | '1000' | '1200' | '2000';
export type StallShape = 'L-Shape' | 'Linear';

export const MODULE_SQFT = 100;
export const MODULE_FT = 10;
export const GRID_COLS = 43;
export const GRID_ROWS = 28;

/** Sizes at or above this span the full width of a block (2 modules / 20ft). */
const FULL_WIDTH_FROM = 400;

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

/**
 * A recipe is only a bill of sizes — never a placement. Where each stall lands
 * is decided by the arrangement rule, so the ordering cannot drift from it.
 */
interface DoubleRecipe {
  kind: 'double';
  full: number[];   // full-width stalls (>= 400 sq ft), placed at the block ends
  left: number[];   // single-column stalls, left column of the middle band
  right: number[];  // single-column stalls, right column of the middle band
}

interface SingleRecipe {
  kind: 'single';
  column: number[]; // one module wide, against a perimeter wall
}

interface RunRecipe {
  kind: 'run';
  run: number[];    // one module deep, running west to east along the north wall
}

type Recipe = DoubleRecipe | SingleRecipe | RunRecipe;

const dbl = (full: number[], left: number[], right: number[]): DoubleRecipe =>
  ({ kind: 'double', full, left, right });

const RECIPES: Record<string, Recipe> = {
  // ---- 2 columns x 14 rows (north hall) ----
  GRAND:   dbl([1000, 1000, 400, 400], [], []),
  ANCHOR:  dbl([1000, 600, 400], [200, 200], [300, 100]),
  PREMIUM: dbl([800, 600, 400], [300, 200], [200, 200, 100]),
  CORNER:  dbl([600, 600, 400, 400], [200, 100, 100], [300, 100]),
  MEGA:    dbl([1200, 600, 400], [300], [200, 100]),
  TWIN:    dbl([1000, 800], [300, 200], [200, 200, 100]),
  // ---- 2 columns x 10 rows (south hall) ----
  S_QUAD:  dbl([600, 600, 400, 400], [], []),
  S_ARENA: dbl([2000], [], []),
  S_SPLIT: dbl([600, 600], [200, 200], [200, 100, 100]),
  // ---- 2 columns x 9 rows (south hall) ----
  S_PAIR:  dbl([600, 600], [300], [200, 100]),
  S_MEGA:  dbl([1200, 600], [], []),
  S_MIX:   dbl([600, 600], [100, 200], [300]),
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
  { id: 'A1',  cols: [0],      rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'West Wall Row',      recipe: 'W_LONG' },
  { id: 'A2',  cols: [2, 3],   rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'Aisle 1 West',       recipe: 'GRAND' },
  { id: 'A3',  cols: [5, 6],   rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'Aisle 1 East',       recipe: 'GRAND' },
  { id: 'A4',  cols: [8, 9],   rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'Aisle 2 West',       recipe: 'GRAND' },
  { id: 'A5',  cols: [11, 12], rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'Aisle 2 East',       recipe: 'ANCHOR' },
  { id: 'A6',  cols: [14, 15], rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'Aisle 3 West',       recipe: 'ANCHOR' },
  { id: 'A7',  cols: [17, 18], rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'Aisle 3 East',       recipe: 'PREMIUM' },
  { id: 'A8',  cols: [20, 21], rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'Central Aisle West', recipe: 'PREMIUM' },
  { id: 'A9',  cols: [24, 25], rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'Central Aisle East', recipe: 'TWIN' },
  { id: 'A10', cols: [27, 28], rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'Aisle 4 West',       recipe: 'CORNER' },
  { id: 'A11', cols: [30, 31], rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'Aisle 4 East',       recipe: 'CORNER' },
  { id: 'A12', cols: [33, 34], rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'Aisle 5 West',       recipe: 'CORNER' },
  { id: 'A13', cols: [36, 37], rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'Aisle 5 East',       recipe: 'CORNER' },
  { id: 'A14', cols: [39, 40], rowStart: 2, rowEnd: 15, wing: 'north-hall', label: 'Aisle 6 West',       recipe: 'MEGA' },
  { id: 'A15', cols: [42],     rowStart: 2, rowEnd: 14, wing: 'north-hall', label: 'East Wall Row',      recipe: 'E_LONG' },

  // South hall — rows 18..27 (alternating blocks are one row shorter on the map)
  { id: 'B1',  cols: [0],      rowStart: 18, rowEnd: 27, wing: 'south-hall', label: 'West Wall Row',    recipe: 'W_SHORT' },
  { id: 'B2',  cols: [2, 3],   rowStart: 18, rowEnd: 26, wing: 'south-hall', label: 'Exit Aisle West',  recipe: 'S_MEGA' },
  { id: 'B3',  cols: [5, 6],   rowStart: 18, rowEnd: 27, wing: 'south-hall', label: 'Exit Aisle East',  recipe: 'S_QUAD' },
  { id: 'B4',  cols: [8, 9],   rowStart: 18, rowEnd: 26, wing: 'south-hall', label: 'South Aisle 1',    recipe: 'S_PAIR' },
  { id: 'B5',  cols: [11, 12], rowStart: 18, rowEnd: 27, wing: 'south-hall', label: 'South Aisle 2',    recipe: 'S_ARENA' },
  { id: 'B6',  cols: [30, 31], rowStart: 18, rowEnd: 26, wing: 'south-hall', label: 'South Aisle 3',    recipe: 'S_MIX' },
  { id: 'B7',  cols: [33, 34], rowStart: 18, rowEnd: 27, wing: 'south-hall', label: 'South Aisle 4',    recipe: 'S_SPLIT' },
  { id: 'B8',  cols: [36, 37], rowStart: 18, rowEnd: 26, wing: 'south-hall', label: 'Entry Aisle West', recipe: 'S_PAIR' },
  { id: 'B9',  cols: [39, 40], rowStart: 18, rowEnd: 27, wing: 'south-hall', label: 'Entry Aisle East', recipe: 'S_QUAD' },
  { id: 'B10', cols: [42],     rowStart: 18, rowEnd: 27, wing: 'south-hall', label: 'East Wall Row',    recipe: 'E_SHORT' },

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

/**
 * The arrangement rule. Deals the largest stall to one end, the next largest to
 * the other end, and works inward, so the run reads large -> small -> large.
 * `head` is in order from the leading end; `tail` is in the same direction of
 * travel, ending with the largest stall at the far end.
 */
function arrangeOutward(sizes: number[]): { head: number[]; tail: number[] } {
  const descending = [...sizes].sort((a, b) => b - a);
  const head: number[] = [];
  const tail: number[] = [];
  descending.forEach((size, i) => (i % 2 === 0 ? head : tail).push(size));
  return { head, tail: tail.reverse() };
}

/** Same rule, flattened into a single ordered run. */
function arrangeRun(sizes: number[]): number[] {
  const { head, tail } = arrangeOutward(sizes);
  return [...head, ...tail];
}

interface Placed {
  size: number;
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
  fullWidth: boolean;
}

function buildBlock(block: BlockDef): Placed[] {
  const recipe = RECIPES[block.recipe];
  if (!recipe) throw new Error(`Unknown recipe "${block.recipe}" on block ${block.id}`);
  const placed: Placed[] = [];
  const rows = block.rowEnd - block.rowStart + 1;

  if (recipe.kind === 'run') {
    const width = block.cols[1] - block.cols[0] + 1;
    const used = recipe.run.reduce((sum, size) => sum + size / MODULE_SQFT, 0);
    if (used !== width) throw new Error(`Recipe ${block.recipe} covers ${used} of ${width} modules on ${block.id}`);
    let col = block.cols[0];
    arrangeRun(recipe.run).forEach((size) => {
      const colSpan = size / MODULE_SQFT;
      placed.push({ size, col, row: block.rowStart, colSpan, rowSpan: 1, fullWidth: false });
      col += colSpan;
    });
    return placed;
  }

  if (recipe.kind === 'single') {
    const used = recipe.column.reduce((sum, size) => sum + size / MODULE_SQFT, 0);
    if (used !== rows) throw new Error(`Recipe ${block.recipe} covers ${used} of ${rows} rows on ${block.id}`);
    let row = block.rowStart;
    arrangeRun(recipe.column).forEach((size) => {
      const rowSpan = size / MODULE_SQFT;
      placed.push({ size, col: block.cols[0], row, colSpan: 1, rowSpan, fullWidth: false });
      row += rowSpan;
    });
    return placed;
  }

  // Double-loaded block: full-width stalls take both ends, single-column stalls
  // fill the band between them — every run ordered by the arrangement rule.
  const [leftCol, rightCol] = block.cols;
  const width = rightCol - leftCol + 1;
  const fullRows = (sizes: number[]) => sizes.reduce((sum, size) => sum + size / (MODULE_SQFT * width), 0);
  const colRows = (sizes: number[]) => sizes.reduce((sum, size) => sum + size / MODULE_SQFT, 0);

  if (recipe.full.some((size) => size < FULL_WIDTH_FROM)) {
    throw new Error(`Recipe ${block.recipe} puts a sub-${FULL_WIDTH_FROM} sq ft stall in the full-width run`);
  }
  const bandRows = fullRows(recipe.full);
  if (bandRows + colRows(recipe.left) !== rows || bandRows + colRows(recipe.right) !== rows) {
    throw new Error(
      `Recipe ${block.recipe} does not fill ${block.id}: ` +
      `full ${bandRows} + left ${colRows(recipe.left)} / right ${colRows(recipe.right)} != ${rows} rows`
    );
  }

  const ends = arrangeOutward(recipe.full);
  const pushFull = (size: number, row: number) => {
    placed.push({ size, col: leftCol, row, colSpan: width, rowSpan: size / (MODULE_SQFT * width), fullWidth: true });
  };

  let cursor = block.rowStart;
  ends.head.forEach((size) => { pushFull(size, cursor); cursor += size / (MODULE_SQFT * width); });

  const midStart = cursor;
  const midEnd = block.rowEnd - fullRows(ends.tail); // exclusive
  ([[recipe.left, leftCol], [recipe.right, rightCol]] as Array<[number[], number]>).forEach(([sizes, col]) => {
    let row = midStart;
    arrangeRun(sizes).forEach((size) => {
      placed.push({ size, col, row, colSpan: 1, rowSpan: size / MODULE_SQFT, fullWidth: false });
      row += size / MODULE_SQFT;
    });
  });

  let tailCursor = midEnd + 1;
  ends.tail.forEach((size) => { pushFull(size, tailCursor); tailCursor += size / (MODULE_SQFT * width); });

  const covered = placed.reduce((sum, p) => sum + p.colSpan * p.rowSpan, 0);
  if (covered !== block.cols.length * rows) {
    throw new Error(`Block ${block.id} covers ${covered} of ${block.cols.length * rows} modules`);
  }
  return placed;
}

/** Frontage is read back off the finished geometry, never asserted by hand. */
function describe(p: Placed, block: BlockDef) {
  const endFrontage =
    block.wing === 'north-gallery'
      ? p.col === block.cols[0] || p.col + p.colSpan - 1 === block.cols[1]
      : p.row === block.rowStart || p.row + p.rowSpan - 1 === block.rowEnd;

  const openSides = (p.fullWidth ? (endFrontage ? 3 : 2) : (endFrontage ? 2 : 1)) as 1 | 2 | 3 | 4;
  const kind = endFrontage
    ? `${openSides}-Side Open L-Shape Corner`
    : p.fullWidth
      ? 'Twin-Aisle Island'
      : 'In-Line';

  return { openSides, isCorner: endFrontage, shape: (endFrontage ? 'L-Shape' : 'Linear') as StallShape, kind };
}

/**
 * Guards the organiser's rule at module load, so a future recipe edit that
 * breaks the gradient fails immediately instead of silently mis-allotting.
 * Each run must step down from a corner to the middle and back up to the far
 * corner, and no stall of 600 sq ft or more may sit anywhere but a corner.
 */
function assertArrangementRule(stalls: StallItem[]): void {
  SITEMAP_BLOCKS.forEach((block) => {
    const inBlock = stalls.filter((s) => s.block === block.id);
    const runs =
      block.wing === 'north-gallery'
        ? [[...inBlock].sort((a, b) => a.col - b.col)]
        : block.cols.map((c) =>
            inBlock.filter((s) => c >= s.col && c < s.col + s.colSpan).sort((a, b) => a.row - b.row)
          );

    runs.forEach((run) => {
      const sizes = run.map((s) => s.sqftNumber);
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
    const placed = buildBlock(block).sort((a, b) => (a.row - b.row) || (a.col - b.col));

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

  assertArrangementRule(stalls);
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
