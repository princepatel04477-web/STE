-- Surat Textile Expo 2026 Supabase Schema Migration
-- Migration: 20260825000001_initial_schema.sql

-- 1. Whitelisted Exhibitors Master Table
CREATE TABLE IF NOT EXISTS allowed_exhibitors (
  id BIGSERIAL PRIMARY KEY,
  mobile VARCHAR(20) UNIQUE NOT NULL,
  notes TEXT DEFAULT 'Pre-whitelisted exhibitor from master list',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Exhibitors Profile & Asset Table
CREATE TABLE IF NOT EXISTS exhibitors (
  id BIGSERIAL PRIMARY KEY,
  mobile VARCHAR(20) UNIQUE NOT NULL,
  brand_name TEXT DEFAULT '',
  stall_sqft VARCHAR(50) DEFAULT '',
  custom_password TEXT,
  fascia_names_json JSONB DEFAULT '[]'::jsonb,
  logo_file_url TEXT,
  cdr_file_url TEXT,
  drive_file_url TEXT,
  drive_folder_id TEXT,
  drive_folder_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by mobile
CREATE INDEX IF NOT EXISTS idx_exhibitors_mobile ON exhibitors(mobile);

-- 3. Extra Products Inventory Table
CREATE TABLE IF NOT EXISTS extra_products (
  id VARCHAR(100) PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  rate_inr INTEGER NOT NULL DEFAULT 0,
  unit VARCHAR(50) NOT NULL DEFAULT 'per-day',
  icon_name VARCHAR(50) NOT NULL DEFAULT 'table',
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Exhibitor Orders & Badges Table
CREATE TABLE IF NOT EXISTS exhibitor_orders (
  id BIGSERIAL PRIMARY KEY,
  mobile VARCHAR(20) UNIQUE NOT NULL,
  items_json JSONB DEFAULT '[]'::jsonb,
  special_notes TEXT DEFAULT '',
  owner_badges INTEGER DEFAULT 0,
  sales_badges INTEGER DEFAULT 0,
  support_badges INTEGER DEFAULT 0,
  badge_names_json JSONB DEFAULT '{}'::jsonb,
  rental_days INTEGER DEFAULT 2,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for orders by mobile
CREATE INDEX IF NOT EXISTS idx_exhibitor_orders_mobile ON exhibitor_orders(mobile);

-- 5. Stall Lottery Allocations Table
CREATE TABLE IF NOT EXISTS lottery_allocations (
  id BIGSERIAL PRIMARY KEY,
  mobile VARCHAR(20) UNIQUE NOT NULL,
  brand_name TEXT NOT NULL,
  stall_sqft VARCHAR(50) NOT NULL,
  stall_number VARCHAR(50) NOT NULL,
  is_corner INTEGER NOT NULL DEFAULT 0,
  shape VARCHAR(50) NOT NULL DEFAULT 'Linear',
  hall TEXT NOT NULL,
  zone TEXT NOT NULL,
  dimensions TEXT NOT NULL,
  slip_id VARCHAR(100) NOT NULL,
  allocated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for lottery allocations
CREATE INDEX IF NOT EXISTS idx_lottery_allocations_mobile ON lottery_allocations(mobile);
CREATE INDEX IF NOT EXISTS idx_lottery_allocations_stall ON lottery_allocations(stall_number);
