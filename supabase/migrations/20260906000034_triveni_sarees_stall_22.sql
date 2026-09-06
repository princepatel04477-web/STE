-- Surat Textile Expo 2026 - Triveni Sarees hand-allotted stall 22
-- Migration: 20260906000034_triveni_sarees_stall_22.sql
--
-- Stall 22 (12m x 3m, North Hall, 400 sqft) was explicitly marked EMPTY by
-- the 5 Sep 2026 roster rebuild - its previous Triveni listing had gone
-- stale on the drawing and was dropped. The organisers hand-allotted it to
-- Triveni Sarees, mobile 9712720963, on 6 Sep 2026. The firm and stall are
-- added as held: true in src/data/stallAllotment2026.ts and to the guest
-- list in src/data/registeredExhibitors.ts; this migration puts the number
-- into the database to match, following the same approach as 20260901000017
-- (Raghav Creation, stall 152).
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
--     travels the same road as a drawn one: heldUnitFor() hands stall 22
--     straight back when they open the Lucky Box, with nothing to draw for.
--
-- Idempotent: the insert does nothing where the number already stands, so a
-- rerun is a no-op.

BEGIN;

-- The guest list the database keeps its own copy of. `notes` follows the
-- shape the Google Sheets sync writes, "<brand> (<size>)".
INSERT INTO allowed_exhibitors (mobile, notes)
VALUES ('9712720963', 'Triveni Sarees (400 sq ft)')
ON CONFLICT (mobile) DO NOTHING;

COMMIT;
