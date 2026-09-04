-- Surat Textile Expo 2026 - release SANKALP's real drawn bay so stall 30 goes live
-- Migration: 20260904000025_sankalp_stall_30_release_actual_bay.sql
--
-- Migration 20260903000022 tried to release the bay SANKALP (7719063355) was
-- vacating for stall 30, but named the wrong one: it deleted
-- lottery_allocations WHERE mobile = '7719063355' AND stall_number = '18'.
-- SANKALP's real live draw, from 30 Aug 2026, was stall 14, not 18 - so that
-- DELETE matched nothing and silently did nothing. Everything else in that
-- migration that keyed on mobile alone did apply: exhibitors.stall_sqft is
-- already 400 sq ft, but exhibitors.stall_number and lottery_allocations are
-- both still sitting on 14 - confirmed against a live pull of both tables on
-- 4 Sep 2026.
--
-- This finishes the release 20260903000022 started: it clears stall 14
-- (SANKALP's actual old bay) so the held row for stall 30 in
-- stallAllotment2026.ts is what shows for them everywhere, live portal
-- included, once they next open the Lucky Box - heldUnitFor() hands 30 back
-- with nothing to draw for.
--
-- Charchita Designer has the same mistaken-old-bay problem in 20260903000022
-- (real old bay 101, not 92) but is NOT touched here: her held target, stall
-- 18, is already live-held by an unrelated firm (Shiv Vardhan Sarees), and so
-- is Hariom Trendz's target, stall 92 (Saaj Creations). Releasing either
-- firm's old bay before that conflict is resolved would leave them with
-- nowhere to go, so both are left for the organisers to decide.
--
-- Idempotent: guarded on the row still existing, matched by mobile alone so
-- a rerun after the first one changes nothing.

BEGIN;

-- 1. Keep the old draw before undoing it.
INSERT INTO lottery_allocation_conflicts (
  mobile, brand_name, stall_sqft, stall_number, is_corner, shape,
  hall, zone, dimensions, slip_id, allocated_at, reason
)
SELECT
  a.mobile, a.brand_name, a.stall_sqft, a.stall_number, a.is_corner, a.shape,
  a.hall, a.zone, a.dimensions, a.slip_id, a.allocated_at,
  'Released for the 3 Sep 2026 chain: SANKALP move to stall 30 (organisers, '
  '3 Sep 2026). Corrects 20260903000022, which released stall 18 by mistake '
  '- SANKALP''s real live draw was stall 14.'
  FROM lottery_allocations a
 WHERE a.mobile = '7719063355'
   AND NOT EXISTS (
     SELECT 1 FROM lottery_allocation_conflicts c
      WHERE c.slip_id = a.slip_id
   );

-- 2. The exhibitor profile's own copy of the stall.
UPDATE exhibitors
   SET stall_number = '',
       stall_hall = '',
       stall_zone = '',
       stall_dimensions = '',
       stall_allocated_at = NULL
 WHERE mobile = '7719063355';

-- 3. The draw itself.
DELETE FROM lottery_allocations
 WHERE mobile = '7719063355';

COMMIT;
