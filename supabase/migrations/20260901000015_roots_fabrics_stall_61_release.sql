-- Surat Textile Expo 2026 - release Roots Fabrics from stall 61
-- Migration: 20260901000015_roots_fabrics_stall_61_release.sql
--
-- Roots Fabrics (9825424890) drew stall 61 on 29 Aug 2026, slip
-- STE-2026-61-4890-9811. Two days later 20260831000012_navdurga_withdrawal.sql
-- took stall 61 off the plan when Navdurga pulled out, without noticing the
-- bay had already been drawn. The floor plan and the admin lucky draw panel
-- have counted 61 as free ever since, while Roots Fabrics hold a slip for it -
-- 600 of the 2,400 free sqft the panel reports is a stall somebody holds.
--
-- The draw is released rather than the bay restored (organisers, 1 Sep 2026).
-- 61 is off the plan and stays off, so it can never be drawn again; releasing
-- the draw is what makes the panel's own figures true. Roots Fabrics go back
-- to undrawn and open the Lucky Box again, drawing from the six bays still
-- free in their block - 36, 56, 59, 62, 64 and 65, every one a 3m x 18m,
-- 600 sqft saree bay, the size and trade they booked.
--
-- Nothing is thrown away. The draw is copied into
-- lottery_allocation_conflicts first, the table 20260828000007 built for
-- exactly this, so the slip can be read back or put in again.
--
-- Idempotent: the copy is guarded on the slip id and the clears are guarded on
-- the stall, so a rerun inserts no second copy and changes nothing.

BEGIN;

-- 1. Keep the draw before undoing it.
INSERT INTO lottery_allocation_conflicts (
  mobile, brand_name, stall_sqft, stall_number, is_corner, shape,
  hall, zone, dimensions, slip_id, allocated_at, reason
)
SELECT
  a.mobile, a.brand_name, a.stall_sqft, a.stall_number, a.is_corner, a.shape,
  a.hall, a.zone, a.dimensions, a.slip_id, a.allocated_at,
  'Stall 61 was taken off the plan by 20260831000012_navdurga_withdrawal.sql '
  'after this draw was made. Released so the firm can redraw onto a bay that '
  'is still on the floor (organisers, 1 Sep 2026).'
  FROM lottery_allocations a
 WHERE a.mobile = '9825424890'
   AND upper(btrim(a.stall_number)) = '61'
   AND NOT EXISTS (
     SELECT 1 FROM lottery_allocation_conflicts c
      WHERE c.slip_id = a.slip_id
   );

-- 2. The copy of the stall the exhibitor profile carries. /api/lottery/status
--    and the dashboard read this row, so a stall left here would keep showing
--    61 on the firm's own page and on the master export after the draw is
--    gone.
UPDATE exhibitors
   SET stall_number = '',
       stall_hall = '',
       stall_zone = '',
       stall_dimensions = '',
       stall_allocated_at = NULL
 WHERE mobile = '9825424890'
   AND upper(btrim(stall_number)) = '61';

-- 3. The draw itself. Last, so a failure part-way through leaves the firm
--    holding their stall rather than half-released.
DELETE FROM lottery_allocations
 WHERE mobile = '9825424890'
   AND upper(btrim(stall_number)) = '61';

COMMIT;
