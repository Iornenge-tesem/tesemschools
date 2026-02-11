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
        return false;
      }
      
      if (!session) {
        // Not authenticated, redirect to login
        console.log('Not authenticated, redirecting to login...');
        window.location.href = 'login.html';
        return false;
      }
      
      // Authenticated, continue loading dashboard
      console.log('User authenticated:', session.user.email);
      
      // Update UI with user info
      const adminEmail = document.getElementById('adminEmail');
      const adminAvatar = document.getElementById('adminAvatar');
      if (adminEmail) adminEmail.textContent = session.user.email;
      if (adminAvatar) adminAvatar.textContent = session.user.email.charAt(0).toUpperCase();
      
      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      window.location.href = 'login.html';
      return false;
    }
  }
  
  // Run auth check and initialize dashboard when ready
  checkAuth().then((isAuthenticated) => {
    if (isAuthenticated) {
      init();
    }
  });

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
    'hero-backgrounds': { title: 'Hero Backgrounds', subtitle: 'Manage page hero section backgrounds' },
    contact:       { title: 'Contact Messages', subtitle: 'View and manage contact form submissions' },
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
    document.getElementById('annImageUrl').value    = '';
    resetImagePreview();

    if (data) {
      // Edit mode
      modalTitle.textContent = 'Edit Announcement';
      document.getElementById('announcementId').value = data.id;
      document.getElementById('annTitle').value       = data.title || '';
      document.getElementById('annContent').value     = data.content || '';
      document.getElementById('annPublished').checked  = data.is_published || false;

      // Show existing image if any
      if (data.image_url) {
        document.getElementById('annImageUrl').value = data.image_url;
        showImagePreview(data.image_url);
      }
    } else {
      modalTitle.textContent = 'New Announcement';
    }

    announcementModal.classList.add('show');
  }

  /* --- Announcement Image Upload Helpers --- */
  var annImageInput      = document.getElementById('annImage');
  var annImageUploadArea = document.getElementById('annImageUploadArea');
  var annImagePreview    = document.getElementById('annImagePreview');
  var annImagePreviewImg = document.getElementById('annImagePreviewImg');
  var annImagePlaceholder = document.getElementById('annImagePlaceholder');
  var annImageRemoveBtn  = document.getElementById('annImageRemove');

  // Click to browse
  if (annImagePlaceholder) {
    annImagePlaceholder.addEventListener('click', function () {
      if (annImageInput) annImageInput.click();
    });
  }

  // File selected
  if (annImageInput) {
    annImageInput.addEventListener('change', function () {
      if (annImageInput.files && annImageInput.files[0]) {
        handleAnnImageUpload(annImageInput.files[0]);
      }
    });
  }

  // Remove image
  if (annImageRemoveBtn) {
    annImageRemoveBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var currentUrl = document.getElementById('annImageUrl').value;
      if (currentUrl) {
        // Delete from storage
        var fileName = currentUrl.split('/').pop();
        if (fileName) {
          supabase.storage.from('announcements').remove([fileName]).catch(function () {});
        }
      }
      document.getElementById('annImageUrl').value = '';
      if (annImageInput) annImageInput.value = '';
      resetImagePreview();
    });
  }

  async function handleAnnImageUpload(file) {
    var allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      showToast('Only JPG, PNG, and WebP images are allowed.', 'warning');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be under 5MB.', 'warning');
      return;
    }

    var fileName = Date.now() + '_' + file.name.replace(/\s+/g, '_');

    try {
      showToast('Uploading image…', 'warning');
      var uploadResult = await supabase.storage
        .from('announcements')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadResult.error) throw uploadResult.error;

      var urlResult = supabase.storage.from('announcements').getPublicUrl(fileName);
      var publicUrl = urlResult.data.publicUrl;

      document.getElementById('annImageUrl').value = publicUrl;
      showImagePreview(publicUrl);
      showToast('Image uploaded!');
    } catch (err) {
      showToast(err.message || 'Image upload failed.', 'error');
    }
  }

  function showImagePreview(url) {
    if (annImagePreviewImg) annImagePreviewImg.src = url;
    if (annImagePreview) annImagePreview.style.display = 'block';
    if (annImagePlaceholder) annImagePlaceholder.style.display = 'none';
  }

  function resetImagePreview() {
    if (annImagePreviewImg) annImagePreviewImg.src = '';
    if (annImagePreview) annImagePreview.style.display = 'none';
    if (annImagePlaceholder) annImagePlaceholder.style.display = '';
  }

  function closeAnnouncementModal() {
    if (announcementModal) announcementModal.classList.remove('show');
  }

  // Save announcement (Create / Update)
  if (modalSave) {
    modalSave.addEventListener('click', async () => {
      const id          = document.getElementById('announcementId').value;
      const title       = document.getElementById('annTitle').value.trim();
      const content     = document.getElementById('annContent').value.trim();
      const isPublished = document.getElementById('annPublished').checked;
      const imageUrl    = document.getElementById('annImageUrl').value || null;

      // Validation
      if (!title || !content) {
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
            .update({ title, content, is_published: isPublished, image_url: imageUrl, updated_at: new Date().toISOString() })
            .eq('id', id);

          if (error) throw error;
          showToast('Announcement updated successfully.');
        } else {
          // INSERT new announcement
          const { error } = await supabase
            .from('announcements')
            .insert([{ title, content, is_published: isPublished, image_url: imageUrl }]);

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

        html += `
            <tr>
              <td><strong>${escapeHTML(item.title)}</strong></td>
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

  // Show/hide caption field based on location
  const uploadLocation = document.getElementById('uploadLocation');
  const captionContainer = document.getElementById('captionContainer');
  
  if (uploadLocation && captionContainer) {
    // Initially show caption only for gallery location
    const toggleCaptionField = () => {
      const isGallery = uploadLocation.value === 'gallery';
      captionContainer.style.display = isGallery ? 'block' : 'none';
    };
    
    toggleCaptionField(); // Set initial state
    uploadLocation.addEventListener('change', toggleCaptionField);
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

    const location = document.getElementById('uploadLocation')?.value || 'gallery';
    const caption = document.getElementById('imageCaption')?.value || '';
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

      // Insert record into gallery table with caption
      const { error: dbError } = await supabase
        .from('gallery')
        .insert([{ image_url: imageUrl, location: location, caption: caption }]);

      if (dbError) throw dbError;

      showToast('Image uploaded successfully!');
      loadGallery();
      loadDashboardStats();
    } catch (err) {
      showToast(err.message || 'Upload failed.', 'error');
    }

    // Reset file input and caption
    if (galleryFileInput) galleryFileInput.value = '';
    const captionInput = document.getElementById('imageCaption');
    if (captionInput) captionInput.value = '';
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

      grid.innerHTML = data.map(img => {
        const locationLabel = {
          'home_school': 'Home - School Building',
          'about_founders': 'About - Founders/Campus',
          'gallery': 'General Gallery'
        }[img.location] || img.location || 'Gallery';
        
        const captionDisplay = img.caption && img.caption.trim() !== ''
          ? `<div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,.7);color:#fff;padding:8px;font-size:.75rem;">${escapeHTML(img.caption)}</div>`
          : '';
        
        return `
        <div class="gallery-item">
          <img src="${escapeHTML(img.image_url)}" alt="${escapeHTML(img.caption || locationLabel)}" loading="lazy" />
          <div class="gallery-item__overlay">
            <span style="position:absolute;top:8px;left:8px;background:rgba(182,39,216,.9);color:#fff;padding:4px 10px;border-radius:4px;font-size:.7rem;font-weight:500;">${escapeHTML(locationLabel)}</span>
            ${captionDisplay}
            <div style="position:absolute;bottom:8px;right:8px;display:flex;gap:8px;">
              <button class="gallery-item__edit" 
                data-id="${img.id}" 
                data-url="${escapeHTML(img.image_url)}" 
                data-caption="${escapeHTML(img.caption || '')}" 
                data-location="${img.location}" 
                title="Replace image">
                ✏️
              </button>
              <button class="gallery-item__delete" onclick="deleteGalleryImage('${img.id}', '${extractFileName(img.image_url)}')" title="Delete image">
                🗑️
              </button>
            </div>
          </div>
        </div>
      `;
      }).join('');
      
      // Add event listeners for edit buttons
      grid.querySelectorAll('.gallery-item__edit').forEach(btn => {
        btn.addEventListener('click', function() {
          const id = this.dataset.id;
          const url = this.dataset.url;
          const caption = this.dataset.caption;
          const location = this.dataset.location;
          openReplaceModal(id, url, caption, location);
        });
      });
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

  // Open replace modal
  window.openReplaceModal = function(id, imageUrl, caption, location) {
    const modal = document.getElementById('replaceModal');
    const preview = document.getElementById('replacePreview');
    const idInput = document.getElementById('replaceImageId');
    const urlInput = document.getElementById('replaceOldUrl');
    const captionInput = document.getElementById('replaceCaption');
    const locationInput = document.getElementById('replaceLocation');
    const fileInput = document.getElementById('replaceFile');
    
    // Set values
    preview.src = imageUrl;
    idInput.value = id;
    urlInput.value = imageUrl;
    captionInput.value = caption;
    locationInput.value = location;
    fileInput.value = '';
    
    // Show modal
    modal.classList.add('active');
  };

  // Close replace modal
  window.closeReplaceModal = function() {
    const modal = document.getElementById('replaceModal');
    modal.classList.remove('active');
  };

  // Replace image
  window.replaceImage = async function() {
    const id = document.getElementById('replaceImageId').value;
    const oldUrl = document.getElementById('replaceOldUrl').value;
    const caption = document.getElementById('replaceCaption').value;
    const location = document.getElementById('replaceLocation').value;
    const fileInput = document.getElementById('replaceFile');
    
    if (!fileInput.files || !fileInput.files[0]) {
      showToast('Please select a new image.', 'error');
      return;
    }

    const file = fileInput.files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', 'error');
      return;
    }

    try {
      // Show loading state
      showToast('Replacing image...', 'info');
      
      // Generate new filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      // Upload new image to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL of new image
      const { data: urlData } = supabase.storage
        .from('gallery')
        .getPublicUrl(fileName);

      const newImageUrl = urlData.publicUrl;

      // Update database record
      const { error: updateError } = await supabase
        .from('gallery')
        .update({
          image_url: newImageUrl,
          caption: caption || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Delete old image from storage
      const oldFileName = extractFileName(oldUrl);
      if (oldFileName) {
        await supabase.storage.from('gallery').remove([oldFileName]);
      }

      showToast('✅ Image replaced successfully!');
      closeReplaceModal();
      loadGallery();
      loadDashboardStats();
    } catch (err) {
      console.error('Replace error:', err);
      showToast('Failed to replace image: ' + err.message, 'error');
    }
  };

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

      // Count contact messages (new only)
      const { count: contactCount } = await supabase
        .from('contact_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new');

      const statAnn = document.getElementById('statAnnouncements');
      const statGal = document.getElementById('statGallery');
      const statPub = document.getElementById('statPublished');
      const statContact = document.getElementById('statContact');

      if (statAnn) statAnn.textContent = annCount ?? 0;
      if (statGal) statGal.textContent = galCount ?? 0;
      if (statPub) statPub.textContent = pubCount ?? 0;
      if (statContact) {
        const count = contactCount ?? 0;
        statContact.innerHTML = count > 0 
          ? `<span style="color:#f59e0b;font-weight:700;">${count}</span> new`
          : '0';
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
     CONTACT MESSAGES — View & Manage
     ========================================================== */
  const contactStatusFilter = document.getElementById('contactStatusFilter');

  // Load contact messages
  async function loadContactMessages() {
    const container = document.getElementById('contactMessagesTable');
    if (!container) return;

    container.innerHTML = '<div class="page-loader"><div class="loading-spinner"></div></div>';

    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#9ca3af;font-size:.9rem;padding:40px 0;">No contact messages yet.</p>';
        return;
      }

      // Get filter value
      const filterStatus = contactStatusFilter ? contactStatusFilter.value : 'all';
      const filteredData = filterStatus === 'all' ? data : data.filter(m => m.status === filterStatus);

      if (filteredData.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#9ca3af;font-size:.9rem;padding:40px 0;">No messages with this status.</p>';
        return;
      }

      let html = `
        <table class="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Subject</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
      `;

      filteredData.forEach(msg => {
        const date = new Date(msg.created_at).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' });
        const statusColors = { new: '#3b82f6', read: '#f59e0b', replied: '#10b981' };
        const statusLabels = { new: 'New', read: 'Read', replied: 'Replied' };

        html += `
          <tr>
            <td><strong>${escapeHTML(msg.full_name)}</strong></td>
            <td>${escapeHTML(msg.email)}</td>
            <td>${escapeHTML(msg.subject)}</td>
            <td>${date}</td>
            <td><span class="badge" style="background:${statusColors[msg.status] || '#6b7280'};color:#fff;">${statusLabels[msg.status] || msg.status}</span></td>
            <td>
              <button class="admin-btn admin-btn--sm admin-btn--outline" onclick="viewContactMessage('${msg.id}')" title="View Details">
                👁️ View
              </button>
              <button class="admin-btn admin-btn--sm admin-btn--danger" onclick="deleteContactMessage('${msg.id}')" title="Delete">
                🗑️
              </button>
            </td>
          </tr>
        `;
      });

      html += '</tbody></table>';
      container.innerHTML = html;
    } catch (err) {
      container.innerHTML = `<p style="color:#dc2626;font-size:.85rem;">Error: ${err.message}</p>`;
    }
  }

  // View contact message details (modal)
  window.viewContactMessage = async function(id) {
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      const date = new Date(data.created_at).toLocaleString('en-NG');
      const message = `
📧 CONTACT MESSAGE

FROM: ${data.full_name}
EMAIL: ${data.email}
PHONE: ${data.phone || 'Not provided'}
SUBJECT: ${data.subject}
DATE: ${date}
STATUS: ${data.status.toUpperCase()}

MESSAGE:
${data.message}

---
Actions:
- Mark as Read
- Mark as Replied
- Delete
      `;

      if (confirm(message + '\n\nMark as read?')) {
        await supabase
          .from('contact_submissions')
          .update({ status: 'read' })
          .eq('id', id);
        
        showToast('Message marked as read.');
        loadContactMessages();
      }
    } catch (err) {
      showToast('Error loading message: ' + err.message, 'error');
    }
  };

  // Delete contact message
  window.deleteContactMessage = async function(id) {
    if (!confirm('Delete this message permanently?')) return;

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showToast('Message deleted successfully.');
      loadContactMessages();
    } catch (err) {
      showToast('Error deleting message: ' + err.message, 'error');
    }
  };

  // Filter change listener
  if (contactStatusFilter) {
    contactStatusFilter.addEventListener('change', loadContactMessages);
  }

  /* ==========================================================
     HERO BACKGROUNDS — CRUD
     ========================================================== */
  async function loadHeroBackgrounds() {
    const container = document.getElementById('heroBackgroundsGrid');
    if (!container) return;

    try {
      const { data, error } = await supabase
        .from('hero_backgrounds')
        .select('*')
        .order('page_name', { ascending: true });

      if (error) throw error;

      const pages = data && data.length > 0 ? data : [
        { page_name: 'about', image_url: null, is_active: true },
        { page_name: 'academics', image_url: null, is_active: true },
        { page_name: 'admissions', image_url: null, is_active: true },
        { page_name: 'contact', image_url: null, is_active: true }
      ];

      const pageLabels = {
        about: 'About Us',
        academics: 'Academics',
        admissions: 'Admissions',
        contact: 'Contact Us'
      };

      container.innerHTML = pages.map(page => `
        <div class="hero-bg-card">
          <div class="hero-bg-card__preview" style="background-image: ${page.image_url ? `url('${escapeHTML(page.image_url)}')` : 'linear-gradient(135deg, #b627d8 0%, #8b1fa8 100%)'}">
            ${!page.image_url ? '<div class="hero-bg-card__preview-text">Default Gradient</div>' : ''}
          </div>
          <div class="hero-bg-card__info">
            <h3>${pageLabels[page.page_name] || page.page_name}</h3>
            <p>${page.image_url ? 'Custom background active' : 'Using default gradient'}</p>
          </div>
          <div class="hero-bg-card__actions">
            <label class="admin-btn admin-btn--primary" style="cursor:pointer;margin:0;">
              ${page.image_url ? '🔄 Change' : '➕ Upload'}
              <input type="file" accept="image/*" style="display:none;" onchange="handleHeroImageUpload(event, '${page.page_name}')" />
            </label>
            ${page.image_url ? `<button class="admin-btn admin-btn--danger" onclick="removeHeroBackground('${page.page_name}')">🗑️ Remove</button>` : ''}
          </div>
        </div>
      `).join('');

    } catch (err) {
      console.error('Error loading hero backgrounds:', err);
      container.innerHTML = `<p style="color:#ef4444;">Failed to load hero backgrounds: ${escapeHTML(err.message)}</p>`;
    }
  }

  // Expose functions to global scope for onclick handlers
  window.handleHeroImageUpload = async function(event, pageName) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size must be less than 5MB', 'error');
      return;
    }

    try {
      showToast('Uploading...', 'warning');

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `pages/${pageName}-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('hero-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('hero-images')
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl;

      // Update database
      const { error: upsertError } = await supabase
        .from('hero_backgrounds')
        .upsert({
          page_name: pageName,
          image_url: imageUrl,
          is_active: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'page_name'
        });

      if (upsertError) throw upsertError;

      showToast('Hero background updated successfully', 'success');
      loadHeroBackgrounds();
    } catch (err) {
      console.error('Upload error:', err);
      showToast('Failed to upload image: ' + err.message, 'error');
    }

    // Reset file input
    event.target.value = '';
  };

  window.removeHeroBackground = async function(pageName) {
    if (!confirm('Remove this hero background? The page will use the default gradient.')) return;

    try {
      // Get current image URL to delete from storage
      const { data: currentData } = await supabase
        .from('hero_backgrounds')
        .select('image_url')
        .eq('page_name', pageName)
        .single();

      // Update database to remove image_url
      const { error: updateError } = await supabase
        .from('hero_backgrounds')
        .update({
          image_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('page_name', pageName);

      if (updateError) throw updateError;

      // Delete image from storage if it exists
      if (currentData && currentData.image_url) {
        try {
          const urlPath = new URL(currentData.image_url).pathname;
          const fileName = urlPath.split('/hero-images/').pop();
          if (fileName) {
            await supabase.storage
              .from('hero-images')
              .remove([fileName]);
          }
        } catch (storageErr) {
          console.warn('Failed to delete old image from storage:', storageErr);
        }
      }

      showToast('Hero background removed', 'success');
      loadHeroBackgrounds();
    } catch (err) {
      console.error('Error removing hero background:', err);
      showToast('Failed to remove background: ' + err.message, 'error');
    }
  };

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
  function init() {
    loadDashboardStats();
    loadRecentAnnouncements();
    loadAnnouncements();
    loadGallery();
    loadHeroBackgrounds();
    loadContactMessages();
    loadSettings();
  }

  // Note: init() is called by checkAuth() after authentication is confirmed

});
