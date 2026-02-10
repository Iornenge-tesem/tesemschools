/* ============================================================
   SUPABASE CLIENT CONFIGURATION
   Tesem Model Schools — Admin Panel
   Version: 2.0 (Fixed duplicate declaration)
   ============================================================ */

(function() {
  'use strict';
  
  // Only initialize once
  if (window.supabaseClient) {
    console.log('Supabase already initialized');
    return;
  }
  
  // Check if Supabase library is loaded
  if (!window.supabase || !window.supabase.createClient) {
    console.error('Supabase library not loaded! Include CDN script first.');
    return;
  }
  
  // Create the client
  try {
    window.supabaseClient = window.supabase.createClient(
      'https://rnqoyaedeegtgciwamqo.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJucW95YWVkZWVndGdjaXdhbXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NTE3MjgsImV4cCI6MjA4NjMyNzcyOH0.sIqdBlGpQGr7J73_SEUa3x0xUFo6UJHvqm1hEBtwn-8'
    );
    console.log('✓ Supabase client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Supabase:', error);
  }
})();

