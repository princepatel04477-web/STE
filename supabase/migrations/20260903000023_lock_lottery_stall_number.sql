-- Surat Textile Expo 2026 - a drawn stall number can never be changed in place
-- Migration: 20260903000023_lock_lottery_stall_number.sql
--
-- lottery_allocations already has one guarantee: stall_number is UNIQUE
-- (migration 20260828000007), so two firms can never hold the same bay. It has
-- no guarantee against the opposite mistake - one firm's row being silently
-- rewritten onto a different bay after the draw. Every legitimate correction
-- so far (the withdrawals, the Sep 3 stall chain) has gone through DELETE +
-- INSERT, never UPDATE - src/lib/stallAssignment.ts confirms the app itself
-- never issues an UPDATE against this table either, only INSERT (the draw)
-- and SELECT (reads). So an UPDATE that changes stall_number here is always
-- either a bug or a hand-run statement that skipped the DELETE-and-reinsert
-- pattern, and neither should be allowed to succeed quietly.
--
-- This trigger makes that a database-level guarantee instead of a convention:
-- once a row exists, its stall_number (and mobile, so a bay cannot be handed
-- to a different firm by editing the phone number on the row instead) cannot
-- be changed by any UPDATE, regardless of role - service role included. A
-- correction still works exactly as every migration so far has done it:
-- DELETE the row (optionally via lottery_allocation_conflicts, as
-- 20260828000007 and 20260903000022 do) and INSERT the new one.
--
-- Idempotent: CREATE OR REPLACE FUNCTION and DROP TRIGGER IF EXISTS make a
-- rerun harmless.

CREATE OR REPLACE FUNCTION reject_lottery_stall_number_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stall_number IS DISTINCT FROM OLD.stall_number
     OR NEW.mobile IS DISTINCT FROM OLD.mobile THEN
    RAISE EXCEPTION
      'lottery_allocations.stall_number and mobile are immutable once drawn '
      '(row id %, stall % held by %). Delete and re-insert the row instead - '
      'see migration 20260828000007 or 20260903000022 for the pattern.',
      OLD.id, OLD.stall_number, OLD.mobile
      USING ERRCODE = 'restrict_violation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_lock_lottery_stall_number ON lottery_allocations;

CREATE TRIGGER trg_lock_lottery_stall_number
  BEFORE UPDATE ON lottery_allocations
  FOR EACH ROW
  EXECUTE FUNCTION reject_lottery_stall_number_change();

COMMENT ON FUNCTION reject_lottery_stall_number_change() IS
  'Blocks any UPDATE that changes stall_number or mobile on lottery_allocations. '
  'A drawn stall is final: release it with DELETE and re-seat with INSERT.';
