-- Surat Textile Expo 2026 - Saraogi Super Sales' booked size corrected to 2800 sq ft
-- Migration: 20260905000030_saraogi_stall_sqft_2800.sql
--
-- Saraogi Super Sales Private Limited (9810550285, stall 39, the 42m x 6m
-- anchor) now books 2800 sq ft, not 2600 (organisers, 5 Sep 2026). This
-- corrects the size figure only - stall_number, hall, zone and dimensions
-- are untouched, since only the booked square footage changed.
--
-- stall_number/mobile are immutable on lottery_allocations (trigger from
-- 20260903000023), but stall_sqft is not, so a plain UPDATE is enough here -
-- no delete-and-reinsert needed, unlike a stall number change.
--
-- Idempotent: re-running just sets the same value again.

BEGIN;

UPDATE lottery_allocations
   SET stall_sqft = '2800 sq ft'
 WHERE mobile = '9810550285';

UPDATE exhibitors
   SET stall_sqft = '2800 sq ft'
 WHERE mobile = '9810550285';

COMMIT;
