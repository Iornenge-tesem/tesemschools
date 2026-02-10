/* ============================================================
   SUPABASE CLIENT CONFIGURATION
   Tesem Model Schools — Admin Panel
   
   SETUP INSTRUCTIONS:
   1. Create a Supabase project at https://supabase.com
   2. Replace SUPABASE_URL with your project URL
   3. Replace SUPABASE_ANON_KEY with your anon/public key
   4. Run the SQL from supabase-setup.sql in the SQL Editor
   5. Create an admin user via Supabase Auth dashboard
   ============================================================ */

const SUPABASE_URL  = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_PUBLIC_KEY';

// Initialize the Supabase client (loaded via CDN in HTML)
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
