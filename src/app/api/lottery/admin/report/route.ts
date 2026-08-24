import { NextResponse } from 'next/server';
import db, { LotteryAllocationRecord } from '@/lib/db';
import { MASTER_STALL_INVENTORY } from '@/data/stallInventory';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    const allocations = (db.prepare('SELECT * FROM lottery_allocations').all() as LotteryAllocationRecord[]) || [];
    
    // Category Breakdown Stats
    const categories = ['100', '200', '300', '400', '600', '800', '1000'];
    const categoryStats = categories.map((cat) => {
      const totalInInventory = MASTER_STALL_INVENTORY.filter((s) => s.categorySqft === cat).length;
      const cornerInInventory = MASTER_STALL_INVENTORY.filter((s) => s.categorySqft === cat && s.isCorner).length;
      
      const allocatedInCat = allocations.filter((a) => {
        const digits = a.stall_sqft.replace(/\D/g, '');
        const num = parseInt(digits, 10);
        if (cat === '1000') return num >= 1000;
        if (cat === '800') return num === 800;
        if (cat === '600') return num === 600;
        if (cat === '400') return num === 400;
        if (cat === '300') return num === 300;
        if (cat === '200') return num === 200;
        return num === 100;
      });

      return {
        category: `${cat} sq ft`,
        totalStalls: totalInInventory,
        cornerStalls: cornerInInventory,
        allocatedCount: allocatedInCat.length,
        availableCount: Math.max(0, totalInInventory - allocatedInCat.length),
        cornerAllocated: allocatedInCat.filter((a) => a.is_corner === 1).length
      };
    });

    if (format === 'csv') {
      const csvRows: string[] = [];
      csvRows.push([
        'Slip ID',
        'Mobile Number',
        'Brand / Company Name',
        'Registered Sqft',
        'Allotted Stall No',
        'Is Corner (L-Shape)',
        'Hall Zone',
        'Specific Zone',
        'Dimensions',
        'Allotted At'
      ].join(','));

      allocations.forEach((a) => {
        csvRows.push([
          `"${a.slip_id}"`,
          `"${a.mobile}"`,
          `"${a.brand_name.replace(/"/g, '""')}"`,
          `"${a.stall_sqft}"`,
          `"${a.stall_number}"`,
          `"${a.is_corner === 1 ? 'YES (L-Shape Corner)' : 'NO (Linear)'}"`,
          `"${a.hall}"`,
          `"${a.zone}"`,
          `"${a.dimensions}"`,
          `"${new Date(a.allocated_at).toLocaleString('en-IN')}"`
        ].join(','));
      });

      const csvContent = csvRows.join('\n');
      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="STE_2026_Stall_Lottery_Report_${new Date().toISOString().slice(0, 10)}.csv"`
        }
      });
    }

    return NextResponse.json({
      success: true,
      totalCapacity: MASTER_STALL_INVENTORY.length,
      totalAllocated: allocations.length,
      totalRemaining: MASTER_STALL_INVENTORY.length - allocations.length,
      categoryStats,
      allocations
    });
  } catch (error) {
    console.error('Lottery admin report error:', error);
    return NextResponse.json(
      { error: 'Failed to generate lottery report.' },
      { status: 500 }
    );
  }
}
