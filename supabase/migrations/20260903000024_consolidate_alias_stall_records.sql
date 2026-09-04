-- Surat Textile Expo 2026 - fold drawn stalls back onto each firm's canonical
-- number
-- Migration: 20260903000024_consolidate_alias_stall_records.sql
--
-- src/data/registeredExhibitors.ts already knows about firms that gave the
-- organisers more than one number: the master sheet keeps one canonical
-- mobile per firm and lists the rest under `aliases`, and canonicalMobile()
-- folds a login on any alias onto that one row before touching the database
-- (src/app/api/auth/login/route.ts: "Always fold to canonical mobile so alias
-- logins share the master row"). That folding was added after eight firms had
-- already drawn under what is now their alias number, so their row in
-- lottery_allocations is still sitting under the wrong mobile - reading the
-- database directly (an export, a report, this migration's own audit query)
-- shows the draw split across two numbers for the same firm, which is what
-- looked like "the stall number changed" from outside the portal.
--
-- This does not change any stall number - every pair below keeps the exact
-- number it already drew (verified against the live database on 3 Sep 2026,
-- see the table below) - it only moves the row onto the mobile
-- registeredExhibitors.ts and canonicalMobile() already treat as that firm's
-- one true number, so a raw read of the table agrees with what the portal
-- already shows.
--
--   Brand                          Stall   Alias (draw sits here) -> Canonical
--   Tithi Designer                   1     8511573752 -> 9662399969
--   Shiv Vardhaan                   18     8804754940 -> 7874363994
--   Shubh Saachi/Shiv Ganges        32     9687609749 -> 7405442380
--   Laxmi Creation                  63     9825363099 -> 9825363009
--   Rachit Group                    71     9825146981 -> 9852146981
--   Shritik Designer                80     9978912068 -> 9081277726
--   Shankh Designer                 93     8619183572 -> 7600710440
--   Raghav Silk Mills               98     7818968985 -> 9825572748
--
-- lottery_allocations.stall_number is unique and (as of migration
-- 20260903000023) immutable in place, so this moves each row with DELETE +
-- INSERT rather than UPDATE - the same pattern every prior correction has
-- used. The exhibitors profile under the alias number is left in place (it
-- may carry uploaded documents) but its stall copy is cleared, since the
-- canonical row already carries the correct one and a stale copy on the
-- alias would just reopen the same confusion.
--
-- Also drops one corrupted exhibitors row for Sahil Creation whose mobile is
-- "9825130U650" (a stray letter, not a valid number) - it carries no stall,
-- no allocation date and no draw; the real Sahil Creation is 9825130650,
-- already correctly seated on stall 104. Nothing to consolidate, just noise
-- to remove.
--
-- Idempotent: every move is guarded on the alias row still existing under the
-- old mobile, so a rerun after the first one changes nothing.

BEGIN;

CREATE OR REPLACE FUNCTION _move_lottery_allocation(p_from TEXT, p_to TEXT)
RETURNS VOID AS $$
DECLARE
  row_data lottery_allocations%ROWTYPE;
BEGIN
  SELECT * INTO row_data FROM lottery_allocations WHERE mobile = p_from;
  IF NOT FOUND THEN
    RETURN; -- already moved, or never was there
  END IF;

  IF EXISTS (SELECT 1 FROM lottery_allocations WHERE mobile = p_to) THEN
    RAISE NOTICE 'Skipping %: canonical mobile % already has a draw', p_from, p_to;
    RETURN;
  END IF;

  DELETE FROM lottery_allocations WHERE mobile = p_from;

  -- firm_mobile is NOT NULL as of 20260828000008 and is the one-stall-per-firm
  -- guarantee, so it has to be listed here: leaving it out made every one of
  -- the eight moves below fail the not-null constraint and took the whole
  -- migration down with it. The firm is the number the row is moving to.
  INSERT INTO lottery_allocations (
    mobile, firm_mobile, brand_name, stall_sqft, stall_number, is_corner, shape,
    hall, zone, dimensions, slip_id, allocated_at
  ) VALUES (
    p_to, p_to, row_data.brand_name, row_data.stall_sqft, row_data.stall_number,
    row_data.is_corner, row_data.shape, row_data.hall, row_data.zone,
    row_data.dimensions, row_data.slip_id, row_data.allocated_at
  );
END;
$$ LANGUAGE plpgsql;

SELECT _move_lottery_allocation('8511573752', '9662399969'); -- Tithi Designer
SELECT _move_lottery_allocation('8804754940', '7874363994'); -- Shiv Vardhaan
SELECT _move_lottery_allocation('9687609749', '7405442380'); -- Shubh Saachi/Shiv Ganges
SELECT _move_lottery_allocation('9825363099', '9825363009'); -- Laxmi Creation
SELECT _move_lottery_allocation('9825146981', '9852146981'); -- Rachit Group
SELECT _move_lottery_allocation('9978912068', '9081277726'); -- Shritik Designer
SELECT _move_lottery_allocation('8619183572', '7600710440'); -- Shankh Designer
SELECT _move_lottery_allocation('7818968985', '9825572748'); -- Raghav Silk Mills

DROP FUNCTION _move_lottery_allocation(TEXT, TEXT);

-- Blank the stall copy on each alias profile - the canonical row already has
-- it, and profile data (documents, photos) on the alias row is left alone.
UPDATE exhibitors
   SET stall_number = '', stall_hall = '', stall_zone = '',
       stall_dimensions = '', stall_allocated_at = NULL
 WHERE mobile IN (
   '8511573752', '8804754940', '9687609749', '9825363099',
   '9825146981', '9978912068', '8619183572', '7818968985'
 )
 AND stall_number <> '';

-- One corrupted row, not part of any alias pair: not a valid mobile number,
-- carries no draw and no stall.
DELETE FROM exhibitors
 WHERE mobile = '9825130U650'
   AND stall_number = ''
   AND stall_allocated_at IS NULL;

COMMIT;
