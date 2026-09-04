-- Surat Textile Expo 2026 - Give the profile fields their own columns
-- Migration: 20260904000027_exhibitor_profile_columns.sql
--
-- The exhibitor's name, company description, GSTIN and profile photo were
-- written only into fascia_names_json. That one JSONB value was therefore the
-- single copy of all four, and every route that rebuilt it rewrote the whole
-- object: any writer that did not know about a field erased it. The upload
-- route did exactly that, dropping gstin and profile_pic_url on every logo
-- upload, and the Google Sheets webhook replaced the object with a bare array.
--
-- Columns already existed for three of them (migration 20260826000005) but
-- nothing ever wrote to them - all 171 rows had them empty. gstin never had a
-- column at all. This adds the missing one and backfills all four out of the
-- payload, so the JSON becomes a copy rather than the record.

ALTER TABLE public.exhibitors
  ADD COLUMN IF NOT EXISTS gstin TEXT DEFAULT '';

COMMENT ON COLUMN public.exhibitors.gstin IS
  'The exhibitor''s own GSTIN, which their extras invoice is raised against. Theirs, not the event''s.';

-- Backfill from the structured payload, where it survives. Only fills a column
-- that is empty, so a value written since is never overwritten, and only reads
-- object-shaped payloads - a bare array carries none of these fields.
UPDATE public.exhibitors
SET
  exhibitor_name = COALESCE(
    NULLIF(exhibitor_name, ''),
    NULLIF(fascia_names_json ->> 'exhibitor_name', ''),
    ''
  ),
  company_description = COALESCE(
    NULLIF(company_description, ''),
    NULLIF(fascia_names_json ->> 'company_description', ''),
    ''
  ),
  gstin = COALESCE(
    NULLIF(gstin, ''),
    NULLIF(fascia_names_json ->> 'gstin', ''),
    ''
  ),
  profile_pic_url = COALESCE(
    NULLIF(profile_pic_url, ''),
    NULLIF(fascia_names_json ->> 'profile_pic_url', '')
  )
WHERE jsonb_typeof(fascia_names_json) = 'object';

-- The admin console chases exhibitors who ordered extras without a usable
-- GSTIN, and reads the column to do it.
CREATE INDEX IF NOT EXISTS idx_exhibitors_gstin
  ON public.exhibitors (gstin)
  WHERE gstin <> '';
