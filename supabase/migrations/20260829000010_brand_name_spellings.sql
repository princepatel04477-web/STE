-- Surat Textile Expo 2026 - firms spelled the way they spell themselves
-- Migration: 20260829000010_brand_name_spellings.sql
--
-- The master sheet carries three names the firms do not use themselves. The
-- code side is fixed in registeredExhibitors.ts and stallAllotment2026.ts, and
-- BRAND_CORRECTIONS in scripts/number_stalls.py keeps a regeneration from
-- putting the sheet's spellings back. This is the rows already written.
--
-- It matters because brand_name is not decoration: /api/lottery/status and
-- /api/lottery/draw both read the exhibitor's own profile row ahead of the
-- master list, so an uncorrected row is the name that reaches the dashboard,
-- the allotment slip and the invoice. lottery_allocations.brand_name is the
-- name printed on the slip itself.
--
--   Aalingan Art (Nidhidham) -> Aalingan Art / Nidhanam   (organisers, 29 Aug)
--   Jyotsana                 -> Jyotsna                   (organisers, 28 Aug)
--   Vani NX                  -> Vaani NX                  (organisers, 28 Aug)
--
-- Matched on the old spelling rather than on a mobile, so this touches only
-- rows still carrying it and is safe to run more than once. "Vani Designer" is
-- a different firm on stall 76 and is deliberately not matched.
--
-- Nothing here moves a stall: only the name against it changes.

BEGIN;

UPDATE exhibitors SET brand_name = 'Aalingan Art / Nidhanam'
 WHERE brand_name = 'Aalingan Art (Nidhidham)';

UPDATE exhibitors SET brand_name = 'Jyotsna'
 WHERE brand_name = 'Jyotsana';

UPDATE exhibitors SET brand_name = 'Vaani NX'
 WHERE brand_name = 'Vani NX';

UPDATE lottery_allocations SET brand_name = 'Aalingan Art / Nidhanam'
 WHERE brand_name = 'Aalingan Art (Nidhidham)';

UPDATE lottery_allocations SET brand_name = 'Jyotsna'
 WHERE brand_name = 'Jyotsana';

UPDATE lottery_allocations SET brand_name = 'Vaani NX'
 WHERE brand_name = 'Vani NX';

UPDATE lottery_allocation_conflicts SET brand_name = 'Aalingan Art / Nidhanam'
 WHERE brand_name = 'Aalingan Art (Nidhidham)';

UPDATE lottery_allocation_conflicts SET brand_name = 'Jyotsna'
 WHERE brand_name = 'Jyotsana';

UPDATE lottery_allocation_conflicts SET brand_name = 'Vaani NX'
 WHERE brand_name = 'Vani NX';

COMMIT;
