/* ============================================================
   HERO CAROUSEL — Supabase-driven Announcement Slides
   Tesem Model Schools
   
   • Default hero slide always first
   • Fetches published announcements from Supabase
   • Supports text-only and image-based slides
   • Auto-advances every 6 seconds, infinite loop
   • Manual navigation via arrows and dots
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Supabase Config (public / anon key — read only) ---------- */
  var SUPABASE_URL = 'https://rnqoyaedeegtgciwamqo.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJucW95YWVkZWVndGdjaXdhbXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NTE3MjgsImV4cCI6MjA4NjMyNzcyOH0.sIqdBlGpQGr7J73_SEUa3x0xUFo6UJHvqm1hEBtwn-8';

  /* ---------- DOM References ---------- */
  var carousel  = document.getElementById('heroCarousel');
  var track     = carousel ? carousel.querySelector('.hero-carousel__track') : null;
  var dotsWrap  = document.getElementById('carouselDots');
  var prevBtn   = document.getElementById('carouselPrev');
  var nextBtn   = document.getElementById('carouselNext');

  if (!carousel || !track) return; // Safety — no carousel markup found

  /* ---------- State ---------- */
  var currentIndex  = 0;
  var slides        = [];
  var dots          = [];
  var autoTimer     = null;
  var AUTO_INTERVAL = 6000; // 6 seconds
  var isTransitioning = false;
  var isInfiniteLoop = true; // Enable infinite loop

  /* ==========================================================
     1.  INITIALISE — Fetch announcements, build slides, start
     ========================================================== */
  function init() {
    // Bail early if Supabase library not loaded
    if (typeof window.supabase === 'undefined' || !window.supabase.createClient) {
      console.warn('Supabase library not loaded — carousel will show default slide only.');
      finaliseCarousel();
      return;
    }

    var sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    sb.from('announcements')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .then(function (response) {
        var data  = response.data;
        var error = response.error;

        if (error) {
          console.error('Carousel fetch error:', error.message);
        }

        if (data && data.length > 0) {
          buildAnnouncementSlides(data);
        }

        finaliseCarousel();
      })
      .catch(function (err) {
        console.error('Carousel fetch failed:', err);
        finaliseCarousel();
      });
  }

  /* ==========================================================
     2.  BUILD ANNOUNCEMENT SLIDES
     ========================================================== */
  function buildAnnouncementSlides(announcements) {
    announcements.forEach(function (ann) {
      var hasImage = ann.image_url && ann.image_url.trim() !== '';
      var slide    = document.createElement('div');
      var dateStr  = formatDate(ann.created_at);

      if (hasImage) {
        /* ----- Image-based slide ----- */
        slide.className = 'hero-carousel__slide hero-carousel__slide--image';
        slide.style.backgroundImage = 'url(' + escapeAttr(ann.image_url) + ')';

        slide.innerHTML =
          '<div class="hero-carousel__img-overlay" aria-hidden="true"></div>' +
          '<div class="hero-carousel__ann-content container">' +
            '<h2 class="hero-carousel__ann-title">' + escapeHTML(ann.title) + '</h2>' +
            '<p class="hero-carousel__ann-text">' + escapeHTML(ann.content) + '</p>' +
            '<span class="hero-carousel__ann-date">' + dateStr + '</span>' +
          '</div>';

        // Handle broken images — fall back to gradient
        var testImg = new Image();
        testImg.onerror = function () {
          slide.classList.remove('hero-carousel__slide--image');
          slide.classList.add('hero-carousel__slide--text');
          slide.style.backgroundImage = '';
          // Remove the overlay div since gradient doesn't need it
          var overlay = slide.querySelector('.hero-carousel__img-overlay');
          if (overlay) overlay.remove();
        };
        testImg.src = ann.image_url;
      } else {
        /* ----- Text-only slide ----- */
        slide.className = 'hero-carousel__slide hero-carousel__slide--text';

        slide.innerHTML =
          '<div class="hero-carousel__ann-content container">' +
            '<h2 class="hero-carousel__ann-title">' + escapeHTML(ann.title) + '</h2>' +
            '<p class="hero-carousel__ann-text">' + escapeHTML(ann.content) + '</p>' +
            '<span class="hero-carousel__ann-date">' + dateStr + '</span>' +
          '</div>';
      }

      slide.setAttribute('aria-label', 'Announcement: ' + ann.title);
      track.appendChild(slide);
    });
  }

  /* ==========================================================
     3.  FINALISE — Collect slides, build dots, start autoplay
     ========================================================== */
  function finaliseCarousel() {
    slides = track.querySelectorAll('.hero-carousel__slide');

    if (slides.length <= 1) {
      // Only the default slide — hide nav, mark active
      carousel.classList.add('hero-carousel--single');
      if (slides[0]) slides[0].classList.add('active');
      return;
    }

    // Clone first and last slides for infinite loop
    if (isInfiniteLoop && slides.length > 1) {
      var firstClone = slides[0].cloneNode(true);
      var lastClone = slides[slides.length - 1].cloneNode(true);
      firstClone.classList.add('clone');
      lastClone.classList.add('clone');
      track.appendChild(firstClone);
      track.insertBefore(lastClone, slides[0]);
      
      // Re-collect slides after cloning
      slides = track.querySelectorAll('.hero-carousel__slide');
      currentIndex = 1; // Start at first real slide (after last clone)
      track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
    }

    // Build dots
    if (dotsWrap) {
      dotsWrap.innerHTML = '';
      for (var i = 0; i < slides.length; i++) {
        var dot = document.createElement('button');
        dot.className = 'hero-carousel__dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        dot.dataset.index = i;
        dot.addEventListener('click', onDotClick);
        dotsWrap.appendChild(dot);
      }
      dots = dotsWrap.querySelectorAll('.hero-carousel__dot');
    }

    // Arrow listeners
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);

    // Touch / swipe support
    addSwipeSupport();

    // Keyboard navigation
    carousel.setAttribute('tabindex', '0');
    carousel.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  { prevSlide(); e.preventDefault(); }
      if (e.key === 'ArrowRight') { nextSlide(); e.preventDefault(); }
    });

    // Pause on hover/focus
    carousel.addEventListener('mouseenter', stopAuto);
    carousel.addEventListener('mouseleave', startAuto);
    carousel.addEventListener('focusin',    stopAuto);
    carousel.addEventListener('focusout',   startAuto);

    // Start autoplay
    goToSlide(0, true);
    startAuto();
  }

  /* ==========================================================
     4.  NAVIGATION FUNCTIONS
     ========================================================== */
  function goToSlide(index, immediate) {
    if (isTransitioning && !immediate) return;

    currentIndex = index;

    // Move track
    if (immediate) {
      track.style.transition = 'none';
    } else {
      track.style.transition = 'transform 0.7s cubic-bezier(0.45, 0, 0.15, 1)';
      isTransitioning = true;
    }

    track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';

    // Update active class on slides (skip clones)
    for (var i = 0; i < slides.length; i++) {
      slides[i].classList.toggle('active', i === currentIndex);
    }

    // Update dots (map to real slide index)
    var realIndex = currentIndex - 1; // Adjust for first clone
    if (realIndex < 0) realIndex = slides.length - 3;
    if (realIndex >= slides.length - 2) realIndex = 0;
    
    for (var j = 0; j < dots.length; j++) {
      dots[j].classList.toggle('active', j === realIndex);
    }

    if (immediate) {
      // Force reflow then restore transitions
      void track.offsetHeight;
      track.style.transition = '';
    }

    // Clear transitioning flag after animation settles
    if (!immediate) {
      setTimeout(function () { 
        isTransitioning = false;
        
        // Check if we're at a clone and jump to real slide
        if (isInfiniteLoop) {
          if (currentIndex === 0) {
            // At last clone, jump to last real slide
            currentIndex = slides.length - 2;
            goToSlide(currentIndex, true);
          } else if (currentIndex === slides.length - 1) {
            // At first clone, jump to first real slide
            currentIndex = 1;
            goToSlide(currentIndex, true);
          }
        }
      }, 750);
    }
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
    resetAuto();
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
    resetAuto();
  }

  function onDotClick(e) {
    var idx = parseInt(e.currentTarget.dataset.index, 10);
    if (!isNaN(idx)) {
      goToSlide(idx);
      resetAuto();
    }
  }

  /* ==========================================================
     5.  AUTOPLAY
     ========================================================== */
  function startAuto() {
    stopAuto();
    autoTimer = setInterval(function () {
      goToSlide(currentIndex + 1);
    }, AUTO_INTERVAL);
  }

  function stopAuto() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  function resetAuto() {
    stopAuto();
    startAuto();
  }

  /* ==========================================================
     6.  TOUCH / SWIPE SUPPORT
     ========================================================== */
  function addSwipeSupport() {
    var startX = 0;
    var startY = 0;
    var distX  = 0;
    var distY  = 0;
    var threshold = 50;

    carousel.addEventListener('touchstart', function (e) {
      startX = e.changedTouches[0].clientX;
      startY = e.changedTouches[0].clientY;
    }, { passive: true });

    carousel.addEventListener('touchend', function (e) {
      distX = e.changedTouches[0].clientX - startX;
      distY = e.changedTouches[0].clientY - startY;

      // Only respond to horizontal swipes
      if (Math.abs(distX) > Math.abs(distY) && Math.abs(distX) > threshold) {
        if (distX < 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    }, { passive: true });
  }

  /* ==========================================================
     7.  HELPER UTILITIES
     ========================================================== */
  function escapeHTML(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeAttr(str) {
    if (!str) return '';
    return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/\(/g, '%28').replace(/\)/g, '%29');
  }

  function formatDate(isoStr) {
    if (!isoStr) return '';
    try {
      var d = new Date(isoStr);
      return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
      return '';
    }
  }

  /* ==========================================================
     8.  KICK OFF — Wait for DOM ready
     ========================================================== */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
