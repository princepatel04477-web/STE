-- Surat Textile Expo 2026 - receptionist added to the extras catalogue
-- Migration: 20260903000021_extras_receptionist.sql

INSERT INTO public.extra_products
  (id, name, category, description, rate_inr, unit, icon_name, is_active)
VALUES
  ('receptionist', 'Receptionist', 'Display & AV',
   'Professional stall receptionist / hostess', 1000, 'per-day', 'user', 1)
ON CONFLICT (id) DO UPDATE SET
  name        = EXCLUDED.name,
  category    = EXCLUDED.category,
  description = EXCLUDED.description,
  rate_inr    = EXCLUDED.rate_inr,
  unit        = EXCLUDED.unit,
  icon_name   = EXCLUDED.icon_name,
  is_active   = EXCLUDED.is_active;
