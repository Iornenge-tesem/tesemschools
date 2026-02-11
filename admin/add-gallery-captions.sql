-- ============================================================
-- ADD CAPTION FIELD TO GALLERY TABLE
-- Tesem Model Schools
--
-- Allows captions/descriptions for gallery images
-- (e.g., "Proprietor", "Staff Team", "Students at Assembly")
-- ============================================================

-- Add caption column to gallery table
ALTER TABLE public.gallery
ADD COLUMN IF NOT EXISTS caption TEXT;

-- Add index for faster searches
CREATE INDEX IF NOT EXISTS idx_gallery_location ON public.gallery(location);

-- ============================================================
-- DONE!
-- Gallery images can now have captions/descriptions
-- ============================================================
