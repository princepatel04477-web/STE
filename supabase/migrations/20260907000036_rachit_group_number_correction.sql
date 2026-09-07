-- Surat Textile Expo 2026 - Rachit Group registered mobile number corrected to 9825146981
-- Migration: 20260907000036_rachit_group_number_correction.sql
--
-- Rachit Group (stall 83, 600 sq ft, Saree) was originally listed under 9852146981
-- due to a digit transposition typo (52 vs 25) on the master sheet. The firm's
-- genuine and sole registered number is 9825146981.
--
-- This migration consolidates everything onto 9825146981:
-- 1. Whitelists 9825146981 in allowed_exhibitors and removes 9852146981.
-- 2. Copies stall details and lock status from 9852146981 onto 9825146981 in exhibitors.
-- 3. Removes the duplicate exhibitor row 9852146981 (archiving to exhibitor_alias_merge_archive).
-- 4. Cleans up duplicate order under 9852146981 (the identical order exists under 9825146981).
-- 5. Reassigns any assets, allocations, or conflict records.

BEGIN;

-- 1. Whitelist 9825146981 and remove typo 9852146981
INSERT INTO allowed_exhibitors (mobile, notes)
VALUES ('9825146981', 'Rachit Group (600 sq ft)')
ON CONFLICT (mobile) DO UPDATE SET notes = EXCLUDED.notes;

DELETE FROM allowed_exhibitors WHERE mobile = '9852146981';

-- 2. Consolidate exhibitors profile row
-- If 9825146981 exists, bring over any populated stall columns from 9852146981
UPDATE exhibitors e
   SET stall_hall = COALESCE(NULLIF(e.stall_hall, ''), o.stall_hall),
       stall_zone = COALESCE(NULLIF(e.stall_zone, ''), o.stall_zone),
       stall_dimensions = COALESCE(NULLIF(e.stall_dimensions, ''), o.stall_dimensions),
       stall_allocated_at = COALESCE(e.stall_allocated_at, o.stall_allocated_at),
       requirements_locked = COALESCE(o.requirements_locked, e.requirements_locked)
  FROM exhibitors o
 WHERE e.mobile = '9825146981'
   AND o.mobile = '9852146981';

-- If 9825146981 didn't exist at all, update 9852146981 in place
UPDATE exhibitors
   SET mobile = '9825146981'
 WHERE mobile = '9852146981'
   AND NOT EXISTS (SELECT 1 FROM exhibitors x WHERE x.mobile = '9825146981');

-- Archive and delete old row if both existed
INSERT INTO public.exhibitor_alias_merge_archive (
  source_mobile, folded_into, brand_name, stall_sqft, fascia_names_json,
  logo_file_url, cdr_file_url, drive_file_url, drive_folder_id,
  drive_folder_url, drive_folder_name, exhibitor_name, profile_pic_url,
  company_description, stall_number, stall_hall, stall_zone, stall_dimensions,
  stall_allocated_at, requirements_locked
)
SELECT mobile, '9825146981', brand_name, stall_sqft, fascia_names_json,
       logo_file_url, cdr_file_url, drive_file_url, drive_folder_id,
       drive_folder_url, drive_folder_name, exhibitor_name, profile_pic_url,
       company_description, stall_number, stall_hall, stall_zone, stall_dimensions,
       stall_allocated_at, requirements_locked
  FROM exhibitors
 WHERE mobile = '9852146981'
ON CONFLICT DO NOTHING;

DELETE FROM exhibitors WHERE mobile = '9852146981';

-- 3. Extras order
-- If 9825146981 already has order, remove duplicate on 9852146981
DELETE FROM exhibitor_orders
 WHERE mobile = '9852146981'
   AND EXISTS (SELECT 1 FROM exhibitor_orders x WHERE x.mobile = '9825146981');

UPDATE exhibitor_orders
   SET mobile = '9825146981'
 WHERE mobile = '9852146981';

-- 4. Assets
UPDATE public.exhibitor_assets a
   SET mobile = '9825146981'
 WHERE a.mobile = '9852146981'
   AND NOT EXISTS (
     SELECT 1 FROM public.exhibitor_assets x
      WHERE x.mobile = '9825146981' AND x.category = a.category
   );

DELETE FROM public.exhibitor_assets WHERE mobile = '9852146981';

-- 5. Lottery allocation conflicts
UPDATE lottery_allocation_conflicts
   SET mobile = '9825146981'
 WHERE mobile = '9852146981';

-- 6. Lottery allocations (stall 83 already under 9825146981)
DELETE FROM lottery_allocations WHERE mobile = '9852146981';

COMMIT;
