-- Surat Textile Expo 2026 - release stall 114, keep only stall 112 for Sweety Fashion
-- Migration: 20260903000021_sweety_fashion_stall_114_release.sql
--
-- Sweety Fashion holds stall 112 (Suits, 800 sq ft, 9376711888).
-- Duplicate/extra allotment for stall 114 (8141335505) is removed (organisers, 3 Sep 2026).
-- Stall 114 is freed on the floor plan and available for allotment.

BEGIN;

-- 1. Preserve any existing draw record in conflicts table for auditing
INSERT INTO lottery_allocation_conflicts (
  mobile, brand_name, stall_sqft, stall_number, is_corner, shape,
  hall, zone, dimensions, slip_id, allocated_at, reason
)
SELECT
  a.mobile, a.brand_name, a.stall_sqft, a.stall_number, a.is_corner, a.shape,
  a.hall, a.zone, a.dimensions, a.slip_id, a.allocated_at,
  'Stall 114 released: Sweety Fashion holds stall 112 only (organisers, 3 Sep 2026).'
  FROM lottery_allocations a
 WHERE (a.mobile = '8141335505' OR upper(btrim(a.stall_number)) = '114')
   AND NOT EXISTS (
     SELECT 1 FROM lottery_allocation_conflicts c
      WHERE c.slip_id = a.slip_id
   );

-- 2. Remove from active lottery allocations
DELETE FROM lottery_allocations
 WHERE mobile = '8141335505'
    OR upper(btrim(stall_number)) = '114';

-- 3. Remove 8141335505 from allowed_exhibitors if present so they log in via 9376711888 or alias
DELETE FROM allowed_exhibitors
 WHERE mobile = '8141335505';

COMMIT;
