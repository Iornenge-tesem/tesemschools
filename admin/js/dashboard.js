/* ============================================================
   DASHBOARD MODULE — CRUD Operations & UI Logic
   Manages announcements, gallery, settings, and navigation.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const supabase = window.supabaseClient;

  // Ensure supabase is loaded
  if (!supabase) {
    alert('Failed to initialize. Please refresh the page.');
    console.error('Supabase client not available');
    window.location.href = 'login.html';
    return;
  }

  console.log('Dashboard loaded, checking authentication...');

  /* ==========================================================
     SESSION CHECK — Redirect to login if not authenticated
     ========================================================== */
  async function checkAuth() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth check error:', error);
        window.location.href = 'login.html';
        return;
      }
      
      if (!session) {
        // Not authenticated, redirect to login
        console.log('Not authenticated, redirecting to login...');
        window.location.href = 'login.html';
        return;
      }
      
      // Authenticated, continue loading dashboard
      console.log('User authenticated:', session.user.email);
    } catch (error) {
      console.error('Auth check error:', error);
      window.location.href = 'login.html';
    }
  }
  
  // Run auth check immediately
  checkAuth();

  /* ==========================================================
     UTILITY: Toast Notifications
     ========================================================== */
  function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    const icons = { success: '✅', error: '❌', warning: '⚠️' };
    toast.innerHTML = `<span>${icons[type] || ''}</span> ${message}`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = '.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  /* ==========================================================
     SIDEBAR NAVIGATION
     ========================================================== */
  const sidebarLinks  = document.querySelectorAll('.sidebar__link[data-section]');
  const sections      = document.querySelectorAll('.admin-section');
  const pageTitle     = document.getElementById('pageTitle');
  const pageSubtitle  = document.getElementById('pageSubtitle');
  const sidebar       = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');

  const sectionMeta = {
    dashboard:     { title: 'Dashboard',     subtitle: 'Overview of your school system' },
    announcements: { title: 'Announcements', subtitle: 'Manage school announcements' },
    gallery:       { title: 'Gallery',        subtitle: 'Upload and manage images' },
    settings:      { title: 'Site Settings',  subtitle: 'Configure website options' },
  };

  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.dataset.section;

      // Update active link
      sidebarLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      // Show target section
      sections.forEach(s => s.classList.remove('active'));
      const sec = document.getElementById(`sec-${target}`);
      if (sec) sec.classList.add('active');

      // Update top bar
      const meta = sectionMeta[target] || {};
      if (pageTitle) pageTitle.textContent = meta.title || target;
      if (pageSubtitle) pageSubtitle.textContent = meta.subtitle || '';

      // Close sidebar on mobile
      if (sidebar) sidebar.classList.remove('open');
    });
  });

  // Mobile sidebar toggle
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  /* ==========================================================
     ANNOUNCEMENTS — CRUD
     ========================================================== */
  const addAnnouncementBtn = document.getElementById('addAnnouncementBtn');
  const announcementModal  = document.getElementById('announcementModal');
  const modalClose         = document.getElementById('modalClose');
  const modalCancel        = document.getElementById('modalCancel');
  const modalSave          = document.getElementById('modalSave');
  const modalTitle         = document.getElementById('modalTitle');
  const announcementForm   = document.getElementById('announcementForm');

  // Open modal for new announcement
  if (addAnnouncementBtn) {
    addAnnouncementBtn.addEventListener('click', () => {
      openAnnouncementModal();
    });
  }

  // Close modal handlers
  [modalClose, modalCancel].forEach(el => {
    if (el) el.addEventListener('click', closeAnnouncementModal);
  });

  if (announcementModal) {
    announcementModal.addEventListener('click', (e) => {
      if (e.target === announcementModal) closeAnnouncementModal();
    });
  }

  function openAnnouncementModal(data = null) {
    if (!announcementModal) return;

    // Reset form
    if (announcementForm) announcementForm.reset();
    document.getElementById('announcementId').value = '';

    if (data) {
      // Edit mode
      modalTitle.textContent = 'Edit Announcement';
      document.getElementById('announcementId').value = data.id;
      document.getElementById('annTitle').value       = data.title || '';
      document.getElementById('annType').value        = data.type || '';
      document.getElementById('annContent').value     = data.content || '';
      document.getElementById('annPublished').checked  = data.is_published || false;
    } else {
      modalTitle.textContent = 'New Announcement';
    }

    announcementModal.classList.add('show');
  }

  function closeAnnouncementModal() {
    if (announcementModal) announcementModal.classList.remove('show');
  }

  // Save announcement (Create / Update)
  if (modalSave) {
    modalSave.addEventListener('click', async () => {
      const id          = document.getElementById('announcementId').value;
      const title       = document.getElementById('annTitle').value.trim();
      const type        = document.getElementById('annType').value;
      const content     = document.getElementById('annContent').value.trim();
      const isPublished = document.getElementById('annPublished').checked;

      // Validation
      if (!title || !type || !content) {
        showToast('Please fill in all required fields.', 'warning');
        return;
      }

      modalSave.disabled = true;
      modalSave.innerHTML = '<span class="loading-spinner"></span>';

      try {
        if (id) {
          // UPDATE existing announcement
          const { error } = await supabase
            .from('announcements')
            .update({ title, type, content, is_published: isPublished, updated_at: new Date().toISOString() })
            .eq('id', id);

          if (error) throw error;
          showToast('Announcement updated successfully.');
        } else {
          // INSERT new announcement
          const { error } = await supabase
            .from('announcements')
            .insert([{ title, type, content, is_published: isPublished }]);

          if (error) throw error;
          showToast('Announcement created successfully.');
        }

        closeAnnouncementModal();
        loadAnnouncements();
        loadDashboardStats();
      } catch (err) {
        showToast(err.message || 'Failed to save announcement.', 'error');
      } finally {
        modalSave.disabled = false;
        modalSave.innerHTML = '💾 Save';
      }
    });
  }

  // Load announcements into table
  async function loadAnnouncements() {
    const container = document.getElementById('announcementsTable');
    if (!container) return;

    container.innerHTML = '<div class="page-loader"><div class="loading-spinner"></div></div>';

    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        container.innerHTML = '<p style="color:#4b5563;font-size:.9rem;">No announcements yet. Click "New Announcement" to create one.</p>';
        return;
      }

      let html = `
        <table class="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>`;

      data.forEach(item => {
        const date   = new Date(item.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
        const status = item.is_published
          ? '<span class="badge badge--published">Published</span>'
          : '<span class="badge badge--draft">Draft</span>';
        const typeLabel = item.type ? item.type.replace('_', ' ') : '—';

        html += `
            <tr>
              <td><strong>${escapeHTML(item.title)}</strong></td>
              <td style="text-transform:capitalize;">${escapeHTML(typeLabel)}</td>
              <td>${status}</td>
              <td>${date}</td>
              <td>
                <div class="actions">
                  <button class="admin-btn admin-btn--outline admin-btn--sm" onclick="editAnnouncement('${item.id}')">✏️ Edit</button>
                  <button class="admin-btn admin-btn--danger admin-btn--sm" onclick="deleteAnnouncement('${item.id}')">🗑️</button>
                </div>
              </td>
            </tr>`;
      });

      html += '</tbody></table>';
      container.innerHTML = html;
    } catch (err) {
      container.innerHTML = `<p style="color:#dc2626;font-size:.85rem;">Error: ${err.message}</p>`;
    }
  }

  // Edit announcement — fetch by ID and open modal
  window.editAnnouncement = async function (id) {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      openAnnouncementModal(data);
    } catch (err) {
      showToast('Failed to load announcement.', 'error');
    }
  };

  // Delete announcement
  window.deleteAnnouncement = async function (id) {
    if (!confirm('Are you sure you want to delete this announcement? This cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showToast('Announcement deleted.');
      loadAnnouncements();
      loadDashboardStats();
    } catch (err) {
      showToast('Failed to delete announcement.', 'error');
    }
  };

  /* ==========================================================
     GALLERY — Upload & Delete
     ========================================================== */
  const uploadArea      = document.getElementById('uploadArea');
  const galleryFileInput = document.getElementById('galleryFileInput');

  if (uploadArea && galleryFileInput) {
    uploadArea.addEventListener('click', () => galleryFileInput.click());

    // Drag & drop support
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = '#b627d8';
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.style.borderColor = '';
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = '';
      if (e.dataTransfer.files.length > 0) {
        handleFileUpload(e.dataTransfer.files[0]);
      }
    });

    galleryFileInput.addEventListener('change', () => {
      if (galleryFileInput.files.length > 0) {
        handleFileUpload(galleryFileInput.files[0]);
      }
    });
  }

  async function handleFileUpload(file) {
    // Validate file
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      showToast('Only JPG, PNG, and WebP images are allowed.', 'warning');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must not exceed 5MB.', 'warning');
      return;
    }

    const category = document.getElementById('uploadCategory')?.value || 'campus';
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

    showToast('Uploading image…', 'warning');

    try {
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('gallery')
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl;

      // Insert record into gallery table
      const { error: dbError } = await supabase
        .from('gallery')
        .insert([{ image_url: imageUrl, category }]);

      if (dbError) throw dbError;

      showToast('Image uploaded successfully!');
      loadGallery();
      loadDashboardStats();
    } catch (err) {
      showToast(err.message || 'Upload failed.', 'error');
    }

    // Reset file input
    if (galleryFileInput) galleryFileInput.value = '';
  }

  // Load gallery images
  async function loadGallery() {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;

    grid.innerHTML = '<div class="page-loader"><div class="loading-spinner"></div></div>';

    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        grid.innerHTML = '<p style="color:#4b5563;font-size:.9rem;">No images uploaded yet.</p>';
        return;
      }

      grid.innerHTML = data.map(img => `
        <div class="gallery-item">
          <img src="${escapeHTML(img.image_url)}" alt="${escapeHTML(img.category || 'Gallery image')}" loading="lazy" />
          <div class="gallery-item__overlay">
            <button class="gallery-item__delete" onclick="deleteGalleryImage('${img.id}', '${extractFileName(img.image_url)}')" title="Delete image">
              🗑️
            </button>
          </div>
        </div>
      `).join('');
    } catch (err) {
      grid.innerHTML = `<p style="color:#dc2626;font-size:.85rem;">Error: ${err.message}</p>`;
    }
  }

  // Delete gallery image
  window.deleteGalleryImage = async function (id, fileName) {
    if (!confirm('Delete this image permanently?')) return;

    try {
      // Remove from storage
      if (fileName) {
        await supabase.storage.from('gallery').remove([fileName]);
      }

      // Remove from database
      const { error } = await supabase
        .from('gallery')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showToast('Image deleted.');
      loadGallery();
      loadDashboardStats();
    } catch (err) {
      showToast('Failed to delete image.', 'error');
    }
  };

  // Extract file name from URL for storage deletion
  function extractFileName(url) {
    try {
      const parts = url.split('/');
      return parts[parts.length - 1];
    } catch {
      return '';
    }
  }

  /* ==========================================================
     SITE SETTINGS — Toggle Admission, Resumption Date
     ========================================================== */
  const settingsForm    = document.getElementById('settingsForm');
  const admissionToggle = document.getElementById('admissionToggle');
  const admissionLabel  = document.getElementById('admissionLabel');
  const resumptionDate  = document.getElementById('resumptionDate');

  // Update toggle label text
  if (admissionToggle && admissionLabel) {
    admissionToggle.addEventListener('change', () => {
      admissionLabel.textContent = admissionToggle.checked ? 'Open' : 'Closed';
    });
  }

  // Load settings
  async function loadSettings() {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        if (admissionToggle) {
          admissionToggle.checked = data.admission_open || false;
          if (admissionLabel) admissionLabel.textContent = data.admission_open ? 'Open' : 'Closed';
        }
        if (resumptionDate && data.resumption_date) {
          resumptionDate.value = data.resumption_date;
        }
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  }

  // Save settings
  if (settingsForm) {
    settingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const admissionOpen  = admissionToggle ? admissionToggle.checked : false;
      const resDate        = resumptionDate ? resumptionDate.value : null;

      try {
        // Check if row exists
        const { data: existing } = await supabase
          .from('site_settings')
          .select('id')
          .limit(1)
          .single();

        if (existing) {
          // Update
          const { error } = await supabase
            .from('site_settings')
            .update({ admission_open: admissionOpen, resumption_date: resDate, updated_at: new Date().toISOString() })
            .eq('id', existing.id);

          if (error) throw error;
        } else {
          // Insert
          const { error } = await supabase
            .from('site_settings')
            .insert([{ admission_open: admissionOpen, resumption_date: resDate }]);

          if (error) throw error;
        }

        showToast('Settings saved successfully.');
        loadDashboardStats();
      } catch (err) {
        showToast(err.message || 'Failed to save settings.', 'error');
      }
    });
  }

  /* ==========================================================
     DASHBOARD STATS
     ========================================================== */
  async function loadDashboardStats() {
    try {
      // Count announcements
      const { count: annCount } = await supabase
        .from('announcements')
        .select('*', { count: 'exact', head: true });

      // Count published
      const { count: pubCount } = await supabase
        .from('announcements')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);

      // Count gallery
      const { count: galCount } = await supabase
        .from('gallery')
        .select('*', { count: 'exact', head: true });

      // Admission status
      const { data: settings } = await supabase
        .from('site_settings')
        .select('admission_open')
        .limit(1)
        .single();

      const statAnn = document.getElementById('statAnnouncements');
      const statGal = document.getElementById('statGallery');
      const statPub = document.getElementById('statPublished');
      const statAdm = document.getElementById('statAdmission');

      if (statAnn) statAnn.textContent = annCount ?? 0;
      if (statGal) statGal.textContent = galCount ?? 0;
      if (statPub) statPub.textContent = pubCount ?? 0;
      if (statAdm) {
        const isOpen = settings?.admission_open;
        statAdm.innerHTML = isOpen
          ? '<span class="badge badge--open">Open</span>'
          : '<span class="badge badge--closed">Closed</span>';
      }
    } catch (err) {
      console.error('Stats error:', err);
    }
  }

  // Load recent announcements on dashboard
  async function loadRecentAnnouncements() {
    const container = document.getElementById('recentAnnouncements');
    if (!container) return;

    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      if (!data || data.length === 0) {
        container.innerHTML = '<p style="color:#4b5563;font-size:.9rem;">No announcements to display.</p>';
        return;
      }

      container.innerHTML = data.map(item => {
        const date   = new Date(item.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
        const status = item.is_published
          ? '<span class="badge badge--published">Published</span>'
          : '<span class="badge badge--draft">Draft</span>';

        return `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #e5e7eb;">
            <div>
              <strong style="font-size:.9rem;">${escapeHTML(item.title)}</strong>
              <span style="font-size:.78rem;color:#4b5563;margin-left:8px;text-transform:capitalize;">${escapeHTML((item.type || '').replace('_', ' '))}</span>
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              ${status}
              <span style="font-size:.78rem;color:#9ca3af;">${date}</span>
            </div>
          </div>`;
      }).join('');
    } catch (err) {
      container.innerHTML = `<p style="color:#dc2626;font-size:.85rem;">Error loading announcements.</p>`;
    }
  }

  /* ==========================================================
     UTILITY: Escape HTML to prevent XSS
     ========================================================== */
  function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ==========================================================
     LOGOUT HANDLER
     ========================================================== */
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        // Redirect to login page
        window.location.href = 'login.html';
      } catch (error) {
        console.error('Logout error:', error);
        showToast('Error signing out. Please try again.', 'error');
      }
    });
  }

  /* ==========================================================
     INITIALIZE — Load all data on page ready
     ========================================================== */
  async function init() {
    // Wait for auth check before loading data
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    loadDashboardStats();
    loadRecentAnnouncements();
    loadAnnouncements();
    loadGallery();
    loadSettings();
  }

  init();

});
