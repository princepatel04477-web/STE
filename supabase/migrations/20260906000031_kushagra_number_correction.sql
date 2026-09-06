-- Surat Textile Expo 2026 - Kushagra's mobile number was mistyped
-- Migration: 20260906000031_kushagra_number_correction.sql
--
-- Kushagra (stall 168) was carried everywhere as 9151060725; the real number
-- is 9151060275 (organisers, 6 Sep 2026). Mirrors the approach taken for
-- Apple Lifestyle's number change (20260829000009): every table files this
-- exhibitor under their mobile, so the number has to move in all of them
-- together, or the firm goes invisible under the corrected number while the
-- old one is still live to whoever might get it reassigned.
--
-- lottery_allocations cannot take a plain UPDATE here: trg_lock_lottery_stall_number
-- (20260903000023) rejects any UPDATE that changes mobile on that table by
-- design. That trigger's own remedy is delete-and-reinsert, which is what the
-- CTE below does - it never fires an UPDATE against the row's mobile.
--
-- Idempotent: every step is guarded so a rerun (or running against a database
-- where Kushagra never drew, or was seeded under the old number at all) is a
-- no-op rather than an error.

BEGIN;

-- 1. The profile.
UPDATE exhibitors
   SET mobile = '9151060275'
 WHERE mobile = '9151060725'
   AND NOT EXISTS (
     SELECT 1 FROM exhibitors x WHERE x.mobile = '9151060275'
   );

-- 2. The extras order.
UPDATE exhibitor_orders
   SET mobile = '9151060275'
 WHERE mobile = '9151060725'
   AND NOT EXISTS (
     SELECT 1 FROM exhibitor_orders x WHERE x.mobile = '9151060275'
   );

-- 3. Uploaded assets. Unique on (mobile, category), so a category already
--    filled under the corrected number keeps what is there.
UPDATE public.exhibitor_assets a
   SET mobile = '9151060275'
 WHERE a.mobile = '9151060725'
   AND NOT EXISTS (
     SELECT 1 FROM public.exhibitor_assets x
      WHERE x.mobile = '9151060275' AND x.category = a.category
   );

-- 4. The guest list.
UPDATE allowed_exhibitors
   SET mobile = '9151060275'
 WHERE mobile = '9151060725'
   AND NOT EXISTS (
     SELECT 1 FROM allowed_exhibitors x WHERE x.mobile = '9151060275'
   );

DELETE FROM allowed_exhibitors WHERE mobile = '9151060725';

-- 5. Draws set aside by the lottery conflict log. No unique index here, so
--    this moves unconditionally - it is a record of what happened and should
--    read under the corrected number.
UPDATE lottery_allocation_conflicts
   SET mobile = '9151060275'
 WHERE mobile = '9151060725';

-- 6. The draw itself: delete-and-reinsert onto the corrected number, since
--    the row's own trigger forbids an in-place mobile change.
WITH moved AS (
  DELETE FROM lottery_allocations
   WHERE mobile = '9151060725'
     AND NOT EXISTS (
       SELECT 1 FROM lottery_allocations x WHERE x.mobile = '9151060275'
     )
  RETURNING brand_name, stall_sqft, stall_number, is_corner, shape, hall, zone,
            dimensions, slip_id, allocated_at
)
INSERT INTO lottery_allocations (
  mobile, brand_name, stall_sqft, stall_number, is_corner, shape, hall, zone,
  dimensions, slip_id, allocated_at
)
SELECT '9151060275', brand_name, stall_sqft, stall_number, is_corner, shape,
       hall, zone, dimensions, slip_id, allocated_at
  FROM moved;

COMMIT;
