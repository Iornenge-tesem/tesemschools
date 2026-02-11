-- ============================================================
-- CREATE CONTACT SUBMISSIONS TABLE
-- Run this in Supabase SQL Editor (Dashboard > SQL)
-- ============================================================

-- 1. Create contact_submissions table
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- 3. Allow anyone to insert (public can submit contact forms)
CREATE POLICY "Anyone can submit contact form"
ON public.contact_submissions FOR INSERT
WITH CHECK (true);

-- 4. Only authenticated users can view (admin only)
CREATE POLICY "Authenticated users can view submissions"
ON public.contact_submissions FOR SELECT
USING (auth.role() = 'authenticated');

-- 5. Only authenticated users can update status
CREATE POLICY "Authenticated users can update submissions"
ON public.contact_submissions FOR UPDATE
USING (auth.role() = 'authenticated');

-- 6. Only authenticated users can delete
CREATE POLICY "Authenticated users can delete submissions"
ON public.contact_submissions FOR DELETE
USING (auth.role() = 'authenticated');

-- 7. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at 
ON public.contact_submissions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_status 
ON public.contact_submissions(status);

-- ============================================================
-- DONE! Contact form submissions will now be stored.
-- ============================================================
