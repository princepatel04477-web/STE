-- Surat Textile Expo 2026 - per-exhibitor lock on the requirements/extras section
-- Migration: 20260906000032_exhibitor_requirements_lock.sql
--
-- Lets the organiser freeze one exhibitor's "Additional Requirements & Extras"
-- section on the portal - e.g. once their order is finalised - without
-- touching anyone else's. The admin console gets a per-row toggle plus
-- Lock All / Unlock All bulk actions; the portal renders the section
-- read-only, and /api/exhibitor/extras rejects writes, while this is true.
--
-- Defaults to false so nobody already using the portal is locked out by the
-- migration itself.

ALTER TABLE exhibitors
  ADD COLUMN IF NOT EXISTS requirements_locked BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN exhibitors.requirements_locked IS
  'Set by the organiser to freeze this exhibitor''s Additional Requirements & '
  'Extras section (read-only on the portal, writes rejected by the API).';
