-- Surat Textile Expo 2026 - one stall, one exhibitor, one draw
-- Migration: 20260828000007_lottery_single_draw.sql
--
-- lottery_allocations already keeps a firm to one row (mobile is UNIQUE), but
-- nothing stopped two firms being seated on the SAME stall: the draw read the
-- taken list, picked a free stall and wrote it, and two draws running in the
-- same second both read the same list. The exhibitor then saw their stall
-- number move as whichever row came back first from the database changed.
--
-- The unique index below makes the database the arbiter. The second firm to
-- reach for a stall is refused at write time and the draw route redraws them,
-- so a stall can never be handed out twice.
--
-- Existing double-allotments have to be cleared before the index can exist.
-- The earliest draw on each stall is the one that stands - a drawn number is
-- final - and every later one is copied into lottery_allocation_conflicts
-- before it is removed, so nothing is lost and those firms can be redrawn
-- from the admin control room.

-- 1. Somewhere to keep the draws being undone, so this is reversible.
CREATE TABLE IF NOT EXISTS lottery_allocation_conflicts (
  id BIGSERIAL PRIMARY KEY,
  mobile VARCHAR(20) NOT NULL,
  brand_name TEXT NOT NULL,
  stall_sqft VARCHAR(50) NOT NULL,
  stall_number VARCHAR(50) NOT NULL,
  is_corner INTEGER NOT NULL DEFAULT 0,
  shape VARCHAR(50) NOT NULL DEFAULT 'Linear',
  hall TEXT NOT NULL,
  zone TEXT NOT NULL,
  dimensions TEXT NOT NULL,
  slip_id VARCHAR(100) NOT NULL,
  allocated_at TIMESTAMPTZ,
  quarantined_at TIMESTAMPTZ DEFAULT NOW(),
  reason TEXT
);

COMMENT ON TABLE lottery_allocation_conflicts IS
  'Draws set aside because the stall was already held by an earlier draw. '
  'Nothing reads this table; it exists so a wrongly-seated firm can be found '
  'and redrawn. To put one back, delete the row that now holds the stall and '
  'INSERT ... SELECT the columns below into lottery_allocations.';

-- 2. Set aside every draw that landed on a stall an earlier draw already held.
WITH ranked AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY upper(btrim(stall_number))
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
  'stall ' || a.stall_number || ' was already held by an earlier draw'
FROM lottery_allocations a
JOIN ranked r ON r.id = a.id
WHERE r.seat > 1;

WITH ranked AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY upper(btrim(stall_number))
      ORDER BY allocated_at NULLS LAST, id
    ) AS seat
  FROM lottery_allocations
)
DELETE FROM lottery_allocations
WHERE id IN (SELECT id FROM ranked WHERE seat > 1);

-- 3. A stall belongs to exactly one exhibitor, from here on enforced.
--    Matched the way the draw compares stall numbers: trimmed, case-folded,
--    so "91a" and "91A" are the same bay.
CREATE UNIQUE INDEX IF NOT EXISTS uq_lottery_allocations_stall
  ON lottery_allocations (upper(btrim(stall_number)));

-- 4. The profile copy of a stall that has just been withdrawn is no longer
--    true, so it goes with it. Only firms whose stall was quarantined above
--    are touched, and only where the surviving draw is not theirs. Clearing
--    one copy too many is harmless - resolveAndRecordStall() writes it back
--    the next time that exhibitor is looked up - whereas leaving a stale copy
--    keeps showing a firm a stall that is no longer theirs.
UPDATE exhibitors e
SET stall_number = '', stall_hall = '', stall_zone = '',
    stall_dimensions = '', stall_allocated_at = NULL
WHERE e.stall_number <> ''
  AND EXISTS (
    SELECT 1 FROM lottery_allocation_conflicts c
    WHERE upper(btrim(c.stall_number)) = upper(btrim(e.stall_number))
  )
  AND NOT EXISTS (
    SELECT 1 FROM lottery_allocations a
    WHERE upper(btrim(a.stall_number)) = upper(btrim(e.stall_number))
      AND a.mobile = e.mobile
  );
