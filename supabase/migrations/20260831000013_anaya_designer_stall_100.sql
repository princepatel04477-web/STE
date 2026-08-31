-- Surat Textile Expo 2026 - Anaya Designer take stall 100
-- Migration: 20260831000013_anaya_designer_stall_100.sql
--
-- Anaya Designer (9998023918) booked the 3m x 24m, 800 sqft anchor in the
-- north hall after STE_data_sheet.xlsx was filed (organisers, 31 Aug 2026).
-- They go onto the guest list in src/data/registeredExhibitors.ts and onto
-- stall 100 in src/data/stallAllotment2026.ts, held, and this puts them into
-- the database to match.
--
-- The floor does not move for them. The saree band lays out three bays of that
-- size - 35, 37 and 100 - against the two firms on the sheet that booked it,
-- so 100 was the one the draw left standing. Seating a late firm through the
-- draw would have reordered every brand behind them, which is why the row is
-- held instead; LATE_ENTRANTS in scripts/number_stalls.py also keeps them out
-- of the pool sizing, so the pool end and the split bays do not move either.
--
-- What this migration does and does not cover:
--
--   * The login gate is the guest list itself - isRegisteredExhibitor() reads
--     src/data/registeredExhibitors.ts - so the TypeScript edit is what opens
--     the portal to this number. allowed_exhibitors is a stored copy rather
--     than a view over that list, and the sheet sync and the Navdurga
--     withdrawal both keep it in step, so it is written here too.
--   * The exhibitors profile row is deliberately not seeded. The login route
--     creates it on first sign-in, the same as for every other firm, and an
--     empty row inserted early is indistinguishable from a profile the firm
--     opened and left blank. The admin export does not need it: that walks
--     REGISTERED_EXHIBITORS_LIST, so the firm, their 800 sqft and their extras
--     totals appear from the guest list alone.
--   * The stall is not written onto the exhibitor either. stall_number and its
--     siblings have one writer - recordStallAllocation() in
--     src/lib/stallAssignment.ts (migration 20260827000006) - and a held stall
--     travels the same road as a drawn one: heldUnitFor() hands stall 100
--     straight back when they open the Lucky Box, with nothing to draw for.
--     That is how 43, 46, 60 and the other held stalls are already recorded.
--
-- Idempotent: the insert does nothing where the number already stands, so a
-- rerun is a no-op.

BEGIN;

-- The guest list the database keeps its own copy of. `notes` follows the
-- shape the Google Sheets sync writes, "<brand> (<size>)".
INSERT INTO allowed_exhibitors (mobile, notes)
VALUES ('9998023918', 'Anaya Designer (800 sq ft)')
ON CONFLICT (mobile) DO NOTHING;

COMMIT;
