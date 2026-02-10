/* ============================================================
   AUTHENTICATION LOGIC — Login & Session Management
   Tesem Model Schools Admin Panel
   Version: 2.0 (Fixed duplicate declaration and form submission)
   ============================================================ */

(function() {
  'use strict';
  
  // Wait for DOM and Supabase
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  function init() {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const loginError = document.getElementById('loginError');

    // Check Supabase availability
    if (!window.supabaseClient) {
      showError('Failed to initialize authentication. Please refresh the page.');
      console.error('Supabase client not available');
      return;
    }

    console.log('Auth module loaded, checking session...');

    // Check if user is already logged in
    checkSession();

    // Handle login form submission
    if (loginForm) {
      loginForm.addEventListener('submit', handleLogin);
      
      // Also prevent any form submission attempts
      loginForm.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleLogin(e);
        }
      });
    }
  }

  /* ==========================================================
     HANDLE LOGIN
     ========================================================== */
  function handleLogin(e) {
    e.preventDefault(); // Prevent form from submitting via GET
    e.stopPropagation(); // Stop event bubbling
    
    const loginBtn = document.getElementById('loginBtn');
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Validation
    if (!email || !password) {
      showError('Please enter both email and password');
      return false;
    }

    // Disable button during login
    loginBtn.disabled = true;
    loginBtn.textContent = 'Signing in...';
    clearError();

    // Perform login
    window.supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    })
    .then(({ data, error }) => {
      if (error) {
        throw error;
      }

      // Success - redirect to dashboard
      console.log('Login successful:', data.user.email);
      window.location.href = 'dashboard.html';
    })
    .catch((error) => {
      console.error('Login error:', error);
      showError(error.message || 'Invalid email or password. Please try again.');
      
      // Re-enable button
      loginBtn.disabled = false;
      loginBtn.textContent = 'Sign In';
    });
    
    return false; // Prevent any form submission
  }

  /* ==========================================================
     CHECK SESSION — Redirect if already logged in
     ========================================================== */
  function checkSession() {
    if (!window.supabaseClient || !window.supabaseClient.auth) {
      console.error('Supabase client not initialized');
      return;
    }

    window.supabaseClient.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error('Session check error:', error);
          return;
        }
        
        if (session) {
          // Already logged in, redirect to dashboard
          console.log('Already authenticated, redirecting...');
          window.location.href = 'dashboard.html';
        }
      })
      .catch((error) => {
        console.error('Session check error:', error);
      });
  }

  /* ==========================================================
     SHOW ERROR MESSAGE
     ========================================================== */
  function showError(message) {
    const loginError = document.getElementById('loginError');
    if (loginError) {
      loginError.textContent = message;
      loginError.style.display = 'block';
    }
  }

  /* ==========================================================
     CLEAR ERROR MESSAGE
     ========================================================== */
  function clearError() {
    const loginError = document.getElementById('loginError');
    if (loginError) {
      loginError.textContent = '';
      loginError.style.display = 'none';
    }
  }
})(); // End IIFE
