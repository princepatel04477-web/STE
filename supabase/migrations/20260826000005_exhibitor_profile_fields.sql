-- Surat Textile Expo 2026 - Exhibitor Profile Picture, Name, and Company Description Migration
-- Migration: 20260826000005_exhibitor_profile_fields.sql

ALTER TABLE public.exhibitors
  ADD COLUMN IF NOT EXISTS exhibitor_name TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS profile_pic_url TEXT,
  ADD COLUMN IF NOT EXISTS company_description TEXT DEFAULT '';

COMMENT ON COLUMN public.exhibitors.exhibitor_name IS
  'Full contact name of the exhibitor / company representative (compulsory).';

COMMENT ON COLUMN public.exhibitors.profile_pic_url IS
  'Public URL of the exhibitor representative profile picture in Supabase Storage.';

COMMENT ON COLUMN public.exhibitors.company_description IS
  'Brief paragraph about the exhibiting company (maximum 400 characters).';
