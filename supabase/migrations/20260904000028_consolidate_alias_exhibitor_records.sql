-- Surat Textile Expo 2026 - fold each firm's alias records onto its one row
-- Migration: 20260904000028_consolidate_alias_exhibitor_records.sql
--
-- 20260903000024 folded the drawn *stalls* back onto each firm's canonical
-- number and deliberately left the alias profile alone, "it may carry uploaded
-- documents". Those documents - and rather more besides - are exactly the
-- problem: the portal folds every login onto the canonical number
-- (canonicalMobile, src/app/api/auth/login/route.ts) and then reads
-- `exhibitors WHERE mobile = <canonical>`. Anything sitting under an alias is
-- invisible to the exhibitor who typed it in, however complete it is.
--
-- Audited against the live database on 4 Sep 2026: 15 of the 16 firms with a
-- second number have real work stranded on it. The worst of them see a portal
-- with nothing in it at all:
--
--   Brand                      Canonical row holds        Alias row holds
--   Laxmi Creation             nothing                    everything + stall 63
--   Shubh Saachi/Shiv Ganges   nothing                    everything + stall 32
--   Rachit Group               a photo                    everything + order + stall 71
--   Shiv Vardhaan              a fascia name              everything + stall 18
--   Tithi Designer             a photo                    everything + stall 1
--   Shankh Designer            profile, no files          the artwork + stall 93
--   NS Fashion                 stall 138                  a fascia name
--   Shritik Designer           profile + order            a fascia name + stall 80
--   Amaya, Heirlooms, Kairadhya, Raghav Silk Mills, Satish Dresses,
--   Shreya Silk Sarees, Sweety Fashion - partial on both sides
--
-- Rachit Group is the clearest case of how it happened. Commit 8945d8b
-- (27 Aug 21:15) briefly made 9825146981 that firm's canonical number;
-- 9575394, two hours later, put 9852146981 back and listed the other as an
-- alias. Rachit Group filled the portal in on 30 Aug, in that window, so all
-- of it landed on what is now their alias row.
--
-- The merge rule is the one the admin console already applies when it folds
-- these same records for the organiser view (foldOntoSheet in
-- src/app/api/admin/exhibitors/route.ts): "The sheet's own number wins; an
-- alias only fills what it leaves empty." Nothing already on the canonical row
-- is overwritten.
--
-- Every alias row is copied into exhibitor_alias_merge_archive before it is
-- touched, so this is reversible from inside the database.
--
-- Order matters here. The alias row is snapshotted and then deleted *before*
-- anything is written to the canonical row, because drive_folder_name carries
-- a unique index (20260825000004) - copying the alias's claim onto the
-- canonical row while the alias still held it violated that index.
--
-- Runs after 20260903000024, which clears the stall copy off the alias
-- profiles, so the stall columns merged here are only ever the canonical row's
-- own. Re-running is a no-op: the alias rows are gone.

BEGIN;

-- ---------------------------------------------------------------------------
-- The pairs, kept in step with `aliases` in src/data/registeredExhibitors.ts.
-- ---------------------------------------------------------------------------
CREATE TEMP TABLE alias_pairs (alias TEXT PRIMARY KEY, canonical TEXT NOT NULL) ON COMMIT DROP;

INSERT INTO alias_pairs (alias, canonical) VALUES
  ('8980018808', '8980018801'),  -- Amaya
  ('7405045216', '9978889174'),  -- Durga Textiles / Durga Silk Mills
  ('9904566650', '8866666650'),  -- Heirlooms
  ('9327665182', '9426923797'),  -- Kairadhya
  ('9825363099', '9825363009'),  -- Laxmi Creation
  ('9275114989', '9737762086'),  -- NS Fashion
  ('9825146981', '9852146981'),  -- Rachit Group
  ('7818968985', '9825572748'),  -- Raghav Silk Mills
  ('9825900000', '9825122634'),  -- Satish Dresses
  ('8619183572', '7600710440'),  -- Shankh Designer
  ('8804754940', '7874363994'),  -- Shiv Vardhaan
  ('7487991497', '7487991498'),  -- Shreya Silk Sarees
  ('9978912068', '9081277726'),  -- Shritik Designer
  ('9687609749', '7405442380'),  -- Shubh Saachi/Shiv Ganges
  ('8511573752', '9662399969'),  -- Tithi Designer
  ('8141335505', '9376711888');  -- Sweety Fashion

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- fascia_names_json is an object on rows the portal has written and a bare
-- array on rows seeded from the sheet. Normalise so the two can be merged.
CREATE OR REPLACE FUNCTION pg_temp._fascia_object(value JSONB)
RETURNS JSONB LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN value IS NULL                    THEN '{}'::jsonb
    WHEN jsonb_typeof(value) = 'object'   THEN value
    WHEN jsonb_typeof(value) = 'array'    THEN jsonb_build_object('fascia_names', value)
    ELSE '{}'::jsonb
  END;
