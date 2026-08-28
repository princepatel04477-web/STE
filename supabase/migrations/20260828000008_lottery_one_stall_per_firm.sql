-- Surat Textile Expo 2026 - one firm, one stall
-- Migration: 20260828000008_lottery_one_stall_per_firm.sql
--
-- 20260828000007 stopped two firms landing on one stall. This stops one firm
-- taking two stalls.
--
-- A firm can be registered under more than one number (registeredExhibitors
-- carries them as `aliases`), and the draw's own check already looks under
-- every number a firm answers to. But that check reads before it writes, so
-- two people from the same firm drawing at the same moment - one on each of
-- their numbers - both read "no stall yet" and both go on to draw. Neither
-- write conflicts: `mobile` is unique per number and they used different
-- numbers, `stall_number` is unique per stall and they drew different stalls.
-- The firm ends up holding two.
--
-- The floor plan has no column that says which firm a row belongs to, so the
-- database could not see the pair as one exhibitor. firm_mobile is that
-- column: the number the master sheet files the firm under, unique, so the
-- second number is refused at write time and the draw hands back the stall
-- the firm already holds.

-- 1. The firm this row belongs to.
ALTER TABLE lottery_allocations
  ADD COLUMN IF NOT EXISTS firm_mobile VARCHAR(20);

COMMENT ON COLUMN lottery_allocations.firm_mobile IS
  'The master-sheet number for the firm, which is the mobile itself unless '
  'that mobile is one of its aliases. Unique: one firm holds one stall. '
  'canonicalMobile() in src/data/registeredExhibitors.ts is the same mapping.';

-- 2. Most firms answer to one number, so that number is the firm.
UPDATE lottery_allocations SET firm_mobile = mobile WHERE firm_mobile IS NULL;

-- 3. The second numbers, folded onto the number the master sheet carries.
--    Kept in step with the `aliases` entries in registeredExhibitors.ts - a
--    new alias added there wants a line here only if that number has drawn.
UPDATE lottery_allocations a SET firm_mobile = v.canonical
FROM (VALUES
  ('8980018808', '8980018801'),
  ('7405045216', '9978889174'),
  ('9904566650', '8866666650'),
  ('9327665182', '9426923797'),
  ('9825363099', '9825363009'),
  ('9275114989', '9737762086'),
  ('9825146981', '9852146981'),
  ('7818968985', '9825572748'),
  ('9825900000', '9825122634'),
  ('8619183572', '7600710440'),
  ('8804754940', '7874363994'),
  ('7487991497', '7487991498'),
  ('9978912068', '9081277726'),
  ('9687609749', '7405442380'),
  ('8511573752', '9662399969')
) AS v(alias, canonical)
WHERE a.mobile = v.alias;

-- 4. Any firm already holding two stalls keeps the earliest draw, and the
--    later one is set aside the way 20260828000007 sets aside a double-booked
--    stall - nothing is lost, and that firm can be redrawn. On the data this
--    was written against there are none; the step is here so a re-run and a
--    restore both behave.
WITH ranked AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY firm_mobile
      ORDER BY allocated_at NULLS LAST, id
    ) AS seat
  FROM lottery_allocations
)
INSERT INTO lottery_allocation_conflicts (
  mobile, brand_name, stall_sqft, stall_number, is_corner, shape,
  hall, zone, dimensions, slip_id, allocated_at, reason
)
SELECT
  a.mobile, a.brand_name, a.stall_sqft, a.stall_number, a.is_corner, a.shape,
  a.hall, a.zone, a.dimensions, a.slip_id, a.allocated_at,
  'firm ' || a.firm_mobile || ' had already drawn under another of its numbers'
FROM lottery_allocations a
JOIN ranked r ON r.id = a.id
WHERE r.seat > 1;

WITH ranked AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY firm_mobile
      ORDER BY allocated_at NULLS LAST, id
    ) AS seat
  FROM lottery_allocations
)
DELETE FROM lottery_allocations
WHERE id IN (SELECT id FROM ranked WHERE seat > 1);

-- 5. Enforced from here on. NOT NULL rather than nullable, because Postgres
--    lets unique indexes hold any number of NULLs - a writer that forgot the
--    column would slip straight past the guarantee instead of failing.
ALTER TABLE lottery_allocations
  ALTER COLUMN firm_mobile SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_lottery_allocations_firm
  ON lottery_allocations (firm_mobile);
