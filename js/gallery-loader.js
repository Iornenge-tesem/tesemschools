/* ============================================================
   GALLERY IMAGE LOADER
   Loads images from Supabase gallery table and displays them
   in placeholders on Home and About pages
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Supabase Config ---------- */
  var SUPABASE_URL = 'https://rnqoyaedeegtgciwamqo.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJucW95YWVkZWVndGdjaXdhbXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NTE3MjgsImV4cCI6MjA4NjMyNzcyOH0.sIqdBlGpQGr7J73_SEUa3x0xUFo6UJHvqm1hEBtwn-8';

  /* ---------- Initialize on DOM ready ---------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // Check if Supabase library loaded
    if (typeof window.supabase === 'undefined' || !window.supabase.createClient) {
      console.warn('Supabase library not loaded — gallery images will not load.');
      return;
    }

    var sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // Fetch gallery images
    sb.from('gallery')
      .select('*')
      .order('created_at', { ascending: false })
      .then(function (response) {
        var data = response.data;
        var error = response.error;

        if (error) {
          console.error('Gallery fetch error:', error.message);
          return;
        }

        if (data && data.length > 0) {
          injectGalleryImages(data);
        }
      })
      .catch(function (err) {
        console.error('Gallery fetch failed:', err);
      });
  }

  /* ---------- Inject images into placeholders ---------- */
  function injectGalleryImages(images) {
    // Find images for each location
    var homeSchoolImg = images.find(function (img) {
      return img.location === 'home_school';
    });

    var aboutFoundersImg = images.find(function (img) {
      return img.location === 'about_founders';
    });

    // HOME PAGE - School Building Image (on home page only)
    if (homeSchoolImg && window.location.pathname.match(/(index\.html|\\/$|^$)/)) {
      var homeImageEl = document.querySelector('.intro__image');
      if (homeImageEl) {
        homeImageEl.innerHTML = '<img src=\"' + escapeAttr(homeSchoolImg.image_url) + '\" alt=\"Tesem Model Schools Building\" style=\"width:100%;height:100%;object-fit:cover;border-radius:10px;\" />';
      }
    }

    // ABOUT PAGE - Founders / Campus Image (on about page only)
    if (aboutFoundersImg && window.location.pathname.includes('about.html')) {
      var aboutImageEl = document.querySelector('.intro__image');
      if (aboutImageEl) {
        aboutImageEl.innerHTML = '<img src=\"' + escapeAttr(aboutFoundersImg.image_url) + '\" alt=\"Tesem Model Schools Founders / Campus\" style=\"width:100%;height:100%;object-fit:cover;border-radius:10px;\" />';
      }
    }
  }

  /* ---------- Utility ---------- */
  function escapeAttr(str) {
    if (!str) return '';
    return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
})();
