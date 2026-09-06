-- Surat Textile Expo 2026 - update mannequin rate (1500 for 2 days = 750/day) and add rack (1500/day)
-- Migration: 20260906000033_extras_mannequin_rate_and_rack.sql
--
-- Mannequin rate adjusted to Rs 750 per day (Rs 1,500 for the 2-day expo).
-- 5-tier aluminium display rack added to Display & AV at Rs 1,500 per day.

UPDATE public.extra_products
   SET rate_inr = 750,
       description = 'Full-body garment display mannequin (₹1,500 for 2 days)'
 WHERE id = 'mannequin';

INSERT INTO public.extra_products
  (id, name, category, description, rate_inr, unit, icon_name, is_active)
VALUES
  ('rack', 'Rack', 'Display & AV',
   '5-tier aluminium display rack', 1500, 'per-day', 'layers', 1)
ON CONFLICT (id) DO UPDATE SET
  name        = EXCLUDED.name,
  category    = EXCLUDED.category,
  description = EXCLUDED.description,
  rate_inr    = EXCLUDED.rate_inr,
  unit        = EXCLUDED.unit,
  icon_name   = EXCLUDED.icon_name,
  is_active   = EXCLUDED.is_active;
