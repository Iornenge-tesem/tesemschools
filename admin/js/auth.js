/* ============================================================
   AUTHENTICATION LOGIC — Login & Session Management
   Tesem Model Schools Admin Panel
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const loginBtn = document.getElementById('loginBtn');
  const loginError = document.getElementById('loginError');

  // Check if user is already logged in
  checkSession();

  // Handle login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault(); // Prevent form from submitting via GET
      
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      // Validation
      if (!email || !password) {
        showError('Please enter both email and password');
        return;
      }

      // Disable button during login
      loginBtn.disabled = true;
      loginBtn.textContent = 'Signing in...';
      clearError();

      try {
        // Attempt login with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password
        });

        if (error) {
          throw error;
        }

        // Success - redirect to dashboard
        console.log('Login successful:', data);
        window.location.href = 'dashboard.html';

      } catch (error) {
        console.error('Login error:', error);
        showError(error.message || 'Invalid email or password. Please try again.');
        
        // Re-enable button
        loginBtn.disabled = false;
        loginBtn.textContent = 'Sign In';
      }
    });
  }

  /* ==========================================================
     CHECK SESSION — Redirect if already logged in
     ========================================================== */
  async function checkSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Already logged in, redirect to dashboard
        window.location.href = 'dashboard.html';
      }
    } catch (error) {
      console.error('Session check error:', error);
    }
  }

  /* ==========================================================
     SHOW ERROR MESSAGE
     ========================================================== */
  function showError(message) {
    if (loginError) {
      loginError.textContent = message;
      loginError.style.display = 'block';
    }
  }

  /* ==========================================================
     CLEAR ERROR MESSAGE
     ========================================================== */
  function clearError() {
    if (loginError) {
      loginError.textContent = '';
      loginError.style.display = 'none';
    }
  }
});
