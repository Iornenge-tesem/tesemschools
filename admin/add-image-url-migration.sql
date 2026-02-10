-- ============================================================
-- MIGRATION: Add image_url column to announcements table
-- Run this in Supabase SQL Editor (Dashboard > SQL)
-- ============================================================

-- Add nullable image_url column for announcement images
ALTER TABLE public.announcements
ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT NULL;

-- ============================================================
-- NEXT STEP: Set up storage bucket
-- After running this, also run: setup-announcements-storage.sql
-- (or create the bucket manually via Dashboard > Storage)
-- ============================================================
