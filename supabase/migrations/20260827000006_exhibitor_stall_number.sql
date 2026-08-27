-- Surat Textile Expo 2026 - the allotted stall, written onto the exhibitor
-- Migration: 20260827000006_exhibitor_stall_number.sql
--
-- lottery_allocations stays the record of the draw itself. These columns are
-- the copy every other view reads - the dashboard, the admin sheet, the
-- invoice - so an exhibitor's stall number travels with their profile rather
-- than needing a join. recordStallAllocation() in src/lib/stallAssignment.ts
-- is the only writer.

ALTER TABLE public.exhibitors
  ADD COLUMN IF NOT EXISTS stall_number TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS stall_hall TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS stall_zone TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS stall_dimensions TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS stall_allocated_at TIMESTAMPTZ;

COMMENT ON COLUMN public.exhibitors.stall_number IS
  'The stall the exhibitor was allotted, e.g. "76" or "91A". Empty until drawn.';

COMMENT ON COLUMN public.exhibitors.stall_allocated_at IS
  'When the draw seated them. Set together with stall_number, never alone.';

CREATE INDEX IF NOT EXISTS idx_exhibitors_stall_number
  ON public.exhibitors(stall_number);
