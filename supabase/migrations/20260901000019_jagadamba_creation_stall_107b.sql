-- Surat Textile Expo 2026 - Jagadamba Creation take stall 107B
-- Migration: 20260901000019_jagadamba_creation_stall_107b.sql
--
-- Jagadamba Creation (9998675623) book 100 sqft of fabrics (organisers,
-- 1 Sep 2026). They go onto the guest list in src/data/registeredExhibitors.ts
-- and onto unit 107B in src/data/stallAllotment2026.ts, held, and this puts
-- them into the database to match. It is the Garden Vareli migration,
-- 20260901000016, with different numbers.
--
-- 107B is half of stall 107, the 3m x 6m bay at the head of the south hall
-- that was cut in two to cover the saree pool's 100 sqft demand. Amaya drew
-- 107A; 107B is the half the saree list never reached, so letting it costs
-- nobody a number and 107A stays where it is.
--
-- Unlike the three firms before them they are on STE_data_sheet.xlsx - the
-- organisers wrote the row when they booked - so they need no LATE_ENTRANTS
-- entry: that list keeps a late booking out of the saree pool sizing, and only
-- the saree list sizes the pool. The stall is still held rather than drawn,
-- because every 100 sqft unit outside the saree pool is already taken and the
-- two standing empty, 103 and 107B, are both inside it, where a general firm's
-- draw cannot reach.
--
-- What this migration does and does not cover, following 20260901000016:
--
--   * The login gate is the guest list itself - isRegisteredExhibitor() reads
--     src/data/registeredExhibitors.ts - so the TypeScript edit is what opens
--     the portal to this number. allowed_exhibitors is a stored copy rather
--     than a view over that list, so it is written here too.
--   * The exhibitors profile row is deliberately not seeded. The login route
--     creates it on first sign-in, the same as for every other firm.
--   * The stall is not written onto the exhibitor either. stall_number and its
--     siblings have one writer - recordStallAllocation() in
--     src/lib/stallAssignment.ts - and a held stall travels the same road as a
--     drawn one: heldUnitFor() hands 107B straight back when they open the
--     Lucky Box, with nothing to draw for.
--
-- Idempotent: the insert does nothing where the number already stands, so a
-- rerun is a no-op.

BEGIN;

-- The guest list the database keeps its own copy of. `notes` follows the
-- shape the Google Sheets sync writes, "<brand> (<size>)".
INSERT INTO allowed_exhibitors (mobile, notes)
VALUES ('9998675623', 'Jagadamba Creation (100 sq ft)')
ON CONFLICT (mobile) DO NOTHING;

COMMIT;
