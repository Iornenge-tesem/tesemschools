/* ============================================================
   PHOTO GALLERY LOADER
   Tesem Model Schools
   
   Loads and displays gallery images with captions on About page.
   Shows staff, students, events, and other memorable moments.
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Supabase Config ---------- */
  var SUPABASE_URL = 'https://rnqoyaedeegtgciwamqo.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJucW95YWVkZWVndGdjaXdhbXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NTE3MjgsImV4cCI6MjA4NjMyNzcyOH0.sIqdBlGpQGr7J73_SEUa3x0xUFo6UJHvqm1hEBtwn-8';

  /* ---------- DOM Reference ---------- */
  var galleryContainer = document.getElementById('photoGallery');

  if (!galleryContainer) return; // Not on a page with photo gallery

  /* ---------- Initialize ---------- */
  function init() {
    // Check if Supabase is loaded
    if (typeof window.supabase === 'undefined' || !window.supabase.createClient) {
      console.warn('Supabase library not loaded — photo gallery will not load.');
      showError('Unable to load gallery. Please refresh the page.');
      return;
    }

    var sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // Fetch gallery images (location = 'gallery')
    sb.from('gallery')
      .select('*')
      .eq('location', 'gallery')
      .order('created_at', { ascending: false })
      .then(function (response) {
        var data = response.data;
        var error = response.error;

        if (error) {
          console.error('Gallery fetch error:', error.message);
          showError('Failed to load gallery images.');
          return;
        }

        if (data && data.length > 0) {
          displayGallery(data);
        } else {
          showEmpty();
        }
      })
      .catch(function (err) {
        console.error('Failed to fetch gallery:', err);
        showError('Failed to load gallery images.');
      });
  }

  /* ---------- Display Gallery Images ---------- */
  function displayGallery(images) {
    var html = images.map(function (img) {
      var caption = img.caption && img.caption.trim() !== '' 
        ? escapeHTML(img.caption)
        : '<span class="gallery-item__caption--empty">No caption</span>';

      return '<div class="gallery-item">' +
        '<img src="' + escapeAttr(img.image_url) + '" alt="' + escapeAttr(img.caption || 'Gallery image') + '" class="gallery-item__image" />' +
        '<div class="gallery-item__caption">' +
          '<p>' + caption + '</p>' +
        '</div>' +
      '</div>';
    }).join('');

    galleryContainer.innerHTML = html;
  }

  /* ---------- Show Empty State ---------- */
  function showEmpty() {
    galleryContainer.innerHTML = 
      '<div class="photo-gallery__loader">' +
        '<p style="font-size:1.1rem;color:var(--text-secondary);">📷</p>' +
        '<p>No gallery images yet. Check back soon!</p>' +
      '</div>';
  }

  /* ---------- Show Error State ---------- */
  function showError(message) {
    galleryContainer.innerHTML = 
      '<div class="photo-gallery__loader">' +
        '<p style="color:#ef4444;">⚠️ ' + escapeHTML(message) + '</p>' +
      '</div>';
  }

  /* ---------- Utility Functions ---------- */
  function escapeHTML(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeAttr(str) {
    if (!str) return '';
    return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ---------- Start on DOM Ready ---------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
