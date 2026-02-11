-- ============================================================
-- ADD UPDATED_AT COLUMN TO GALLERY TABLE
-- Tesem Model Schools
--
-- Adds timestamp tracking for when images are replaced/updated
-- Required for the replace image functionality in admin
-- ============================================================

-- Add updated_at column to gallery table
ALTER TABLE public.gallery
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_gallery_updated_at 
ON public.gallery(updated_at DESC);

-- Optional: Update existing records to have updated_at = created_at
UPDATE public.gallery 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- ============================================================
-- NOTES:
-- - This column tracks when an image was last replaced/updated
-- - If you replace an image in admin, updated_at will be refreshed
-- - The index improves performance when sorting by updated date
-- ============================================================
