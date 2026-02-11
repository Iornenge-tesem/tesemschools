-- ============================================================
-- SCHEMA MIGRATIONS
-- Run this in Supabase SQL Editor (Dashboard > SQL)
-- ============================================================

-- 1. Remove type column from announcements (no longer needed)
ALTER TABLE public.announcements
DROP COLUMN IF EXISTS type;

-- 2. Add location column to gallery table
ALTER TABLE public.gallery
DROP COLUMN IF EXISTS category;

ALTER TABLE public.gallery
ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'gallery' 
CHECK (location IN ('home_school', 'about_founders', 'gallery'));

-- ============================================================
-- DONE!
-- Announcements no longer categorized by type
-- Gallery images now have location (home_school, about_founders, gallery)
-- ============================================================
