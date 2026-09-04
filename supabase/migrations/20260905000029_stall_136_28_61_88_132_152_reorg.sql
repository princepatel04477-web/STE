-- Surat Textile Expo 2026 - stall 136, 28, 61, 88, 132, 152 reorganisation
-- Migration: 20260905000029_stall_136_28_61_88_132_152_reorg.sql
--
-- Reorganises floor allocations ahead of the show:
-- 1. Stall 136 (400 sqft) is split into 136A (200 sqft, downsized for Shakambari Lace House, 9982170219)
--    and 136B (200 sqft, reseating Raghav Creation, 9830944345, vacating stall 152).
-- 2. Stall 28 (1000 sqft) is split into eight units (28A-28H); 28B (300 sqft) reseats Ruby
--    (9829085935, vacating stall 88). Mohilya (9722771233) is removed from stall 28.
-- 3. Stall 61 (600 sqft) reseats Libaas Fashion / AK TRENDZ (9374739383), upsized from their
--    earmarked 400 sqft on stall 132. Stall 132 stands vacant.
-- 4. Three bays stand vacant: 88, 132, 152.
--
-- Per established repository precedent (e.g. 20260904000025), this migration archives previous
-- allocations for the moved firms into lottery_allocation_conflicts, clears their exhibitor
-- profile stall copy, and deletes their old rows in lottery_allocations.
-- New held stalls are handed out via heldUnitFor() when /api/lottery/draw is triggered.
--
-- Idempotent: guarded by slip_id NOT EXISTS check before archiving, matched by mobile.

BEGIN;

-- 1. Archive old draws before releasing.
INSERT INTO lottery_allocation_conflicts (
  mobile, brand_name, stall_sqft, stall_number, is_corner, shape,
  hall, zone, dimensions, slip_id, allocated_at, reason
)
SELECT
  a.mobile, a.brand_name, a.stall_sqft, a.stall_number, a.is_corner, a.shape,
  a.hall, a.zone, a.dimensions, a.slip_id, a.allocated_at,
  'Released for 5 Sep 2026 floor reorganisation: ' ||
  CASE a.mobile
    WHEN '9982170219' THEN 'Shakambari Lace House downsized and reseated on split bay 136A (200 sqft).'
    WHEN '9830944345' THEN 'Raghav Creation moved from stall 152 to split bay 136B (200 sqft).'
    WHEN '9829085935' THEN 'Ruby moved from stall 88 to split bay 28B (300 sqft).'
    ELSE 'Released for stall reorganisation.'
  END
  FROM lottery_allocations a
 WHERE a.mobile IN ('9982170219', '9830944345', '9829085935')
   AND NOT EXISTS (
     SELECT 1 FROM lottery_allocation_conflicts c
      WHERE c.slip_id = a.slip_id
   );

-- 2. Clear exhibitor profile stall copies for the moved firms.
UPDATE exhibitors
   SET stall_number = '',
       stall_hall = '',
       stall_zone = '',
       stall_dimensions = '',
       stall_allocated_at = NULL
 WHERE mobile IN ('9982170219', '9830944345', '9829085935');

-- Also ensure Libaas Fashion has profile cleared if any stale data exists.
UPDATE exhibitors
   SET stall_number = '',
       stall_hall = '',
       stall_zone = '',
       stall_dimensions = '',
       stall_allocated_at = NULL
 WHERE mobile = '9374739383' AND (stall_number = '132' OR stall_number = '');

-- 3. Delete old lottery allocations for the three firms.
DELETE FROM lottery_allocations
 WHERE mobile IN ('9982170219', '9830944345', '9829085935');

COMMIT;
