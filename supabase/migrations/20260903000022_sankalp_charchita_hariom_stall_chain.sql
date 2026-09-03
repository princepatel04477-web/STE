-- Surat Textile Expo 2026 - SANKALP to 30, Charchita to 18, Hariom Trendz to 92
-- Migration: 20260903000022_sankalp_charchita_hariom_stall_chain.sql
--
-- Three moves the organisers made as one chain (organisers, 3 Sep 2026):
--
--   30  SANKALP (7719063355) move up off the 200 sqft bay 18 onto stall 30,
--       a 3m x 12m, 400 sqft bay at the head of the north hall. 30 is the bay
--       the live draw left standing - Abhaar Vastram drew 31 and Bharti Sarees
--       44 - so nobody holds a slip for it and seating them costs no number.
--   18  Charchita Designer (9408990045) move up off the 100 sqft bay 92 onto
--       the 3m x 6m, 200 sqft bay SANKALP vacate.
--   92  Hariom Trendz (9586746162) take the 3m x 3m, 100 sqft bay Charchita
--       vacate. They are not on STE_data_sheet.xlsx, so they join the guest
--       list here as well.
--
-- The chain closes on itself: each firm steps onto the bay the one before it
-- left, so no bay ends up free that was not free before and no firm outside
-- the three changes number. All three rows are held in
-- src/data/stallAllotment2026.ts rather than drawn - a vacated bay put back
-- into its block would be handed out in draw order, which would pull brands
-- off numbers already on their slips.
--
-- Two of the three are resizes, not swaps: SANKALP go 200 -> 400 sqft and
-- Charchita 100 -> 200 sqft. src/data/registeredExhibitors.ts carries the new
-- sizes, the way it does for Shiv Vardhaan on 141, and this migration puts
-- the same figures into the database's own copies - `notes` on
-- allowed_exhibitors and stall_sqft on exhibitors - so the profile page, the
-- master export and the extras bill quote the size the firm now occupies.
--
-- What this migration does and does not cover, following 20260901000016:
--
--   * The login gate is the guest list itself - isRegisteredExhibitor() reads
--     src/data/registeredExhibitors.ts - so the TypeScript edit is what opens
--     the portal to Hariom Trendz. allowed_exhibitors is a stored copy rather
--     than a view over that list, so it is written here too.
--   * The exhibitors profile row is not seeded for Hariom Trendz. The login
--     route creates it on first sign-in, the same as for every other firm.
--   * The new stalls are not written onto the exhibitors either. stall_number
--     and its siblings have one writer - recordStallAllocation() in
--     src/lib/stallAssignment.ts - and a held stall travels the same road as a
--     drawn one: heldUnitFor() hands 30, 18 and 92 straight back when each
--     firm opens the Lucky Box, with nothing to draw for.
--   * What this DOES have to undo is any draw SANKALP or Charchita already
--     made on their old bays. A slip for 18 or 92 outstanding against the firm
--     that has left it would keep the old number on their dashboard and on the
--     master export, and would show the bay as taken by the wrong firm. The
--     draws are copied into lottery_allocation_conflicts first - the table
--     20260828000007 built for exactly this - so nothing is thrown away and
--     either slip can be read back.
--
-- Idempotent: the copy is guarded on the slip id, the clears are guarded on
-- the old stall, and both inserts are ON CONFLICT, so a rerun changes nothing.

BEGIN;

-- 1. Keep the old draws before undoing them.
INSERT INTO lottery_allocation_conflicts (
  mobile, brand_name, stall_sqft, stall_number, is_corner, shape,
  hall, zone, dimensions, slip_id, allocated_at, reason
)
SELECT
  a.mobile, a.brand_name, a.stall_sqft, a.stall_number, a.is_corner, a.shape,
  a.hall, a.zone, a.dimensions, a.slip_id, a.allocated_at,
  'Released for the 3 Sep 2026 chain: SANKALP move to stall 30, Charchita '
  'Designer to stall 18, Hariom Trendz to stall 92 (organisers, 3 Sep 2026).'
  FROM lottery_allocations a
 WHERE (   (a.mobile = '7719063355' AND upper(btrim(a.stall_number)) = '18')
        OR (a.mobile = '9408990045' AND upper(btrim(a.stall_number)) = '92'))
   AND NOT EXISTS (
     SELECT 1 FROM lottery_allocation_conflicts c
      WHERE c.slip_id = a.slip_id
   );

-- 2. The copy of the stall the exhibitor profile carries. /api/lottery/status
--    and the dashboard read this row, so a stall left here would keep showing
--    the vacated bay after the draw is gone.
UPDATE exhibitors
   SET stall_number = '',
       stall_hall = '',
       stall_zone = '',
       stall_dimensions = '',
       stall_allocated_at = NULL
 WHERE (mobile = '7719063355' AND upper(btrim(stall_number)) = '18')
    OR (mobile = '9408990045' AND upper(btrim(stall_number)) = '92');

-- 3. The old draws themselves. After the profile copy, so a failure part-way
--    through leaves each firm holding their old stall rather than half-released.
DELETE FROM lottery_allocations
 WHERE (mobile = '7719063355' AND upper(btrim(stall_number)) = '18')
    OR (mobile = '9408990045' AND upper(btrim(stall_number)) = '92');

-- 4. The two resizes, on the database's own copies of the booked size.
UPDATE exhibitors SET stall_sqft = '400 sq ft', updated_at = NOW()
 WHERE mobile = '7719063355';
UPDATE exhibitors SET stall_sqft = '200 sq ft', updated_at = NOW()
 WHERE mobile = '9408990045';

UPDATE allowed_exhibitors SET notes = 'SANKALP (400 sq ft)'
 WHERE mobile = '7719063355';
UPDATE allowed_exhibitors SET notes = 'Charchita Designer (200 sq ft)'
 WHERE mobile = '9408990045';

-- 5. Hariom Trendz join the guest list the database keeps its own copy of.
--    `notes` follows the shape the Google Sheets sync writes,
--    "<brand> (<size>)".
INSERT INTO allowed_exhibitors (mobile, notes)
VALUES ('9586746162', 'Hariom Trendz (100 sq ft)')
ON CONFLICT (mobile) DO NOTHING;

COMMIT;
