-- Surat Textile Expo 2026 - Univastra Sarees booked size corrected to 400 sq ft
-- Migration: 20260909000039_univastra_stall_sqft_400.sql
--
-- Univastra Sarees / Univastra Fashion (7285010000, stall 167) books 400 sq ft,
-- not 200 sq ft. Stall 167 in South Hall is a 3m x 12m bay (36 sqm = 400 sq ft).
-- This migration updates stall_sqft to 400 sq ft and dimensions to 3m x 12m.
--
-- Idempotent: re-running just sets the same values again.

BEGIN;

UPDATE lottery_allocations
   SET stall_sqft = '400 sq ft',
       dimensions = '3m x 12m'
 WHERE mobile = '7285010000';

UPDATE exhibitors
   SET stall_sqft = '400 sq ft',
       stall_dimensions = '3m x 12m',
       updated_at = NOW()
 WHERE mobile = '7285010000';

COMMIT;
