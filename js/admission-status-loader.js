/* ============================================================
   ADMISSION STATUS LOADER
   Tesem Model Schools
   
   Dynamically updates UI based on admission status:
   - Changes "Enroll Now" to "Admission Closed" when closed
   - Hides CTA sections when admission is closed
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Supabase Config ---------- */
  var SUPABASE_URL = 'https://rnqoyaedeegtgciwamqo.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJucW95YWVkZWVndGdjaXdhbXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NTE3MjgsImV4cCI6MjA4NjMyNzcyOH0.sIqdBlGpQGr7J73_SEUa3x0xUFo6UJHvqm1hEBtwn-8';

  /* ---------- DOM References ---------- */
  var enrollButton = document.querySelector('.nav__cta'); // Enroll Now button in navbar
  var ctaSection = document.querySelector('.cta'); // CTA section before footer

  /* ---------- Initialize ---------- */
  function init() {
    // Check if Supabase is loaded
    if (typeof window.supabase === 'undefined' || !window.supabase.createClient) {
      console.warn('Supabase library not loaded — admission status will show default.');
      return;
    }

    var sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // Fetch site settings
    sb.from('site_settings')
      .select('admission_open')
      .single()
      .then(function (response) {
        var data = response.data;
        var error = response.error;

        if (error) {
          console.error('Error fetching admission status:', error.message);
          return;
        }

        var admissionOpen = data && data.admission_open === true;
        updateUI(admissionOpen);
      })
      .catch(function (err) {
        console.error('Failed to fetch admission status:', err);
      });
  }

  /* ---------- Update UI Based on Admission Status ---------- */
  function updateUI(isOpen) {
    // Update navbar button
    if (enrollButton) {
      if (isOpen) {
        enrollButton.textContent = 'Enroll Now';
        enrollButton.href = 'admissions.html';
        enrollButton.classList.remove('btn--disabled');
        enrollButton.style.pointerEvents = '';
      } else {
        enrollButton.textContent = 'Admission Closed';
        enrollButton.href = '#';
        enrollButton.classList.add('btn--disabled');
        enrollButton.style.pointerEvents = 'none';
        enrollButton.style.opacity = '0.6';
        enrollButton.style.cursor = 'not-allowed';
      }
    }

    // Hide/show CTA section
    if (ctaSection) {
      if (isOpen) {
        ctaSection.style.display = '';
      } else {
        ctaSection.style.display = 'none';
      }
    }
  }

  /* ---------- Start on DOM Ready ---------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
