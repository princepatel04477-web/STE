-- Surat Textile Expo 2026 Supabase Storage Migration
-- Migration: 20260825000002_storage_bucket.sql

-- Create the storage bucket for exhibitor assets (Logos, CDR files, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'exhibitor-assets',
  'exhibitor-assets',
  true,
  52428800, -- 50MB file size limit
  ARRAY[
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/svg+xml',
    'image/webp',
    'application/pdf',
    'application/postscript',
    'application/illustrator',
    'application/x-cdr',
    'application/cdr',
    'application/coreldraw',
    'image/x-coreldraw',
    'application/octet-stream'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800;

-- Storage Policy: Allow public read access to exhibitor assets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Access to Exhibitor Assets'
  ) THEN
    CREATE POLICY "Public Access to Exhibitor Assets"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'exhibitor-assets');
  END IF;
END $$;

-- Storage Policy: Allow service role and authenticated uploads
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow Upload to Exhibitor Assets'
  ) THEN
    CREATE POLICY "Allow Upload to Exhibitor Assets"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'exhibitor-assets');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow Update to Exhibitor Assets'
  ) THEN
    CREATE POLICY "Allow Update to Exhibitor Assets"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'exhibitor-assets');
  END IF;
END $$;
