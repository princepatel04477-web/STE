-- Surat Textile Expo 2026 - Garden Vareli take stall 137
-- Migration: 20260901000016_garden_vareli_stall_137.sql
--
-- Garden Vareli (6357238663) booked a 3m x 6m, 200 sqft bay in the south hall
-- after STE_data_sheet.xlsx was filed (organisers, 1 Sep 2026). They go onto
-- the guest list in src/data/registeredExhibitors.ts and onto stall 137 in
-- src/data/stallAllotment2026.ts, held, and this puts them into the database
-- to match. It is the Anaya Designer migration, 20260831000013, with different
-- numbers.
--
-- The floor does not move for them. 137 is the bay Gopal Hari left when he
-- came off the list earlier the same day (20260901000014), and it is the only
-- bay in its pool/size/trade block - so no other firm could have drawn it
-- while it stood empty, and none loses a number now it is let. The row is held
-- rather than drawn, because a firm the sheet does not carry has no row for
-- the draw to seat; LATE_ENTRANTS in scripts/number_stalls.py also keeps them
-- out of the pool sizing, so the pool end and the split bays do not move.
--
-- What this migration does and does not cover, following 20260831000013:
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
--     drawn one: heldUnitFor() hands stall 137 straight back when they open
--     the Lucky Box, with nothing to draw for.
--
-- Idempotent: the insert does nothing where the number already stands, so a
-- rerun is a no-op.

BEGIN;

-- The guest list the database keeps its own copy of. `notes` follows the
-- shape the Google Sheets sync writes, "<brand> (<size>)".
INSERT INTO allowed_exhibitors (mobile, notes)
VALUES ('6357238663', 'Garden Vareli (200 sq ft)')
ON CONFLICT (mobile) DO NOTHING;

COMMIT;
