-- Surat Textile Expo 2026 - Raghav Creation take the merged stall 152
-- Migration: 20260901000017_raghav_creation_stall_152.sql
--
-- Stalls 152 and 153 were the last two 3m x 3m squares at the foot of the east
-- column of the south hall. The organisers have thrown them together into one
-- 3m x 6m, 200 sqft bay under the lower number, and let it to Raghav Creation
-- (9830944345), a firm who booked after STE_data_sheet.xlsx was filed
-- (organisers, 1 Sep 2026). They go onto the guest list in
-- src/data/registeredExhibitors.ts and onto stall 152 in
-- src/data/stallAllotment2026.ts, held, and this puts them into the database
-- to match. It follows 20260831000013 and 20260901000016, and does the same
-- thing for the same reasons.
--
-- The merge costs nobody a number: both squares were standing free, so it took
-- nothing off anyone's slip, and they were the last pair on the floor, so
-- nothing renumbers behind them. The floor now runs 1..152 with no gap. No
-- database row anywhere carried stall 153 - nobody had drawn either square -
-- so there is nothing here to clean up, only the new firm to admit.
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
--     siblings have one writer - recordStallAllocation() - and a held stall
--     travels the same road as a drawn one: heldUnitFor() hands stall 152
--     straight back when they open the Lucky Box, with nothing to draw for.
--
-- Idempotent: the insert does nothing where the number already stands, so a
-- rerun is a no-op.

BEGIN;

-- The guest list the database keeps its own copy of. `notes` follows the
-- shape the Google Sheets sync writes, "<brand> (<size>)".
INSERT INTO allowed_exhibitors (mobile, notes)
VALUES ('9830944345', 'Raghav Creation (200 sq ft)')
ON CONFLICT (mobile) DO NOTHING;

COMMIT;
