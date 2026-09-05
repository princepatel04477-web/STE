import { NextResponse } from 'next/server';
import db, { LotteryAllocationRecord } from '@/lib/db';
import { STALL_CATEGORY_LADDER, normalizeSqftCategory } from '@/data/stallInventory';
import { ALLOTMENTS_2026 } from '@/data/stallAllotment2026';
import { OCCUPANCY_2026 } from '@/lib/stallOccupancy';
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
    
    // Category Breakdown Stats - built from the real approved layout
    // (stallAllotment2026), not the synthetic placeholder inventory the old
    // demo lottery used: that inventory's own stall count (166) had drifted
    // well behind the real, current floor (180 units, 175 seated), which is
    // what made "Available Stalls" go negative on the admin console - it was
    // subtracting a live count from a stale one.
    //
    // "Corner" has no equivalent in the real layout's own data (it was a
    // property the synthetic inventory computed from a fabricated block
    // shape), so it is reported here as the real large-format stalls -
    // areaSqft >= 600 - the same threshold stall-allocation's own
    // isCornerEligible rule uses to decide who gets offered an L-shape.
    const CORNER_THRESHOLD_SQFT = 600;
    const categoryStats = STALL_CATEGORY_LADDER.map((cat) => {
      const inCategory = ALLOTMENTS_2026.filter((a) => normalizeSqftCategory(a.areaSqft) === cat);
      const cornerInCategory = inCategory.filter((a) => a.areaSqft >= CORNER_THRESHOLD_SQFT);

      // Match on the stall actually allotted, so an upgraded exhibitor is counted
      // against the category they were physically given.
      const allocatedInCat = allocations.filter(
        (a) => normalizeSqftCategory(a.stall_sqft) === cat
      );

      return {
        category: `${cat} sq ft`,
        totalStalls: inCategory.length,
        cornerStalls: cornerInCategory.length,
        allocatedCount: allocatedInCat.length,
        availableCount: Math.max(0, inCategory.length - allocatedInCat.length),
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
      // Same source and the same figures as the "Approved Floor Plan"
      // panel further down this page (stallOccupancy.ts) - the two used to
      // disagree because this block alone read the old synthetic inventory.
      totalCapacity: OCCUPANCY_2026.totalUnits,
      totalAllocated: OCCUPANCY_2026.allotted,
      totalRemaining: OCCUPANCY_2026.free,
      cornerStallsTotal: ALLOTMENTS_2026.filter((a) => a.areaSqft >= CORNER_THRESHOLD_SQFT).length,
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
