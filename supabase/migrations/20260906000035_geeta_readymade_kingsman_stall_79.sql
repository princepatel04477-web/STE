-- Surat Textile Expo 2026 - Geeta Readymade / Kingsman confirmed on stall 79
-- Migration: 20260906000034_geeta_readymade_kingsman_stall_79.sql
--
-- Stall 79 has stood as a HAND-CONFIRMED (held: true) assignment for Geeta
-- Readymade / Kingsman since before the 5 Sep 2026 roster rebuild, but it was
-- entirely absent from that roster and carried no mobile number, so the firm
-- had no portal access. The organisers confirmed the firm and its number,
-- 9503522336, on 6 Sep 2026 - the brand's typo'd spelling ("Geeta Readumade /
-- King,s Man") is corrected to "Geeta Readymade / Kingsman" and the mobile is
-- added in src/data/stallAllotment2026.ts and src/data/registeredExhibitors.ts,
-- and this migration puts the number into the database to match, following
-- the same approach as 20260901000017 (Raghav Creation, stall 152).
--
-- What this migration does and does not cover, following 20260901000017:
--
--   * The login gate is the guest list itself - isRegisteredExhibitor() reads
--     src/data/registeredExhibitors.ts - so the TypeScript edit is what opens
--     the portal to this number. allowed_exhibitors is a stored copy rather
--     than a view over that list, so it is written here too.
--   * The exhibitors profile row is deliberately not seeded. The login route
--     creates it on first sign-in, the same as for every other firm.
--   * The stall is not written onto the exhibitor either. stall_number and its
--     siblings have one writer - recordStallAllocation() - and a held stall
--     travels the same road as a drawn one: heldUnitFor() hands stall 79
--     straight back when they open the Lucky Box, with nothing to draw for.
--
-- Idempotent: the insert does nothing where the number already stands, so a
-- rerun is a no-op.

BEGIN;

-- The guest list the database keeps its own copy of. `notes` follows the
-- shape the Google Sheets sync writes, "<brand> (<size>)".
INSERT INTO allowed_exhibitors (mobile, notes)
VALUES ('9503522336', 'Geeta Readymade / Kingsman (200 sq ft)')
ON CONFLICT (mobile) DO NOTHING;

COMMIT;
