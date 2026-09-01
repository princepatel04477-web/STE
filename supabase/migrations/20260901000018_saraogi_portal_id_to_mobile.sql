-- Surat Textile Expo 2026 - Saraogi Super Sales keyed by their number
-- Migration: 20260901000018_saraogi_portal_id_to_mobile.sql
--
-- STE_data_sheet.xlsx leaves Saraogi Super Sales Private Limited's number
-- blank, so they were registered under the portal ID "SSS" for want of one.
-- They answer on 9810550285 (organisers, 29 Aug 2026), which has been carried
-- as an alias since; from 1 Sep 2026 that number is their portal ID and "SSS"
-- is retired. src/data/registeredExhibitors.ts already reads that way, and the
-- guest list is what the login route gates on, so this is the rows to match.
--
-- Retired rather than left as a second way in, because two ways in had already
-- made two profiles:
--
--   exhibitors 287   mobile "SSS", the brand name, the 2600 sq ft and the
--                    fascia - seeded from the guest list, never signed into.
--   exhibitors 1999  mobile "9810550285", nothing but the password the firm
--                    set for themselves on 29 Aug. The login route creates a
--                    profile for whatever identifier signs in, and this is the
--                    one the firm actually uses.
--
-- So the admin console carried the firm twice and neither row was whole. This
-- moves what only the ID row had onto the number's row and drops the ID's, so
-- one row holds both the name and the password the firm signs in with. Leaving
-- "SSS" able to log in would simply fork the profile again.
--
-- Nothing else of theirs exists to move: no extras order, no artwork, no draw
-- and no conflict row stands against either identifier. Stall 39 - the 42m x
-- 6m, 2600 sqft anchor, the largest on the floor - is held for them on the
-- plan under 9810550285 already, so the hold is found by the number that
-- survives, and heldUnitFor() hands it back whichever way they sign in.
--
-- Idempotent: the copy is guarded on the target being empty and the deletes on
-- rows that may already be gone, so a rerun changes nothing.

BEGIN;

-- 1. Carry the name, the size and the fascia across to the number's row,
--    without overwriting anything the firm has since filled in themselves.
UPDATE exhibitors AS n
   SET brand_name = COALESCE(NULLIF(n.brand_name, ''), s.brand_name),
       stall_sqft = COALESCE(NULLIF(n.stall_sqft, ''), s.stall_sqft),
       fascia_names_json = CASE
         WHEN n.fascia_names_json IS NULL
           OR n.fascia_names_json = '[]'::jsonb
           OR n.fascia_names_json = '["","","",""]'::jsonb
         THEN s.fascia_names_json
         ELSE n.fascia_names_json
       END
  FROM exhibitors AS s
 WHERE n.mobile = '9810550285'
   AND s.mobile = 'SSS';

-- 2. The guest list the database keeps its own copy of. The number goes in
--    before the ID comes out, so the firm is never absent from it.
INSERT INTO allowed_exhibitors (mobile, notes)
VALUES ('9810550285', 'Saraogi Super Sales Private Limited (2600 sq ft)')
ON CONFLICT (mobile) DO NOTHING;

-- 3. The retired ID. The child tables are empty for it, but they are cleared
--    first anyway so this stays correct if anything is written against "SSS"
--    between the writing of this migration and its run.
DELETE FROM lottery_allocations
 WHERE mobile = 'SSS' OR firm_mobile = 'SSS';
DELETE FROM lottery_allocation_conflicts WHERE mobile = 'SSS';
DELETE FROM public.exhibitor_assets      WHERE mobile = 'SSS';
DELETE FROM exhibitor_orders             WHERE mobile = 'SSS';
DELETE FROM exhibitors                   WHERE mobile = 'SSS';
DELETE FROM allowed_exhibitors           WHERE mobile = 'SSS';

COMMIT;
