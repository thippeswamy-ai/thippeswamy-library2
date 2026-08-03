// Admin Dashboard Logic & State Management
document.addEventListener('DOMContentLoaded', () => {
  let adminToken = localStorage.getItem('arts_lib_token') || null;
  let currentUser = JSON.parse(localStorage.getItem('arts_lib_user') || 'null');

  // Views
  const studentView = document.getElementById('studentView');
  const adminDashboardView = document.getElementById('adminDashboardView');

  // Nav Button & Modal
  const adminLoginToggleBtn = document.getElementById('adminLoginToggleBtn');
  const adminBtnText = document.getElementById('adminBtnText');
  const adminLoginModal = document.getElementById('adminLoginModal');
  const closeAdminLoginModal = document.getElementById('closeAdminLoginModal');
  const adminLoginForm = document.getElementById('adminLoginForm');
  const logoutBtn = document.getElementById('logoutBtn');
  const adminWelcomeUser = document.getElementById('adminWelcomeUser');

  // Tabs
  const adminTabs = document.querySelectorAll('.admin-tab');
  const tabContents = document.querySelectorAll('.tab-content');
  const superAdminTabBtn = document.getElementById('superAdminTabBtn');

  // Book Form Modal
  const bookFormModal = document.getElementById('bookFormModal');
  const addNewBookBtn = document.getElementById('addNewBookBtn');
  const closeBookFormModal = document.getElementById('closeBookFormModal');
  const cancelBookFormModal = document.getElementById('cancelBookFormModal');
  const bookForm = document.getElementById('bookForm');
  const bookFormModalTitle = document.getElementById('bookFormModalTitle');

  // Super Admin Modal
  const createAdminModal = document.getElementById('createAdminModal');
  const openCreateAdminModalBtn = document.getElementById('openCreateAdminModalBtn');
  const closeCreateAdminModal = document.getElementById('closeCreateAdminModal');
  const cancelCreateAdminModal = document.getElementById('cancelCreateAdminModal');
  const createAdminForm = document.getElementById('createAdminForm');

  // Table Bodies
  const adminBooksTableBody = document.getElementById('adminBooksTableBody');
  const adminRequestsTableBody = document.getElementById('adminRequestsTableBody');
  const superAdminTableBody = document.getElementById('superAdminTableBody');

  // Request Search & Filter
  const requestSearchInput = document.getElementById('requestSearchInput');
  const requestStatusFilter = document.getElementById('requestStatusFilter');

  // Check login state on load
  if (adminToken && currentUser) {
    showDashboardView();
  }

  // Toggle Admin Login Modal / View
  adminLoginToggleBtn.addEventListener('click', () => {
    if (adminToken) {
      if (adminDashboardView.style.display === 'none') {
        showDashboardView();
      } else {
        hideDashboardView();
      }
    } else {
      adminLoginModal.classList.add('active');
    }
  });

  closeAdminLoginModal.addEventListener('click', () => {
    adminLoginModal.classList.remove('active');
  });

  // Admin Login Handler
  adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const usernameInput = document.getElementById('loginUsername').value.trim();
    const passwordInput = document.getElementById('loginPassword').value;

    try {
      const res = await API.login(usernameInput, passwordInput);
      if (res.token) {
        adminToken = res.token;
        currentUser = res.user;
        localStorage.setItem('arts_lib_token', adminToken);
        localStorage.setItem('arts_lib_user', JSON.stringify(currentUser));
        
        showToast(`Welcome back, ${currentUser.fullName}!`);
        adminLoginForm.reset();
        adminLoginModal.classList.remove('active');
        showDashboardView();
      } else {
        showToast(res.message || 'Login failed', 'error');
      }
    } catch (err) {
      showToast('Login request failed', 'error');
    }
  });

  // Logout Handler
  logoutBtn.addEventListener('click', () => {
    adminToken = null;
    currentUser = null;
    localStorage.removeItem('arts_lib_token');
    localStorage.removeItem('arts_lib_user');
    showToast('Logged out of Admin Dashboard');
    hideDashboardView();
  });

  function showDashboardView() {
    studentView.style.display = 'none';
    adminDashboardView.style.display = 'block';
    adminBtnText.textContent = 'Go to Home Portal';

    adminWelcomeUser.textContent = `Logged in as: ${currentUser.fullName} (${currentUser.role.toUpperCase()})`;

    if (currentUser.role === 'superadmin') {
      superAdminTabBtn.style.display = 'inline-block';
    } else {
      superAdminTabBtn.style.display = 'none';
    }

    loadDashboardStats();
    loadAdminBooks();
    loadAdminRequests();
    if (currentUser.role === 'superadmin') {
      loadSuperAdminAdmins();
    }
  }

  function hideDashboardView() {
    adminDashboardView.style.display = 'none';
    studentView.style.display = 'block';
    adminBtnText.textContent = adminToken ? 'Admin Dashboard' : 'Admin Login';
    if (window.refreshStudentView) window.refreshStudentView();
  }

  // Dashboard Stats
  async function loadDashboardStats() {
    try {
      const bookStats = await API.getBookStats();
      document.getElementById('statTotalBooks').textContent = bookStats.totalBooks || 0;

      const reqStats = await API.getRequestStats(adminToken);
      document.getElementById('statTotalRequests').textContent = reqStats.totalRequests || 0;
      document.getElementById('statPendingRequests').textContent = reqStats.pendingRequests || 0;
      document.getElementById('statApprovedRequests').textContent = reqStats.approvedRequests || 0;
    } catch (e) {
      console.error(e);
    }
  }

  // Admin Tabs Switcher
  adminTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      adminTabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.style.display = 'none');
      
      tab.classList.add('active');
      const targetId = tab.getAttribute('data-tab');
      document.getElementById(targetId).style.display = 'block';
    });
  });

  // MANAGE BOOKS
  async function loadAdminBooks() {
    try {
      const books = await API.getBooks();
      renderAdminBooks(books);
    } catch (e) {
      adminBooksTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--danger)">Error loading books</td></tr>`;
    }
  }

  function renderAdminBooks(books) {
    if (!books || books.length === 0) {
      adminBooksTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:2rem;">No books found in catalog.</td></tr>`;
      return;
    }

    adminBooksTableBody.innerHTML = books.map(b => {
      const loc = b.location || {};
      const defaultImg = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
      return `
        <tr>
          <td><img src="${b.coverImage || defaultImg}" style="width:40px; height:50px; object-fit:cover; border-radius:4px;" onerror="this.src='${defaultImg}'"></td>
          <td><strong>${b.title}</strong></td>
          <td>${b.author}</td>
          <td><span class="status-badge" style="background:#f1f5f9;">${b.category}</span></td>
          <td>₹${b.price || 0}</td>
          <td style="font-size:0.8rem; line-height:1.3;">
            Floor: <strong>${loc.floor}</strong> | Sec: <strong>${loc.section}</strong><br>
            Rack: <strong>${loc.rack}</strong> | Shelf: <strong>${loc.shelf}</strong> | Row: <strong>${loc.row}</strong>
          </td>
          <td>
            <span class="status-badge ${b.availability === 'Available' ? 'status-Available' : 'status-Rejected'}">
              ${b.availability}
            </span>
          </td>
          <td>
            <button class="btn btn-secondary" onclick="editBook('${b._id}')" style="padding:0.35rem 0.65rem; font-size:0.8rem;"><i class="fa-solid fa-pen"></i></button>
            <button class="btn btn-danger" onclick="deleteBook('${b._id}')" style="padding:0.35rem 0.65rem; font-size:0.8rem;"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Add / Edit Book Modal Logic
  addNewBookBtn.addEventListener('click', () => {
    bookForm.reset();
    document.getElementById('bookIdInput').value = '';
    bookFormModalTitle.innerHTML = `<i class="fa-solid fa-book-medical"></i> Add New Book`;
    bookFormModal.classList.add('active');
  });

  const closeBookModal = () => bookFormModal.classList.remove('active');
  closeBookFormModal.addEventListener('click', closeBookModal);
  cancelBookFormModal.addEventListener('click', closeBookModal);

  bookForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const bookId = document.getElementById('bookIdInput').value;

    const formData = new FormData();
    formData.append('title', document.getElementById('bookTitle').value.trim());
    formData.append('author', document.getElementById('bookAuthor').value.trim());
    formData.append('category', document.getElementById('bookCategory').value);
    formData.append('price', document.getElementById('bookPrice').value);
    formData.append('availability', document.getElementById('bookAvailability').value);
    formData.append('description', document.getElementById('bookDescription').value.trim());

    const coverFile = document.getElementById('bookCoverFile').files[0];
    const coverUrl = document.getElementById('bookCoverUrl').value.trim();
    if (coverFile) {
      formData.append('coverImageFile', coverFile);
    } else if (coverUrl) {
      formData.append('coverImage', coverUrl);
    }

    const locationObj = {
      floor: document.getElementById('locFloor').value.trim(),
      section: document.getElementById('locSection').value.trim(),
      rack: document.getElementById('locRack').value.trim(),
      shelf: document.getElementById('locShelf').value.trim(),
      row: document.getElementById('locRow').value.trim()
    };
    formData.append('location', JSON.stringify(locationObj));

    try {
      let res;
      if (bookId) {
        res = await API.updateBook(bookId, formData, adminToken);
      } else {
        res = await API.addBook(formData, adminToken);
      }

      showToast(res.message || 'Book saved successfully');
      closeBookModal();
      loadDashboardStats();
      loadAdminBooks();
    } catch (err) {
      showToast('Error saving book record', 'error');
    }
  });

  window.editBook = async (id) => {
    try {
      const book = await API.getBookById(id);
      if (!book) return;
      document.getElementById('bookIdInput').value = book._id;
      document.getElementById('bookTitle').value = book.title;
      document.getElementById('bookAuthor').value = book.author;
      document.getElementById('bookCategory').value = book.category;
      document.getElementById('bookPrice').value = book.price || 0;
      document.getElementById('bookAvailability').value = book.availability || 'Available';
      document.getElementById('bookCoverUrl').value = book.coverImage || '';
      document.getElementById('bookDescription').value = book.description || '';

      const loc = book.location || {};
      document.getElementById('locFloor').value = loc.floor || 'Ground Floor';
      document.getElementById('locSection').value = loc.section || 'General';
      document.getElementById('locRack').value = loc.rack || 'R-01';
      document.getElementById('locShelf').value = loc.shelf || 'S-1';
      document.getElementById('locRow').value = loc.row || 'Row-1';

      bookFormModalTitle.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Book Details`;
      bookFormModal.classList.add('active');
    } catch (e) {
      showToast('Could not load book for editing', 'error');
    }
  };

  window.deleteBook = async (id) => {
    if (confirm('Are you sure you want to delete this book from the library database?')) {
      try {
        const res = await API.deleteBook(id, adminToken);
        showToast(res.message || 'Book deleted');
        loadDashboardStats();
        loadAdminBooks();
      } catch (e) {
        showToast('Failed to delete book', 'error');
      }
    }
  };

  // MANAGE REQUESTS
  async function loadAdminRequests() {
    try {
      const statusFilter = requestStatusFilter.value;
      const searchVal = requestSearchInput.value.trim();
      const requests = await API.getRequests(adminToken, statusFilter, searchVal);
      renderAdminRequests(requests);
    } catch (e) {
      adminRequestsTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--danger)">Error loading requests</td></tr>`;
    }
  }

  function renderAdminRequests(requests) {
    if (!requests || requests.length === 0) {
      adminRequestsTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem;">No student requests found.</td></tr>`;
      return;
    }

    adminRequestsTableBody.innerHTML = requests.map(r => {
      const s = r.studentDetails || {};
      const b = r.bookDetails || {};
      const formattedDate = r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'N/A';

      return `
        <tr>
          <td>
            <strong>${s.fullName}</strong><br>
            <span style="font-size:0.8rem; color:var(--text-muted);">Roll ID: ${s.rollNumber} | Mobile: ${s.mobileNumber}</span>
          </td>
          <td>${s.department}<br><span style="font-size:0.8rem; color:var(--text-muted);">${s.yearSemester}</span></td>
          <td>
            <strong>${b.title}</strong><br>
            <span style="font-size:0.8rem; color:var(--text-muted);">Author: ${b.author || 'N/A'} | Ed: ${b.edition || 'N/A'}</span>
          </td>
          <td>${formattedDate}</td>
          <td>
            <span class="status-badge status-${r.status}">${r.status}</span>
            ${r.notified ? '<br><span style="font-size:0.7rem; color:var(--success);"><i class="fa-solid fa-bell"></i> Student Notified</span>' : ''}
          </td>
          <td>
            <div style="display:flex; flex-direction:column; gap:0.35rem;">
              <select onchange="changeRequestStatus('${r._id}', this.value)" style="padding:0.35rem; border-radius:6px; font-size:0.8rem;">
                <option value="Pending" ${r.status === 'Pending' ? 'selected' : ''}>Pending</option>
                <option value="Approved" ${r.status === 'Approved' ? 'selected' : ''}>Approve Request</option>
                <option value="Ordered" ${r.status === 'Ordered' ? 'selected' : ''}>Mark as Ordered</option>
                <option value="Available" ${r.status === 'Available' ? 'selected' : ''}>Mark as Available (Added to Lib)</option>
                <option value="Rejected" ${r.status === 'Rejected' ? 'selected' : ''}>Reject Request</option>
              </select>
              <button onclick="addCommentToRequest('${r._id}', '${r.adminComments || ''}')" class="btn btn-outline" style="padding:0.2rem 0.5rem; font-size:0.75rem; color:var(--primary-dark); border-color:var(--border);">
                <i class="fa-solid fa-comment-dots"></i> ${r.adminComments ? 'Edit Note' : 'Add Note'}
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  let reqDebounce;
  requestSearchInput.addEventListener('input', () => {
    clearTimeout(reqDebounce);
    reqDebounce = setTimeout(loadAdminRequests, 300);
  });
  requestStatusFilter.addEventListener('change', loadAdminRequests);

  window.changeRequestStatus = async (id, status) => {
    let notify = false;
    if (status === 'Available') {
      notify = confirm('Would you like to notify the student that the requested book is now added and available in the library?');
    }
    try {
      const res = await API.updateRequestStatus(id, { status, notifyStudent: notify }, adminToken);
      showToast(res.message);
      loadDashboardStats();
      loadAdminRequests();
    } catch (e) {
      showToast('Failed to update status', 'error');
    }
  };

  window.addCommentToRequest = async (id, currentComment) => {
    const note = prompt('Enter admin comments or notes for this request:', currentComment);
    if (note !== null) {
      try {
        await API.updateRequestStatus(id, { adminComments: note }, adminToken);
        showToast('Note updated successfully');
        loadAdminRequests();
      } catch (e) {
        showToast('Failed to save note', 'error');
      }
    }
  };

  // SUPER ADMIN PANEL
  async function loadSuperAdminAdmins() {
    try {
      const admins = await API.getAdmins(adminToken);
      renderSuperAdminTable(admins);
    } catch (e) {
      superAdminTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--danger)">Error loading admin accounts</td></tr>`;
    }
  }

  function renderSuperAdminTable(admins) {
    if (!admins || admins.length === 0) {
      superAdminTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No administrators found.</td></tr>`;
      return;
    }

    superAdminTableBody.innerHTML = admins.map(a => {
      const isSuper = a.role === 'superadmin';
      return `
        <tr>
          <td><strong>${a.username}</strong></td>
          <td>${a.fullName}</td>
          <td><span class="status-badge ${isSuper ? 'status-Approved' : 'status-Pending'}">${a.role.toUpperCase()}</span></td>
          <td style="font-size:0.8rem;">
            Books: ${a.permissions?.canManageBooks ? '✓' : '✗'} | Requests: ${a.permissions?.canManageRequests ? '✓' : '✗'} | Admins: ${a.permissions?.canManageAdmins ? '✓' : '✗'}
          </td>
          <td>
            <button onclick="resetAdminPass('${a._id}')" class="btn btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.8rem;" title="Reset Password"><i class="fa-solid fa-key"></i></button>
            ${!isSuper ? `<button onclick="removeAdmin('${a._id}')" class="btn btn-danger" style="padding:0.3rem 0.6rem; font-size:0.8rem;" title="Remove Admin"><i class="fa-solid fa-user-minus"></i></button>` : ''}
          </td>
        </tr>
      `;
    }).join('');
  }

  openCreateAdminModalBtn.addEventListener('click', () => {
    createAdminForm.reset();
    createAdminModal.classList.add('active');
  });

  const closeCreateModal = () => createAdminModal.classList.remove('active');
  closeCreateAdminModal.addEventListener('click', closeCreateModal);
  cancelCreateAdminModal.addEventListener('click', closeCreateModal);

  createAdminForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const adminData = {
      fullName: document.getElementById('newAdminFullName').value.trim(),
      username: document.getElementById('newAdminUsername').value.trim(),
      password: document.getElementById('newAdminPassword').value,
      email: document.getElementById('newAdminEmail').value.trim(),
      role: document.getElementById('newAdminRole').value
    };

    try {
      const res = await API.addAdmin(adminData, adminToken);
      showToast(res.message || 'Admin account registered successfully');
      closeCreateModal();
      loadSuperAdminAdmins();
    } catch (e) {
      showToast('Failed to register admin account', 'error');
    }
  });

  window.removeAdmin = async (id) => {
    if (confirm('Are you sure you want to remove this administrator account?')) {
      try {
        const res = await API.deleteAdmin(id, adminToken);
        showToast(res.message || 'Admin removed');
        loadSuperAdminAdmins();
      } catch (e) {
        showToast('Error removing admin account', 'error');
      }
    }
  };

  window.resetAdminPass = async (id) => {
    const newPassword = prompt('Enter new password for this admin account (min 4 characters):');
    if (newPassword) {
      try {
        const res = await API.resetAdminPassword(id, newPassword, adminToken);
        showToast(res.message || 'Password reset successfully');
      } catch (e) {
        showToast('Failed to reset password', 'error');
      }
    }
  };
});
