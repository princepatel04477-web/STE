-- Surat Textile Expo 2026 - mannequin added to the extras catalogue
-- Migration: 20260903000020_extras_mannequin.sql
--
-- A full-body garment display mannequin, hired by the day at Rs 1,500
-- exclusive of GST (organisers, 3 Sep 2026). Sarees and lehengas show on a
-- form far better than on a hanger, so it sits with the garment stand in
-- Display & AV rather than with the furniture.
--
-- rate_inr is the pre-tax rate, as it is for every other row here: the 18% is
-- added once, on the order subtotal, by GST_RATE in src/data/extras-rates.ts.
-- Putting 1770 in this column would tax the exhibitor twice.
--
-- The catalogue is kept in three places that have to agree, because each is
-- read on a different path:
--   * this table                     - what the exhibitor dashboard offers
--   * defaultProducts in src/lib/db.ts - the same list for a dev machine with
--                                        no Supabase to read
--   * EXTRAS_RATES in src/data/extras-rates.ts - the published rate card and
--                                        the estimate builder
-- The other two are in the same commit as this file.
--
-- No image ships with it. getProductImage() answers with the desk table for a
-- key it does not know, so the rate card row carries image: null and shows the
-- name alone - an exhibitor booking a mannequin should not be shown a desk.
--
-- Idempotent: rerunning this leaves the rate and the wording as written here,
-- so applying it twice cannot leave a stale rate behind.

INSERT INTO public.extra_products
  (id, name, category, description, rate_inr, unit, icon_name, is_active)
VALUES
  ('mannequin', 'Mannequin', 'Display & AV',
   'Full-body garment display mannequin', 1500, 'per-day', 'shirt', 1)
ON CONFLICT (id) DO UPDATE SET
  name        = EXCLUDED.name,
  category    = EXCLUDED.category,
  description = EXCLUDED.description,
  rate_inr    = EXCLUDED.rate_inr,
  unit        = EXCLUDED.unit,
  icon_name   = EXCLUDED.icon_name,
  is_active   = EXCLUDED.is_active;
