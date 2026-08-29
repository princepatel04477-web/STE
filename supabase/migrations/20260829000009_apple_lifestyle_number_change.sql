-- Surat Textile Expo 2026 - Apple lifestyle change their number
-- Migration: 20260829000009_apple_lifestyle_number_change.sql
--
-- Apple lifestyle have given up 9099140404 and answer on 9825398582
-- (organisers, 29 Aug 2026). The old number is retired rather than kept as an
-- alias: it may be reassigned, and mobile plus a shared default password is
-- the whole of the portal's credential, so leaving it on the guest list would
-- hand the firm's profile, invoice and stall to whoever gets the number next.
--
-- Every table files an exhibitor under their mobile, so the number has to move
-- in all of them together. A drawn stall is the reason this is a migration and
-- not just an edit to registeredExhibitors.ts: getStallForExhibitor() looks a
-- firm up by the numbers the guest list gives them, so a row left behind on
-- 9099140404 would be invisible under the new number. /api/lottery/status
-- would report "not drawn", the portal would offer the Lucky Box again, and
-- neither unique index would stop the second draw - uq_lottery_allocations_firm
-- is keyed on the old firm_mobile, and a fresh draw picks a different stall.
-- The firm would end up holding two.
--
-- Idempotent, and safe to run against a database where the firm never drew:
-- every step moves rows that are there and does nothing where they are not.
-- Each step is also guarded against a row already standing under the new
-- number - mobile is UNIQUE in every one of these tables, so a blind UPDATE
-- would abort the migration rather than skip the row.

BEGIN;

-- 1. The draw. Both columns: `mobile` is the number that drew, `firm_mobile`
--    is the firm the unique index holds to one stall (migration
--    20260828000008), and canonicalMobile() now maps this firm to the new
--    number, so the index has to agree.
UPDATE lottery_allocations
   SET mobile = '9825398582',
       firm_mobile = '9825398582'
 WHERE mobile = '9099140404'
   AND NOT EXISTS (
     SELECT 1 FROM lottery_allocations x WHERE x.mobile = '9825398582'
   );

-- A row that drew under some other number but was filed to this firm.
UPDATE lottery_allocations
   SET firm_mobile = '9825398582'
 WHERE firm_mobile = '9099140404';

-- 2. Draws set aside by 20260828000007 / 20260828000008. No unique index here,
--    so these move unconditionally - they are a record of what happened and
--    should read under the number the firm now answers to.
UPDATE lottery_allocation_conflicts
   SET mobile = '9825398582'
 WHERE mobile = '9099140404';

-- 3. The profile, which carries the brand, the fascia names, the uploaded
--    artwork and the copy of the stall written by migration 20260827000006.
UPDATE exhibitors
   SET mobile = '9825398582'
 WHERE mobile = '9099140404'
   AND NOT EXISTS (
     SELECT 1 FROM exhibitors x WHERE x.mobile = '9825398582'
   );

-- 4. The extras order.
UPDATE exhibitor_orders
   SET mobile = '9825398582'
 WHERE mobile = '9099140404'
   AND NOT EXISTS (
     SELECT 1 FROM exhibitor_orders x WHERE x.mobile = '9825398582'
   );

-- 5. Uploaded assets. Unique on (mobile, category), so a category the firm has
--    already filled under the new number keeps what is there.
UPDATE public.exhibitor_assets a
   SET mobile = '9825398582'
 WHERE a.mobile = '9099140404'
   AND NOT EXISTS (
     SELECT 1 FROM public.exhibitor_assets x
      WHERE x.mobile = '9825398582' AND x.category = a.category
   );

-- 6. The guest list. registeredExhibitors.ts is what the portal actually
--    admits people on; this table is the copy the sheet webhook writes, and it
--    is what would let the retired number back in.
UPDATE allowed_exhibitors
   SET mobile = '9825398582'
 WHERE mobile = '9099140404'
   AND NOT EXISTS (
     SELECT 1 FROM allowed_exhibitors x WHERE x.mobile = '9825398582'
   );

DELETE FROM allowed_exhibitors WHERE mobile = '9099140404';

COMMIT;
