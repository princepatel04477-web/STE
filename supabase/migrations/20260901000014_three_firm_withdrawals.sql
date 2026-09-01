-- Surat Textile Expo 2026 - Gopal Hari, Kalavilla and Surat Saree House off
-- Migration: 20260901000014_three_firm_withdrawals.sql
--
-- Three firms come off the list (organisers, 1 Sep 2026). They are off the
-- guest list in src/data/registeredExhibitors.ts and off the floor in
-- src/data/stallAllotment2026.ts, which frees stalls 137 and 139, and this
-- takes them out of the database to match. It follows
-- 20260831000012_navdurga_withdrawal.sql, and for two of the three it is the
-- same migration with different numbers.
--
-- The guest list alone is not enough. allowed_exhibitors is what the login
-- route checks and is a stored table rather than a view over the list, so a
-- row left there would keep letting the number in on the shared default
-- password. The exhibitors row has to go with it: /api/admin/exhibitors
-- reports on that table, so a row left behind would keep the firm on the
-- master export, in the head count and in the extras totals.
--
-- None of the three had filled anything in - no password, no artwork, no
-- extras, no drawn stall - so the child tables are already empty for these
-- numbers. They are still cleared first, and by mobile rather than by id, so
-- this stays correct if anything is written between the writing of this
-- migration and its run.
--
-- Gopal Hari is the exception, and the reason this is not three copies of the
-- Navdurga migration. See part 3.
--
-- Idempotent: every statement matches rows where they exist and does nothing
-- where they do not, so a rerun is a no-op.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Kalavilla (7016061443)
--
-- Their bay on the plan was 136, but 139 is the one their exit frees:
-- Shakambari Lace House drew 136 in the live lottery, and that allotment
-- stands untouched here.
-- ---------------------------------------------------------------------------
DELETE FROM lottery_allocations
 WHERE mobile = '7016061443' OR firm_mobile = '7016061443';
DELETE FROM lottery_allocation_conflicts WHERE mobile = '7016061443';
DELETE FROM public.exhibitor_assets     WHERE mobile = '7016061443';
DELETE FROM exhibitor_orders            WHERE mobile = '7016061443';
DELETE FROM exhibitors                  WHERE mobile = '7016061443';
DELETE FROM allowed_exhibitors          WHERE mobile = '7016061443';

-- ---------------------------------------------------------------------------
-- 2. Surat Saree House (9726254452)
--
-- Never confirmed and never seated - Jyotsna hold the 60 they had drawn - so
-- nothing comes off the floor with them.
-- ---------------------------------------------------------------------------
DELETE FROM lottery_allocations
 WHERE mobile = '9726254452' OR firm_mobile = '9726254452';
DELETE FROM lottery_allocation_conflicts WHERE mobile = '9726254452';
DELETE FROM public.exhibitor_assets     WHERE mobile = '9726254452';
DELETE FROM exhibitor_orders            WHERE mobile = '9726254452';
DELETE FROM exhibitors                  WHERE mobile = '9726254452';
DELETE FROM allowed_exhibitors          WHERE mobile = '9726254452';

-- ---------------------------------------------------------------------------
-- 3. Gopal Hari - renamed, not deleted
--
-- Gopal Hari never had a number of his own: the master sheet gives him Gauri
-- Ganesh's, 9601700354, which is why registeredExhibitors.ts carried him under
-- the portal ID "GOPALHARI" instead. The seeding read the sheet, so the single
-- row on 9601700354 was written under his name - and it is the only row that
-- number has, in either table.
--
-- Deleting it would therefore take Gauri Ganesh out with him. They are a
-- confirmed firm, on stall 8 of the plan and still to draw, and 9601700354 is
-- the number they log in on. So the row is renamed to its rightful owner
-- rather than deleted, and the allowed_exhibitors row is left alone: the
-- number stays whitelisted because it was always Gauri Ganesh's.
--
-- Gopal Hari himself needs no delete. "GOPALHARI" was a portal ID on the guest
-- list only - allowed_exhibitors never carried it, so it never opened the
-- portal, and removing him from registeredExhibitors.ts is the whole of it.
--
-- Guarded on the old brand name, so this touches only a row still carrying it
-- and cannot rename Gauri Ganesh's row a second time.
-- ---------------------------------------------------------------------------
UPDATE exhibitors
   SET brand_name = 'Gauri Ganesh',
       fascia_names_json = jsonb_build_array('Gauri Ganesh', '', '', '')
 WHERE mobile = '9601700354'
   AND brand_name = 'Gopal Hari';

COMMIT;
