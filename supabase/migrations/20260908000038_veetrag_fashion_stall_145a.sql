-- Surat Textile Expo 2026 - Veetrag Fashion confirmed on stall 145A
-- Migration: 20260908000038_veetrag_fashion_stall_145a.sql
--
-- Stall 145A (3m x 3m, South Hall, 100 sq ft) was marked EMPTY in the
-- 5 Sep 2026 final roster (ste_final_stall_numbers.xlsx). The organisers
-- confirmed the firm Veetrag Fashion with mobile number 9377666809 on 8 Sep 2026.
--
-- The mobile is added in src/data/stallAllotment2026.ts, src/data/stallMap2026.ts,
-- and src/data/registeredExhibitors.ts; this migration inserts the number into
-- allowed_exhibitors to open portal access.
--
-- Idempotent: the insert does nothing where the number already stands.

BEGIN;

INSERT INTO allowed_exhibitors (mobile, notes)
VALUES ('9377666809', 'Veetrag Fashion (100 sq ft)')
ON CONFLICT (mobile) DO UPDATE SET notes = EXCLUDED.notes;

COMMIT;
