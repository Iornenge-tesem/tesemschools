-- ============================================================
-- MIGRATION: Add image_url column to announcements table
-- Run this in Supabase SQL Editor (Dashboard > SQL)
-- ============================================================

-- Add nullable image_url column for announcement images
ALTER TABLE public.announcements
ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT NULL;

-- ============================================================
-- STORAGE BUCKET FOR ANNOUNCEMENT IMAGES
-- ============================================================
-- Create a public bucket called "announcements" for image slides.
-- You can also do this via Dashboard > Storage > New Bucket.
--
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('announcements', 'announcements', true);
--
-- Then add these storage policies via Dashboard > Storage > Policies:
--
-- Allow public read:
--   SELECT: true
--
-- Allow authenticated upload:
--   INSERT: auth.role() = 'authenticated'
--
-- Allow authenticated delete:
--   DELETE: auth.role() = 'authenticated'

-- ============================================================
-- DONE — After running this SQL:
-- 1. Go to Storage > New Bucket > name: "announcements" > Public: ON
-- 2. Add the storage policies listed above
-- 3. The admin panel will now show an image upload field
-- 4. Uploaded images appear as carousel background slides
-- ============================================================
