-- Surat Textile Expo 2026 - release Charchita Designer's real drawn bay,
-- and correct the chain's target bays for Charchita and Hariom Trendz
-- Migration: 20260904000026_charchita_stall_14_release_actual_bay.sql
--
-- Two bugs in migration 20260903000022, found together with the SANKALP one
-- fixed by 20260904000025:
--
--   1. It released "stall 92" for Charchita Designer (9408990045), but her
--      real live draw, from 2 Sep 2026, was stall 101 - so that DELETE
--      matched nothing, the same silent no-op as SANKALP's. Her
--      exhibitors.stall_sqft is already 200 sq ft (that update did apply);
--      stall_number is still stuck on 101.
--
--   2. The chain's target bays were wrong regardless of the above: stall 18
--      (meant for Charchita) was already legitimately drawn by Shiv Vardhaan
--      on 31 Aug 2026, and stall 92 (meant for Hariom Trendz) was already
--      legitimately drawn by Saaj Creations on 27 Aug 2026 - both real draws
--      that predate the 3 Sep chain decision. Neither bay was ever free.
--
-- The corrected chain (organisers, 4 Sep 2026) uses the bays that actually
-- came free instead of the two that were never available:
--
--   14   Charchita Designer moves onto the 200 sqft bay SANKALP actually
--        vacated (not 18 - see 20260904000025).
--   101  Hariom Trendz moves onto the 100 sqft bay Charchita actually
--        vacates here (not 92).
--
-- stall 18 stays with Shiv Vardhaan and stall 92 stays with Saaj Creations -
-- neither is touched by this migration, because both are real draws by
-- firms outside this chain entirely. src/data/stallAllotment2026.ts is
-- updated to match: unit 14 is now held for Charchita, unit 101 is now held
-- for Hariom Trendz, and units 18 and 92 are no longer marked held at all.
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
  'Released for the corrected 3 Sep 2026 chain: Charchita Designer move to '
  'stall 14 (organisers, 4 Sep 2026). Corrects 20260903000022, which '
  'released stall 92 by mistake - Charchita''s real live draw was stall 101 '
  '- and re-targets her from stall 18 (already held live by Shiv Vardhaan) '
  'to stall 14 (SANKALP''s actual vacated bay, see 20260904000025).'
  FROM lottery_allocations a
 WHERE a.mobile = '9408990045'
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
 WHERE mobile = '9408990045';

-- 3. The draw itself.
DELETE FROM lottery_allocations
 WHERE mobile = '9408990045';

COMMIT;