$$;

-- Is this payload entry worth keeping, or is it a blank standing in for one?
CREATE OR REPLACE FUNCTION pg_temp._is_present(value JSONB)
RETURNS BOOLEAN LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN value IS NULL                  THEN FALSE
    WHEN jsonb_typeof(value) = 'null'   THEN FALSE
    WHEN jsonb_typeof(value) = 'string' THEN btrim(value #>> '{}') <> ''
    WHEN jsonb_typeof(value) = 'array'  THEN EXISTS (
      SELECT 1 FROM jsonb_array_elements_text(value) AS e WHERE btrim(e) <> ''
    )
    WHEN jsonb_typeof(value) = 'object' THEN value <> '{}'::jsonb
    ELSE TRUE
  END;
$$;

-- The alias payload underneath, the canonical's real answers on top.
CREATE OR REPLACE FUNCTION pg_temp._merge_fascia(canonical JSONB, alias JSONB)
RETURNS JSONB LANGUAGE sql IMMUTABLE AS $$
  SELECT pg_temp._fascia_object(alias) || COALESCE(
    (
      SELECT jsonb_object_agg(k, v)
      FROM jsonb_each(pg_temp._fascia_object(canonical)) AS t(k, v)
      WHERE pg_temp._is_present(v)
    ),
    '{}'::jsonb
  );
$$;

-- ---------------------------------------------------------------------------
-- 1. Archive every alias row, before anything is changed.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exhibitor_alias_merge_archive (
  id               BIGSERIAL PRIMARY KEY,
  merged_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  alias_mobile     TEXT NOT NULL,
  canonical_mobile TEXT NOT NULL,
  source_table     TEXT NOT NULL,
  row_data         JSONB NOT NULL
);

COMMENT ON TABLE public.exhibitor_alias_merge_archive IS
  'Alias rows as they stood before 20260904000028 folded them onto each firm''s canonical number.';

ALTER TABLE public.exhibitor_alias_merge_archive ENABLE ROW LEVEL SECURITY;

INSERT INTO public.exhibitor_alias_merge_archive (alias_mobile, canonical_mobile, source_table, row_data)
SELECT p.alias, p.canonical, 'exhibitors', to_jsonb(e)
FROM alias_pairs p JOIN public.exhibitors e ON e.mobile = p.alias;

INSERT INTO public.exhibitor_alias_merge_archive (alias_mobile, canonical_mobile, source_table, row_data)
SELECT p.alias, p.canonical, 'exhibitor_orders', to_jsonb(o)
FROM alias_pairs p JOIN public.exhibitor_orders o ON o.mobile = p.alias;

INSERT INTO public.exhibitor_alias_merge_archive (alias_mobile, canonical_mobile, source_table, row_data)
SELECT p.alias, p.canonical, 'exhibitor_assets', to_jsonb(a)
FROM alias_pairs p JOIN public.exhibitor_assets a ON a.mobile = p.alias;

-- ---------------------------------------------------------------------------
-- 2. Take the alias profiles aside, then remove them.
--
--    The merge below reads from this copy rather than the table, so the alias
--    row can go first and release drive_folder_name - which is uniquely
--    indexed, and which the canonical row is about to claim.
-- ---------------------------------------------------------------------------
CREATE TEMP TABLE alias_rows ON COMMIT DROP AS
SELECT p.canonical, e.*
FROM alias_pairs p JOIN public.exhibitors e ON e.mobile = p.alias;

-- ---------------------------------------------------------------------------
-- 3. A firm whose only profile is the alias one needs a canonical row to
--    merge into.
-- ---------------------------------------------------------------------------
INSERT INTO public.exhibitors (mobile, brand_name, stall_sqft)
SELECT a.canonical, COALESCE(a.brand_name, ''), COALESCE(a.stall_sqft, '')
FROM alias_rows a
WHERE NOT EXISTS (SELECT 1 FROM public.exhibitors c WHERE c.mobile = a.canonical)
ON CONFLICT (mobile) DO NOTHING;

DELETE FROM public.exhibitors e
USING alias_pairs p
WHERE e.mobile = p.alias;

-- ---------------------------------------------------------------------------
-- 4. The profile. Canonical wins field by field; the alias fills the blanks.
-- ---------------------------------------------------------------------------
UPDATE public.exhibitors c SET
  brand_name          = COALESCE(NULLIF(btrim(c.brand_name), ''),          NULLIF(btrim(a.brand_name), ''),          c.brand_name),
  stall_sqft          = COALESCE(NULLIF(btrim(c.stall_sqft), ''),          NULLIF(btrim(a.stall_sqft), ''),          c.stall_sqft),
  exhibitor_name      = COALESCE(NULLIF(btrim(c.exhibitor_name), ''),      NULLIF(btrim(a.exhibitor_name), ''),      c.exhibitor_name),
  company_description = COALESCE(NULLIF(btrim(c.company_description), ''), NULLIF(btrim(a.company_description), ''), c.company_description),
  gstin               = COALESCE(NULLIF(btrim(c.gstin), ''),               NULLIF(btrim(a.gstin), ''),               c.gstin),
  profile_pic_url     = COALESCE(NULLIF(btrim(c.profile_pic_url), ''),     NULLIF(btrim(a.profile_pic_url), '')),
  custom_password     = COALESCE(c.custom_password, a.custom_password),
  logo_file_url       = COALESCE(NULLIF(btrim(c.logo_file_url), ''),       NULLIF(btrim(a.logo_file_url), '')),
  cdr_file_url        = COALESCE(NULLIF(btrim(c.cdr_file_url), ''),        NULLIF(btrim(a.cdr_file_url), '')),
  drive_file_url      = COALESCE(NULLIF(btrim(c.drive_file_url), ''),      NULLIF(btrim(a.drive_file_url), '')),
  drive_folder_id     = COALESCE(NULLIF(btrim(c.drive_folder_id), ''),     NULLIF(btrim(a.drive_folder_id), '')),
  drive_folder_url    = COALESCE(NULLIF(btrim(c.drive_folder_url), ''),    NULLIF(btrim(a.drive_folder_url), '')),
  -- The Drive folder the artwork already sits in. The alias claim wins where
  -- the canonical never made one, so the merged row keeps pointing at the
  -- folder that actually holds the files.
  drive_folder_name   = COALESCE(NULLIF(btrim(c.drive_folder_name), ''),   NULLIF(btrim(a.drive_folder_name), '')),
  -- 20260903000024 has already cleared the alias stall copy, so these only
  -- ever fill a canonical row that never carried one.
  stall_number        = COALESCE(NULLIF(btrim(c.stall_number), ''),        NULLIF(btrim(a.stall_number), ''),        c.stall_number),
  stall_hall          = COALESCE(NULLIF(btrim(c.stall_hall), ''),          NULLIF(btrim(a.stall_hall), ''),          c.stall_hall),
  stall_zone          = COALESCE(NULLIF(btrim(c.stall_zone), ''),          NULLIF(btrim(a.stall_zone), ''),          c.stall_zone),
  stall_dimensions    = COALESCE(NULLIF(btrim(c.stall_dimensions), ''),    NULLIF(btrim(a.stall_dimensions), ''),    c.stall_dimensions),
  stall_allocated_at  = COALESCE(c.stall_allocated_at, a.stall_allocated_at),
  fascia_names_json   = pg_temp._merge_fascia(c.fascia_names_json, a.fascia_names_json),
  updated_at          = GREATEST(COALESCE(c.updated_at, NOW()), COALESCE(a.updated_at, NOW()))
FROM alias_rows a
WHERE c.mobile = a.canonical;

-- The columns and the payload must not now disagree about the same fact.
UPDATE public.exhibitors c SET
  exhibitor_name      = COALESCE(NULLIF(btrim(c.exhibitor_name), ''),      NULLIF(btrim(c.fascia_names_json ->> 'exhibitor_name'), ''),      ''),
  company_description = COALESCE(NULLIF(btrim(c.company_description), ''), NULLIF(btrim(c.fascia_names_json ->> 'company_description'), ''), ''),
  gstin               = COALESCE(NULLIF(btrim(c.gstin), ''),               NULLIF(btrim(c.fascia_names_json ->> 'gstin'), ''),               ''),
  profile_pic_url     = COALESCE(NULLIF(btrim(c.profile_pic_url), ''),     NULLIF(btrim(c.fascia_names_json ->> 'profile_pic_url'), ''))
FROM alias_rows a
WHERE c.mobile = a.canonical
  AND jsonb_typeof(c.fascia_names_json) = 'object';

-- ---------------------------------------------------------------------------
-- 5. The extras order. mobile is unique, so a firm with an order on each
--    number is merged in place and a firm with only the alias one moved.
-- ---------------------------------------------------------------------------

-- 5a. Both rows exist: take the alias basket only where the canonical is
--     empty. A basket somebody actually filled is never replaced.
UPDATE public.exhibitor_orders c SET
  items_json    = CASE
                    WHEN jsonb_array_length(COALESCE(c.items_json, '[]'::jsonb)) > 0 THEN c.items_json
                    ELSE COALESCE(a.items_json, c.items_json)
                  END,
  special_notes = COALESCE(NULLIF(btrim(c.special_notes), ''), NULLIF(btrim(a.special_notes), ''), c.special_notes),
  rental_days   = CASE
                    WHEN jsonb_array_length(COALESCE(c.items_json, '[]'::jsonb)) > 0 THEN c.rental_days
                    ELSE COALESCE(a.rental_days, c.rental_days)
                  END,
  owner_badges   = GREATEST(COALESCE(c.owner_badges, 0),   COALESCE(a.owner_badges, 0)),
  sales_badges   = GREATEST(COALESCE(c.sales_badges, 0),   COALESCE(a.sales_badges, 0)),
  support_badges = GREATEST(COALESCE(c.support_badges, 0), COALESCE(a.support_badges, 0)),
  updated_at     = GREATEST(COALESCE(c.updated_at, NOW()), COALESCE(a.updated_at, NOW()))
FROM alias_pairs p
JOIN public.exhibitor_orders a ON a.mobile = p.alias
WHERE c.mobile = p.canonical;

DELETE FROM public.exhibitor_orders o
USING alias_pairs p
WHERE o.mobile = p.alias
  AND EXISTS (SELECT 1 FROM public.exhibitor_orders c WHERE c.mobile = p.canonical);

-- 5b. Only the alias has one: move it across whole.
UPDATE public.exhibitor_orders o SET mobile = p.canonical
FROM alias_pairs p
WHERE o.mobile = p.alias
  AND NOT EXISTS (SELECT 1 FROM public.exhibitor_orders c WHERE c.mobile = p.canonical);

-- ---------------------------------------------------------------------------
-- 6. The uploaded files. Unique on (mobile, category, slot), so each moved
--    file is given the next free slot in its category on the canonical row.
-- ---------------------------------------------------------------------------

-- 6a. The same file already on the canonical number is a duplicate, not a
--     second file. It is archived above; drop it rather than move it.
DELETE FROM public.exhibitor_assets a
USING alias_pairs p
WHERE a.mobile = p.alias
  AND EXISTS (
    SELECT 1 FROM public.exhibitor_assets c
    WHERE c.mobile = p.canonical
      AND c.category = a.category
      AND c.asset_file_name = a.asset_file_name
  );

-- 6b. Everything else moves, taking the next free slot in its category.
WITH moving AS (
  SELECT
    a.id,
    p.canonical,
    COALESCE(
      (SELECT MAX(c.slot) FROM public.exhibitor_assets c
       WHERE c.mobile = p.canonical AND c.category = a.category),
      0
    ) + ROW_NUMBER() OVER (PARTITION BY p.canonical, a.category ORDER BY a.slot, a.id) AS new_slot
  FROM public.exhibitor_assets a
  JOIN alias_pairs p ON a.mobile = p.alias
)
UPDATE public.exhibitor_assets a
SET mobile = m.canonical,
    slot   = m.new_slot
FROM moving m
WHERE a.id = m.id;

-- ---------------------------------------------------------------------------
-- 7. lottery_allocations.firm_mobile is the one-stall-per-firm guarantee
--    (20260828000008). Make sure every row still names the canonical number,
--    including any drawn since that migration ran.
-- ---------------------------------------------------------------------------
UPDATE public.lottery_allocations l
SET firm_mobile = p.canonical
FROM alias_pairs p
WHERE l.mobile = p.alias
  AND l.firm_mobile IS DISTINCT FROM p.canonical;

COMMIT;
