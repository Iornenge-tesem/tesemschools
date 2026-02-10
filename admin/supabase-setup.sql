-- ============================================================
-- TESEM MODEL SCHOOLS — Supabase Database Setup
-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL)
-- ============================================================

-- ============================================================
-- 1. ANNOUNCEMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.announcements (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('admission', 'employment', 'activities', 'term_closure', 'resumption')),
  is_published BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Public: read-only for published announcements
CREATE POLICY "Public can read published announcements"
  ON public.announcements
  FOR SELECT
  USING (is_published = true);

-- Authenticated admins: full access
CREATE POLICY "Admins have full access to announcements"
  ON public.announcements
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');


-- ============================================================
-- 2. GALLERY TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gallery (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url  TEXT NOT NULL,
  category   TEXT DEFAULT 'campus' CHECK (category IN ('campus', 'events', 'activities', 'graduation')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

-- Public: read-only
CREATE POLICY "Public can read gallery"
  ON public.gallery
  FOR SELECT
  USING (true);

-- Authenticated admins: full access
CREATE POLICY "Admins have full access to gallery"
  ON public.gallery
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');


-- ============================================================
-- 3. SITE SETTINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admission_open  BOOLEAN DEFAULT false,
  resumption_date DATE,
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public: read-only
CREATE POLICY "Public can read site settings"
  ON public.site_settings
  FOR SELECT
  USING (true);

-- Authenticated admins: full access
CREATE POLICY "Admins have full access to site settings"
  ON public.site_settings
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');


-- ============================================================
-- 4. INSERT DEFAULT SETTINGS ROW
-- ============================================================
INSERT INTO public.site_settings (admission_open, resumption_date)
VALUES (false, NULL)
ON CONFLICT DO NOTHING;


-- ============================================================
-- 5. STORAGE BUCKET FOR GALLERY IMAGES
-- ============================================================
-- Run this ONLY if the bucket doesn't already exist.
-- You can also create it via Dashboard > Storage > New Bucket.
--
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('gallery', 'gallery', true);
--
-- Storage RLS policies (create via Dashboard > Storage > Policies):
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
-- SETUP COMPLETE
-- ============================================================
-- Next steps:
-- 1. Go to Authentication > Users and create an admin user
--    (email + password, no public sign-up)
-- 2. Go to Storage and create a bucket called "gallery" (public)
-- 3. Add storage policies for read (public) and write (authenticated)
-- 4. Update admin/js/supabase-config.js with your project URL and anon key
-- 5. Disable sign-up in Authentication > Settings > Auth Providers
