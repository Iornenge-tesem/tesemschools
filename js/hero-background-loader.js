/* ============================================================
   HERO BACKGROUND LOADER
   Tesem Model Schools
   
   Dynamically loads and applies custom hero background images
   from Supabase for About, Academics, Admissions, and Contact pages.
   Falls back to default gradient if no custom image is set.
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Supabase Config ---------- */
  var SUPABASE_URL = 'https://rnqoyaedeegtgciwamqo.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJucW95YWVkZWVndGdjaXdhbXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NTE3MjgsImV4cCI6MjA4NjMyNzcyOH0.sIqdBlGpQGr7J73_SEUa3x0xUFo6UJHvqm1hEBtwn-8';

  /* ---------- DOM Reference ---------- */
  var heroSection = document.querySelector('.page-hero[data-page]');

  if (!heroSection) return; // No hero section with data-page attribute

  var pageName = heroSection.getAttribute('data-page');
  if (!pageName) return;

  /* ---------- Initialize ---------- */
  function init() {
    // Check if Supabase is loaded
    if (typeof window.supabase === 'undefined' || !window.supabase.createClient) {
      console.warn('Supabase library not loaded — hero background will use default gradient.');
      return;
    }

    var sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // Fetch hero background for this page
    sb.from('hero_backgrounds')
      .select('*')
      .eq('page_name', pageName)
      .eq('is_active', true)
      .single()
      .then(function (response) {
        var data = response.data;
        var error = response.error;

        if (error) {
          // If no record found (404), that's okay - use default
          if (error.code !== 'PGRST116') {
            console.error('Error fetching hero background:', error.message);
          }
          return;
        }

        if (data && data.image_url && data.image_url.trim() !== '') {
          applyBackgroundImage(data.image_url);
        }
        // If no image_url, keep the default gradient
      })
      .catch(function (err) {
        console.error('Failed to fetch hero background:', err);
      });
  }

  /* ---------- Apply Background Image ---------- */
  function applyBackgroundImage(imageUrl) {
    // Create a test image to ensure it loads
    var img = new Image();
    
    img.onload = function () {
      // Image loaded successfully - apply it
      heroSection.style.backgroundImage = 
        'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(' + escapeCSS(imageUrl) + ')';
      heroSection.style.backgroundSize = 'cover';
      heroSection.style.backgroundPosition = 'center';
      heroSection.style.backgroundRepeat = 'no-repeat';
      
      // Add a class to indicate custom background is applied
      heroSection.classList.add('page-hero--custom-bg');
    };
    
    img.onerror = function () {
      console.warn('Hero background image failed to load:', imageUrl);
      // Keep default gradient background
    };
    
    img.src = imageUrl;
  }

  /* ---------- Utility: Escape CSS URL ---------- */
  function escapeCSS(str) {
    if (!str) return '';
    return str.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
  }

  /* ---------- Start on DOM Ready ---------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
