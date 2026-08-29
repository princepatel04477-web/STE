-- Surat Textile Expo 2026 - Several brand files per exhibitor
-- Migration: 20260829000011_exhibitor_multiple_assets.sql
--
-- The ledger allowed exactly one logo and one artwork file per exhibitor: the
-- unique index on (mobile, category) meant a second upload silently replaced
-- the first, both here and in Drive. Exhibitors legitimately have several -
-- a logo per sub-brand, front and side fascia artwork - so a category now
-- holds a numbered set of slots instead of a single file.

ALTER TABLE public.exhibitor_assets
  ADD COLUMN IF NOT EXISTS slot INTEGER NOT NULL DEFAULT 1;

-- Everything uploaded before this migration is that exhibitor's slot 1.
UPDATE public.exhibitor_assets SET slot = 1 WHERE slot IS NULL OR slot < 1;

ALTER TABLE public.exhibitor_assets
  DROP CONSTRAINT IF EXISTS exhibitor_assets_slot_positive;
ALTER TABLE public.exhibitor_assets
  ADD CONSTRAINT exhibitor_assets_slot_positive CHECK (slot >= 1);

-- One file per slot. Re-uploading into an occupied slot still replaces in
-- place, which is what keeps the Drive folder and the bucket identical.
DROP INDEX IF EXISTS public.exhibitor_assets_mobile_category_idx;

CREATE UNIQUE INDEX IF NOT EXISTS exhibitor_assets_mobile_category_slot_idx
  ON public.exhibitor_assets (mobile, category, slot);

-- The portal lists an exhibitor's files on every dashboard load.
CREATE INDEX IF NOT EXISTS exhibitor_assets_mobile_idx
  ON public.exhibitor_assets (mobile);

COMMENT ON COLUMN public.exhibitor_assets.slot IS
  '1-based position within this exhibitor''s files of the same category; slot 1 keeps the unnumbered file name.';
