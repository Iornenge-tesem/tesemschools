/* ============================================================
   TESEM MODEL SCHOOLS — Main JavaScript
   Handles: Navigation, Scroll Effects, Tabs, Form Validation
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------------------------------------------
     1. MOBILE NAVIGATION TOGGLE
     ---------------------------------------------------------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ----------------------------------------------------------
     2. HEADER SCROLL SHADOW
     ---------------------------------------------------------- */
  const header = document.getElementById('header');

  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  /* ----------------------------------------------------------
     3. SUBJECT TABS (Academics Page)
     ---------------------------------------------------------- */
  const tabButtons = document.querySelectorAll('.subjects__tab');
  const tabPanels  = document.querySelectorAll('.subjects__panel');

  if (tabButtons.length > 0) {
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-tab');

        // Update active tab button
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Show corresponding panel
        tabPanels.forEach(panel => {
          panel.classList.remove('active');
          if (panel.getAttribute('data-panel') === target) {
            panel.classList.add('active');
          }
        });
      });
    });
  }

  /* ----------------------------------------------------------
     4. CONTACT FORM VALIDATION
     ---------------------------------------------------------- */
  const contactForm   = document.getElementById('contactForm');
  const formSuccess   = document.getElementById('formSuccess');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      // Clear previous errors
      contactForm.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('error');
      });

      // Validate Full Name
      const name = contactForm.querySelector('#fullName');
      if (name && name.value.trim().length < 2) {
        showError(name, 'Please enter your full name.');
        isValid = false;
      }

      // Validate Email
      const email = contactForm.querySelector('#email');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email && !emailRegex.test(email.value.trim())) {
        showError(email, 'Please enter a valid email address.');
        isValid = false;
      }

      // Validate Phone (optional but if filled, must be valid)
      const phone = contactForm.querySelector('#phone');
      if (phone && phone.value.trim() !== '') {
        const phoneRegex = /^[\d\s+()-]{7,20}$/;
        if (!phoneRegex.test(phone.value.trim())) {
          showError(phone, 'Please enter a valid phone number.');
          isValid = false;
        }
      }

      // Validate Subject
      const subject = contactForm.querySelector('#subject');
      if (subject && subject.value.trim().length < 2) {
        showError(subject, 'Please enter a subject.');
        isValid = false;
      }

      // Validate Message
      const message = contactForm.querySelector('#message');
      if (message && message.value.trim().length < 10) {
        showError(message, 'Message must be at least 10 characters.');
        isValid = false;
      }

      // If valid, show success and reset
      if (isValid) {
        contactForm.reset();
        if (formSuccess) {
          formSuccess.classList.add('show');
          setTimeout(() => formSuccess.classList.remove('show'), 5000);
        }
      }
    });
  }

  /**
   * Shows an error message below a form field.
   * @param {HTMLElement} input  – The input element.
   * @param {string}      msg   – The error message.
   */
  function showError(input, msg) {
    const group = input.closest('.form-group');
    if (!group) return;
    group.classList.add('error');
    const errorEl = group.querySelector('.error-message');
    if (errorEl) errorEl.textContent = msg;
  }

  /* ----------------------------------------------------------
     5. SMOOTH SCROLL FOR ANCHOR LINKS
     ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ----------------------------------------------------------
     6. SCROLL-REVEAL ANIMATION (lightweight)
     ---------------------------------------------------------- */
  const revealElements = document.querySelectorAll(
    '.level-card, .why-card, .vmv-card, .method-card, .extra-item, .req-card, .step, .calendar-card'
  );

  if (revealElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity .6s ease, transform .6s ease';
      observer.observe(el);
    });
  }

});
