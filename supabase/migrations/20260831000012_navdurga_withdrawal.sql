-- Surat Textile Expo 2026 - Navdurga withdraw
-- Migration: 20260831000012_navdurga_withdrawal.sql
--
-- Navdurga (9714604040) have pulled out (organisers, 31 Aug 2026). They come
-- off the guest list in src/data/registeredExhibitors.ts and off the floor in
-- src/data/stallAllotment2026.ts, which frees stall 61, and this takes them
-- out of the database to match.
--
-- The guest list alone is not enough. allowed_exhibitors is what the login
-- route checks, and it is a stored table rather than a view over the list, so
-- a row left there would keep letting the number in on the shared default
-- password long after the firm is off the floor. The exhibitors row has to go
-- with it: /api/admin/exhibitors reports on that table, so a row left behind
-- would keep the firm on the organiser's master export, in the head count and
-- in the extras demand totals, with a stall number nobody holds.
--
-- Nothing of theirs was ever filled in - the profile was seeded and never
-- opened, with no password set, no artwork uploaded, no extras ordered and no
-- stall drawn - so the child tables are empty for this number. They are still
-- cleared first, and by mobile rather than by id, so this stays correct if the
-- firm touches the portal between the writing of this migration and its run.
--
-- Idempotent: every statement deletes rows where they exist and does nothing
-- where they do not, so a rerun, or a run against a database the firm was
-- never seeded into, is a no-op.

BEGIN;

-- 1. The draw. `mobile` is the number that drew; `firm_mobile` is the firm the
--    one-stall-per-firm index holds (migration 20260828000008), and either can
--    carry the firm on its own.
DELETE FROM lottery_allocations
 WHERE mobile = '9714604040'
    OR firm_mobile = '9714604040';

-- Draws set aside by 20260828000007 / 20260828000008.
DELETE FROM lottery_allocation_conflicts
 WHERE mobile = '9714604040';

-- 2. Uploaded artwork. This clears the rows only - an object left in the
--    storage bucket outlives the row that named it, so a firm that had
--    uploaded artwork would want its bucket folder swept too. Navdurga
--    uploaded none.
DELETE FROM public.exhibitor_assets
 WHERE mobile = '9714604040';

-- 3. Extras order, and the badge counts that ride on it.
DELETE FROM exhibitor_orders
 WHERE mobile = '9714604040';

-- 4. The profile the admin console reports on.
DELETE FROM exhibitors
 WHERE mobile = '9714604040';

-- 5. The guest list the login route checks. Last, so a failure part-way
--    through leaves the firm locked out rather than half-deleted and still
--    able to log in.
DELETE FROM allowed_exhibitors
 WHERE mobile = '9714604040';

COMMIT;
