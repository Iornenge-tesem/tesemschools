-- ============================================================
-- CREATE GALLERY STORAGE BUCKET WITH POLICIES
-- Run this in Supabase SQL Editor (Dashboard > SQL)
-- Idempotent: Safe to run multiple times
-- ============================================================

-- 1. Create the gallery bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public can read gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete gallery images" ON storage.objects;

-- 3. Allow PUBLIC READ access (anyone can view images)
CREATE POLICY "Public can read gallery images"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery');

-- 4. Allow AUTHENTICATED UPLOAD (only logged-in admins can upload)
CREATE POLICY "Authenticated users can upload gallery images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'gallery' 
  AND auth.role() = 'authenticated'
);

-- 5. Allow AUTHENTICATED UPDATE (admins can modify their uploads)
CREATE POLICY "Authenticated users can update gallery images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'gallery' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'gallery' 
  AND auth.role() = 'authenticated'
);

-- 6. Allow AUTHENTICATED DELETE (admins can delete images)
CREATE POLICY "Authenticated users can delete gallery images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'gallery' 
  AND auth.role() = 'authenticated'
);

-- ============================================================
-- DONE! The gallery storage bucket is now ready.
-- You can now upload images from the admin dashboard.
-- ============================================================
