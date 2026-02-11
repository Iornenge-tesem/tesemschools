/* ============================================================
   HERO BACKGROUNDS TABLE SETUP
   Tesem Model Schools
   
   Stores custom hero background images for static pages.
   Each page can have one active hero background.
   ============================================================ */

-- Create hero_backgrounds table
CREATE TABLE IF NOT EXISTS public.hero_backgrounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_name TEXT NOT NULL UNIQUE CHECK (page_name IN ('about', 'academics', 'admissions', 'contact')),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hero_backgrounds ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active hero backgrounds
CREATE POLICY "Anyone can view hero backgrounds"
  ON public.hero_backgrounds
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert
CREATE POLICY "Authenticated users can insert hero backgrounds"
  ON public.hero_backgrounds
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can update
CREATE POLICY "Authenticated users can update hero backgrounds"
  ON public.hero_backgrounds
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can delete
CREATE POLICY "Authenticated users can delete hero backgrounds"
  ON public.hero_backgrounds
  FOR DELETE
  TO authenticated
  USING (true);

-- Create index on page_name for faster lookups
CREATE INDEX IF NOT EXISTS idx_hero_backgrounds_page_name ON public.hero_backgrounds(page_name);

-- Insert default records for all pages (no custom images initially)
INSERT INTO public.hero_backgrounds (page_name, image_url, is_active)
VALUES 
  ('about', NULL, true),
  ('academics', NULL, true),
  ('admissions', NULL, true),
  ('contact', NULL, true)
ON CONFLICT (page_name) DO NOTHING;

-- Create storage bucket for hero images (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-images', 'hero-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can view hero images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload hero images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update hero images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete hero images" ON storage.objects;

-- Storage policies for hero-images bucket
-- Policy: Anyone can view hero images
CREATE POLICY "Anyone can view hero images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'hero-images');

-- Policy: Authenticated users can upload hero images
CREATE POLICY "Authenticated users can upload hero images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'hero-images'
    AND (storage.foldername(name))[1] = 'pages'
  );

-- Policy: Authenticated users can update hero images
CREATE POLICY "Authenticated users can update hero images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'hero-images')
  WITH CHECK (bucket_id = 'hero-images');

-- Policy: Authenticated users can delete hero images
CREATE POLICY "Authenticated users can delete hero images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'hero-images');
