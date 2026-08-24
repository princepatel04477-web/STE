export type StallCategory = '100' | '200' | '300' | '400' | '600' | '800' | '1000';
export type StallShape = 'L-Shape' | 'Linear';

export interface StallItem {
  stallNumber: string;
  categorySqft: StallCategory;
  sqftNumber: number;
  dimensions: string; // e.g. "20ft x 30ft"
  isCorner: boolean;
  shape: StallShape;
  openSides: 1 | 2 | 3 | 4;
  hall: string;
  zone: string; // e.g. "Main Dome - North", "Aisle A Corner"
  description: string;
}

// Generate complete structured inventory mapped directly to STE_Sitemap.jpeg
function generateStallInventory(): StallItem[] {
  const stalls: StallItem[] = [];

  // 1. Grand Anchor & Super Premium Corner Stalls (1000 sq ft & 800 sq ft)
  // Located at prime main entry/exit arterial corners and hall focal points
  const superCornerStalls = [
    { num: 'CR-101', cat: '1000' as StallCategory, sqft: 1000, dim: '25ft × 40ft', zone: 'Main Entrance Grand Corner', hall: 'Hall A (Dome)' },
    { num: 'CR-102', cat: '1000' as StallCategory, sqft: 1000, dim: '25ft × 40ft', zone: 'Central Promenade Prime Corner', hall: 'Hall A (Dome)' },
    { num: 'CR-103', cat: '1000' as StallCategory, sqft: 1000, dim: '25ft × 40ft', zone: 'VIP Lounge Front Corner', hall: 'Hall B (Central)' },
    { num: 'CR-104', cat: '1000' as StallCategory, sqft: 1000, dim: '25ft × 40ft', zone: 'Main Exit Pavilion Corner', hall: 'Hall B (Central)' },
    { num: 'CR-105', cat: '1000' as StallCategory, sqft: 1000, dim: '25ft × 40ft', zone: 'North Boulevard Anchor Corner', hall: 'Hall A (Dome)' },
    { num: 'CR-106', cat: '1000' as StallCategory, sqft: 1000, dim: '25ft × 40ft', zone: 'South Boulevard Anchor Corner', hall: 'Hall B (Central)' },
    
    // 800 sq ft Corner Stalls
    { num: 'CR-801', cat: '800' as StallCategory, sqft: 800, dim: '20ft × 40ft', zone: 'Aisle 1 Head Corner', hall: 'Hall A (Dome)' },
    { num: 'CR-802', cat: '800' as StallCategory, sqft: 800, dim: '20ft × 40ft', zone: 'Aisle 2 Head Corner', hall: 'Hall A (Dome)' },
    { num: 'CR-803', cat: '800' as StallCategory, sqft: 800, dim: '20ft × 40ft', zone: 'Aisle 5 Head Corner', hall: 'Hall B (Central)' },
    { num: 'CR-804', cat: '800' as StallCategory, sqft: 800, dim: '20ft × 40ft', zone: 'Aisle 6 Head Corner', hall: 'Hall B (Central)' },
    { num: 'CR-805', cat: '800' as StallCategory, sqft: 800, dim: '20ft × 40ft', zone: 'Central Plaza East Corner', hall: 'Hall A (Dome)' },
    { num: 'CR-806', cat: '800' as StallCategory, sqft: 800, dim: '20ft × 40ft', zone: 'Central Plaza West Corner', hall: 'Hall B (Central)' },
  ];

  superCornerStalls.forEach((s) => {
    stalls.push({
      stallNumber: s.num,
      categorySqft: s.cat,
      sqftNumber: s.sqft,
      dimensions: s.dim,
      isCorner: true,
      shape: 'L-Shape',
      openSides: 2,
      hall: s.hall,
      zone: s.zone,
      description: `Premium ${s.sqft} sq ft 2-Side Open L-Shape Corner Stall`
    });
  });

  // 2. 600 sq ft Corner & Prime Stalls (Aisle junction corners with 2-side open L-Shape)
  const aisles = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'];
  aisles.forEach((aisle, idx) => {
    // Top & Bottom End Corners for each aisle column
    const numTop = `${aisle}-01`;
    const numBottom = `${aisle}-12`;
    stalls.push({
      stallNumber: numTop,
      categorySqft: '600',
      sqftNumber: 600,
      dimensions: '20ft × 30ft',
      isCorner: true,
      shape: 'L-Shape',
      openSides: 2,
      hall: idx < 5 ? 'Hall A (Dome)' : 'Hall B (Central)',
      zone: `Aisle ${aisle} North Corner Junction`,
      description: `600 sq ft High-Visibility L-Shape Corner Stall on Aisle ${aisle}`
    });

    stalls.push({
      stallNumber: numBottom,
      categorySqft: '600',
      sqftNumber: 600,
      dimensions: '20ft × 30ft',
      isCorner: true,
      shape: 'L-Shape',
      openSides: 2,
      hall: idx < 5 ? 'Hall A (Dome)' : 'Hall B (Central)',
      zone: `Aisle ${aisle} South Corner Junction`,
      description: `600 sq ft High-Visibility L-Shape Corner Stall on Aisle ${aisle}`
    });
  });

  // Additional 600 sq ft stalls (Mid-crossway corner stalls)
  for (let i = 1; i <= 8; i++) {
    stalls.push({
      stallNumber: `MC-${i.toString().padStart(2, '0')}`,
      categorySqft: '600',
      sqftNumber: 600,
      dimensions: '20ft × 30ft',
      isCorner: true,
      shape: 'L-Shape',
      openSides: 2,
      hall: i <= 4 ? 'Hall A (Dome)' : 'Hall B (Central)',
      zone: `Cross-Aisle Junction ${i}`,
      description: `600 sq ft Crossway L-Shape Corner Stall`
    });
  }

  // 3. 400 sq ft Stalls (Quad in-line & secondary corners)
  aisles.forEach((aisle, idx) => {
    // Stalls 02 and 11
    [2, 11].forEach((n) => {
      stalls.push({
        stallNumber: `${aisle}-${n.toString().padStart(2, '0')}`,
        categorySqft: '400',
        sqftNumber: 400,
        dimensions: '20ft × 20ft',
        isCorner: false,
        shape: 'Linear',
        openSides: 1,
        hall: idx < 5 ? 'Hall A (Dome)' : 'Hall B (Central)',
        zone: `Aisle ${aisle} Prime Section`,
        description: `400 sq ft Spacious Quad In-Line Stall on Aisle ${aisle}`
      });
    });
  });

  // 4. 300 sq ft Stalls (Triple in-line)
  aisles.forEach((aisle, idx) => {
    [3, 10].forEach((n) => {
      stalls.push({
        stallNumber: `${aisle}-${n.toString().padStart(2, '0')}`,
        categorySqft: '300',
        sqftNumber: 300,
        dimensions: '10ft × 30ft',
        isCorner: false,
        shape: 'Linear',
        openSides: 1,
        hall: idx < 5 ? 'Hall A (Dome)' : 'Hall B (Central)',
        zone: `Aisle ${aisle} Section`,
        description: `300 sq ft Triple Frontage Stall on Aisle ${aisle}`
      });
    });
  });

  // 5. 200 sq ft Stalls (Double in-line)
  aisles.forEach((aisle, idx) => {
    [4, 5, 8, 9].forEach((n) => {
      stalls.push({
        stallNumber: `${aisle}-${n.toString().padStart(2, '0')}`,
        categorySqft: '200',
        sqftNumber: 200,
        dimensions: '10ft × 20ft',
        isCorner: false,
        shape: 'Linear',
        openSides: 1,
        hall: idx < 5 ? 'Hall A (Dome)' : 'Hall B (Central)',
        zone: `Aisle ${aisle} In-Line`,
        description: `200 sq ft Double Frontage Stall on Aisle ${aisle}`
      });
    });
  });

  // 6. 100 sq ft Stalls (Standard in-line)
  aisles.forEach((aisle, idx) => {
    [6, 7].forEach((n) => {
      stalls.push({
        stallNumber: `${aisle}-${n.toString().padStart(2, '0')}`,
        categorySqft: '100',
        sqftNumber: 100,
        dimensions: '10ft × 10ft',
        isCorner: false,
        shape: 'Linear',
        openSides: 1,
        hall: idx < 5 ? 'Hall A (Dome)' : 'Hall B (Central)',
        zone: `Aisle ${aisle} Standard Zone`,
        description: `100 sq ft Standard Modular Shell Stall on Aisle ${aisle}`
      });
    });
  });

  // 7. Perimeter Wall Stalls (Top & Outer Rows from Sitemap)
  // Top Perimeter Row (T-01 to T-24)
  for (let i = 1; i <= 24; i++) {
    const num = `T-${i.toString().padStart(2, '0')}`;
    const cat: StallCategory = i % 4 === 0 ? '400' : i % 3 === 0 ? '300' : i % 2 === 0 ? '200' : '100';
    const sqft = parseInt(cat, 10);
    stalls.push({
      stallNumber: num,
      categorySqft: cat,
      sqftNumber: sqft,
      dimensions: sqft === 400 ? '20ft × 20ft' : sqft === 300 ? '10ft × 30ft' : sqft === 200 ? '10ft × 20ft' : '10ft × 10ft',
      isCorner: i === 1 || i === 24,
      shape: (i === 1 || i === 24) ? 'L-Shape' : 'Linear',
      openSides: (i === 1 || i === 24) ? 2 : 1,
      hall: i <= 12 ? 'Hall A (North Wall)' : 'Hall B (North Wall)',
      zone: `North Perimeter Wall Section`,
      description: `${cat} sq ft North Gallery Stall ${num}`
    });
  }

  // Left & Right Perimeter Walls (L-01 to L-16 and R-01 to R-16)
  for (let i = 1; i <= 16; i++) {
    // Left Wing
    const lNum = `L-${i.toString().padStart(2, '0')}`;
    const lCat: StallCategory = i % 4 === 0 ? '400' : i % 3 === 0 ? '300' : i % 2 === 0 ? '200' : '100';
    const lSqft = parseInt(lCat, 10);
    stalls.push({
      stallNumber: lNum,
      categorySqft: lCat,
      sqftNumber: lSqft,
      dimensions: lSqft === 400 ? '20ft × 20ft' : lSqft === 300 ? '10ft × 30ft' : lSqft === 200 ? '10ft × 20ft' : '10ft × 10ft',
      isCorner: i === 1 || i === 16,
      shape: (i === 1 || i === 16) ? 'L-Shape' : 'Linear',
      openSides: (i === 1 || i === 16) ? 2 : 1,
      hall: 'Hall A (West Wing)',
      zone: 'West Perimeter Promenade',
      description: `${lCat} sq ft West Gallery Stall ${lNum}`
    });

    // Right Wing
    const rNum = `R-${i.toString().padStart(2, '0')}`;
    const rCat: StallCategory = i % 4 === 0 ? '400' : i % 3 === 0 ? '300' : i % 2 === 0 ? '200' : '100';
    const rSqft = parseInt(rCat, 10);
    stalls.push({
      stallNumber: rNum,
      categorySqft: rCat,
      sqftNumber: rSqft,
      dimensions: rSqft === 400 ? '20ft × 20ft' : rSqft === 300 ? '10ft × 30ft' : rSqft === 200 ? '10ft × 20ft' : '10ft × 10ft',
      isCorner: i === 1 || i === 16,
      shape: (i === 1 || i === 16) ? 'L-Shape' : 'Linear',
      openSides: (i === 1 || i === 16) ? 2 : 1,
      hall: 'Hall B (East Wing)',
      zone: 'East Perimeter Promenade',
      description: `${rCat} sq ft East Gallery Stall ${rNum}`
    });
  }

  return stalls;
}

export const MASTER_STALL_INVENTORY: StallItem[] = generateStallInventory();

export function getStallByNumber(stallNumber: string): StallItem | undefined {
  return MASTER_STALL_INVENTORY.find((s) => s.stallNumber.toUpperCase() === stallNumber.toUpperCase());
}

export function getStallsByCategory(categorySqft: string): StallItem[] {
  const normCat = normalizeSqftCategory(categorySqft);
  return MASTER_STALL_INVENTORY.filter((s) => s.categorySqft === normCat);
}

export function normalizeSqftCategory(sqftInput: string | number): StallCategory {
  const digits = String(sqftInput).replace(/\D/g, '');
  const num = parseInt(digits, 10);
  if (num >= 1000) return '1000';
  if (num >= 800) return '800';
  if (num >= 600) return '600';
  if (num >= 400) return '400';
  if (num >= 300) return '300';
  if (num >= 200) return '200';
  return '100';
}
