/* ============================================================
   AUTHENTICATION LOGIC — Login & Session Management
   Tesem Model Schools Admin Panel
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const loginBtn = document.getElementById('loginBtn');
  const loginError = document.getElementById('loginError');

  // Wait for supabase to be initialized
  if (typeof supabase === 'undefined' || !supabase) {
    showError('Failed to initialize authentication. Please refresh the page.');
    return;
  }

  // Check if user is already logged in
  checkSession();

  // Handle login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  /* ==========================================================
     HANDLE LOGIN
     ========================================================== */
  async function handleLogin(e) {
    e.preventDefault(); // Prevent form from submitting via GET
    e.stopPropagation(); // Stop event bubbling
    
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
      console.log('Login successful:', data.user.email);
      window.location.href = 'dashboard.html';

    } catch (error) {
      console.error('Login error:', error);
      showError(error.message || 'Invalid email or password. Please try again.');
      
      // Re-enable button
      loginBtn.disabled = false;
      loginBtn.textContent = 'Sign In';
    }
  }

  /* ==========================================================
     CHECK SESSION — Redirect if already logged in
     ========================================================== */
  async function checkSession() {
    if (!supabase || !supabase.auth) {
      console.error('Supabase client not initialized');
      return;
    }

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session check error:', error);
        return;
      }
      
      if (session) {
        // Already logged in, redirect to dashboard
        console.log('Already authenticated, redirecting...');
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
