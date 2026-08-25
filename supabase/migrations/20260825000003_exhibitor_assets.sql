-- Surat Textile Expo 2026 - Exhibitor asset ledger
-- Migration: 20260825000003_exhibitor_assets.sql
--
-- Records every brand asset an exhibitor uploads through the portal, together
-- with the outcome of mirroring it into Google Drive. Supabase Storage is the
-- source of truth; Drive is a mirror. Keeping the sync state here means a Drive
-- outage degrades to "pending" instead of silently losing the file.

CREATE TABLE IF NOT EXISTS public.exhibitor_assets (
  id                   BIGSERIAL PRIMARY KEY,
  mobile               TEXT NOT NULL,
  brand_name           TEXT NOT NULL DEFAULT 'Exhibitor',

  -- 'logo' -> .png/.jpg/.jpeg, 'cdr' -> .cdr vector artwork
  category             TEXT NOT NULL CHECK (category IN ('logo', 'cdr')),

  original_file_name   TEXT NOT NULL,
  -- Deterministic name used in both stores, e.g. "Apple Lifestyle - Logo.png"
  asset_file_name      TEXT NOT NULL,
  mime_type            TEXT,
  file_size            BIGINT,

  -- Supabase Storage (primary)
  storage_path         TEXT,
  storage_url          TEXT,

  -- Google Drive mirror: STE Logos/<brand_name>/<asset_file_name>
  drive_folder_id      TEXT,
  drive_folder_url     TEXT,
  drive_file_id        TEXT,
  drive_file_url       TEXT,
  drive_sync_status    TEXT NOT NULL DEFAULT 'pending'
                       CHECK (drive_sync_status IN ('pending', 'synced', 'failed')),
  drive_sync_strategy  TEXT,
  drive_sync_error     TEXT,
  drive_sync_attempts  INTEGER NOT NULL DEFAULT 0,
  drive_synced_at      TIMESTAMPTZ,

  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One current logo and one current artwork per exhibitor. Re-uploading a
-- category replaces the row, mirroring the replace-in-place behaviour in Drive
-- and keeping every exhibitor folder identically shaped.
CREATE UNIQUE INDEX IF NOT EXISTS exhibitor_assets_mobile_category_idx
  ON public.exhibitor_assets (mobile, category);

-- Drives the retry sweep in scripts/retry-drive-sync.ts
CREATE INDEX IF NOT EXISTS exhibitor_assets_sync_status_idx
  ON public.exhibitor_assets (drive_sync_status)
  WHERE drive_sync_status <> 'synced';

CREATE INDEX IF NOT EXISTS exhibitor_assets_brand_idx
  ON public.exhibitor_assets (brand_name);

-- Keep updated_at honest without relying on every caller remembering it.
CREATE OR REPLACE FUNCTION public.touch_exhibitor_assets_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS exhibitor_assets_set_updated_at ON public.exhibitor_assets;
CREATE TRIGGER exhibitor_assets_set_updated_at
  BEFORE UPDATE ON public.exhibitor_assets
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_exhibitor_assets_updated_at();

-- RLS on with no policies: the service role (used by the Next.js API routes)
-- bypasses RLS, while the public anon key gets no access at all. Exhibitor
-- contact details must never be readable from the browser.
ALTER TABLE public.exhibitor_assets ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.exhibitor_assets IS
  'Brand assets uploaded via the exhibitor portal, with Google Drive mirror status.';
