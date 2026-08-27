import { NextResponse } from 'next/server';
import db, { LotteryAllocationRecord } from '@/lib/db';
import { MASTER_STALL_INVENTORY, STALL_CATEGORY_LADDER, normalizeSqftCategory } from '@/data/stallInventory';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { getAuthenticatedExhibitor, isAdminMobile } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // The report carries the whole allotment list, so it is admin-only — the
    // same server-side gate the exhibitor master report runs behind.
    const session = await getAuthenticatedExhibitor();
    if (!session || !isAdminMobile(session.mobile)) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin authorization required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    let allocations = (db.prepare('SELECT * FROM lottery_allocations').all() as LotteryAllocationRecord[]) || [];

    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data: sbAllocations } = await supabaseAdmin.from('lottery_allocations').select('*');
        if (sbAllocations && Array.isArray(sbAllocations)) {
          allocations = sbAllocations;
        }
      } catch (sbErr) {
        console.warn('[Lottery Report] Supabase fetch fallback:', sbErr);
      }
    }
    
    // Category Breakdown Stats
    const categoryStats = STALL_CATEGORY_LADDER.map((cat) => {
      const totalInInventory = MASTER_STALL_INVENTORY.filter((s) => s.categorySqft === cat).length;
      const cornerInInventory = MASTER_STALL_INVENTORY.filter((s) => s.categorySqft === cat && s.isCorner).length;

      // Match on the stall actually allotted, so an upgraded exhibitor is counted
      // against the category they were physically given.
      const allocatedInCat = allocations.filter(
        (a) => normalizeSqftCategory(a.stall_sqft) === cat
      );

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
