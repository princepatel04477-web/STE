-- Surat Textile Expo 2026 - Stable per-exhibitor Drive folder names
-- Migration: 20260825000004_exhibitor_drive_folder_name.sql
--
-- Drive folders are named after the exhibitor's brand ("Apple Lifestyle").
-- Four brand names in the current roster are shared by two different
-- exhibitors (e.g. "Durga Sarees" is used by 7405045216 and 9978889174), so a
-- naive brand-name folder would let one exhibitor overwrite the other's logo.
--
-- The first exhibitor to upload claims the clean name; any later exhibitor
-- with the same brand gets "Durga Sarees (9978889174)". Persisting the choice
-- keeps the folder stable even if brand_name is edited later.

ALTER TABLE public.exhibitors
  ADD COLUMN IF NOT EXISTS drive_folder_name TEXT;

-- Two exhibitors must never resolve to the same Drive folder.
CREATE UNIQUE INDEX IF NOT EXISTS exhibitors_drive_folder_name_idx
  ON public.exhibitors (drive_folder_name)
  WHERE drive_folder_name IS NOT NULL;

COMMENT ON COLUMN public.exhibitors.drive_folder_name IS
  'Claimed Google Drive subfolder name under the STE Logos parent folder.';
