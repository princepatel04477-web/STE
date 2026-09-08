-- Surat Textile Expo 2026 - Jai Shree Krishna confirmed on stall 136A
-- Migration: 20260908000037_jai_shree_krishna_stall_136a.sql
--
-- Stall 136A (3m x 3m, South Hall, 100 sq ft) was added to the floor in the
-- 5 Sep 2026 final roster under brand "Jai Shree Krishna" without a mobile number,
-- leaving it unresolved and without portal access. The organisers confirmed the
-- firm's mobile number, 9377790132, on 8 Sep 2026.
--
-- The mobile is added in src/data/stallAllotment2026.ts and src/data/registeredExhibitors.ts,
-- and this migration inserts the number into allowed_exhibitors to open portal access.
--
-- Idempotent: the insert does nothing where the number already stands.

BEGIN;

INSERT INTO allowed_exhibitors (mobile, notes)
VALUES ('9377790132', 'Jai Shree Krishna (100 sq ft)')
ON CONFLICT (mobile) DO UPDATE SET notes = EXCLUDED.notes;

COMMIT;
