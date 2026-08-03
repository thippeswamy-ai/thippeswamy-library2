// Global Utilities
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  if (type === 'error') {
    toast.style.borderLeftColor = 'var(--danger)';
    toast.innerHTML = `<i class="fa-solid fa-circle-exclamation" style="color:var(--danger)"></i> ${message}`;
  } else {
    toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color:var(--success)"></i> ${message}`;
  }
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

// Student Public Interface Script
document.addEventListener('DOMContentLoaded', () => {
  let currentCategory = 'All';
  let searchQuery = '';

  // Elements
  const totalBooksCountEl = document.getElementById('totalBooksCount');
  const searchInput = document.getElementById('searchInput');
  const categoryPills = document.querySelectorAll('.cat-pill');
  const booksGrid = document.getElementById('booksGrid');
  const gridHeading = document.getElementById('gridHeading');
  const activeFilterLabel = document.getElementById('activeFilterLabel');

  // Request Modal Elements
  const requestModal = document.getElementById('requestModal');
  const openRequestBtnNav = document.getElementById('openRequestBtnNav');
  const openRequestBtnBottom = document.getElementById('openRequestBtnBottom');
  const closeRequestModal = document.getElementById('closeRequestModal');
  const cancelRequestModal = document.getElementById('cancelRequestModal');
  const bookRequestForm = document.getElementById('bookRequestForm');

  // Initial Load
  loadTotalCount();
  loadBooks();

  // Load Total Books Count prominently
  async function loadTotalCount() {
    try {
      const stats = await API.getBookStats();
      totalBooksCountEl.textContent = stats.totalBooks !== undefined ? stats.totalBooks.toLocaleString() : '0';
    } catch (e) {
      totalBooksCountEl.textContent = '0';
    }
  }

  // Load Books with filter and search
  async function loadBooks() {
    booksGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align:center; padding:3rem 0; color:var(--text-muted);">
        <i class="fa-solid fa-spinner fa-spin fa-2x"></i>
        <p style="margin-top:0.5rem;">Searching library database...</p>
      </div>
    `;

    try {
      const books = await API.getBooks(searchQuery, currentCategory);
      renderBooks(books);
    } catch (e) {
      booksGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding:3rem 0; color:var(--danger);">
          <i class="fa-solid fa-triangle-exclamation fa-2x"></i>
          <p style="margin-top:0.5rem;">Failed to fetch books from library database.</p>
        </div>
      `;
    }
  }

  function renderBooks(books) {
    if (!books || books.length === 0) {
      booksGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding:4rem 1rem; background:#fff; border-radius:16px; border:1px solid var(--border);">
          <i class="fa-solid fa-book-open-reader fa-3x" style="color:var(--text-muted); margin-bottom:1rem;"></i>
          <h3 style="font-size:1.25rem; color:var(--primary-dark); margin-bottom:0.5rem;">No Books Found</h3>
          <p style="color:var(--text-muted); font-size:0.9rem;">We couldn't find any books matching your query or selected category.</p>
        </div>
      `;
      return;
    }

    booksGrid.innerHTML = books.map(book => {
      const loc = book.location || {};
      const isAvailable = book.availability === 'Available';
      const badgeClass = isAvailable ? 'badge-available' : 'badge-issued';
      const defaultImg = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';

      return `
        <div class="book-card">
          <div class="book-cover-wrap">
            <img src="${book.coverImage || defaultImg}" alt="${book.title}" class="book-cover-img" onerror="this.src='${defaultImg}'">
            <span class="badge-availability ${badgeClass}">
              <i class="fa-solid ${isAvailable ? 'fa-check-circle' : 'fa-clock'}"></i> ${book.availability}
            </span>
            <span class="badge-category">${book.category}</span>
          </div>
          <div class="book-info">
            <h4 class="book-title" title="${book.title}">${book.title}</h4>
            <div class="book-author"><i class="fa-solid fa-user-pen" style="font-size:0.8rem;"></i> ${book.author}</div>
            <div class="book-price">Price: ₹${book.price || 0}</div>
            <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:0.75rem; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
              ${book.description || 'No description available for this volume.'}
            </p>

            <div class="location-box">
              <strong><i class="fa-solid fa-map-pin"></i> Library Location:</strong>
              <div class="location-grid">
                <div><span>Floor:</span> <strong>${loc.floor || 'Ground'}</strong></div>
                <div><span>Section:</span> <strong>${loc.section || 'General'}</strong></div>
                <div><span>Rack:</span> <strong>${loc.rack || 'R-01'}</strong></div>
                <div><span>Shelf:</span> <strong>${loc.shelf || 'S-1'}</strong></div>
                <div style="grid-column:span 2;"><span>Row:</span> <strong>${loc.row || 'Row-1'}</strong></div>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Event Listeners for Search
  let debounceTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    searchQuery = e.target.value.trim();
    debounceTimer = setTimeout(() => {
      loadBooks();
    }, 300);
  });

  // Event Listeners for Categories
  categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      categoryPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.getAttribute('data-category');
      
      if (currentCategory === 'All') {
        gridHeading.textContent = 'Available Library Books';
        activeFilterLabel.textContent = 'Showing all cataloged titles';
      } else {
        gridHeading.textContent = `${currentCategory} Books`;
        activeFilterLabel.textContent = `Filtered by category: ${currentCategory}`;
      }
      loadBooks();
    });
  });

  // Request Modal Logic
  const openModal = () => requestModal.classList.add('active');
  const closeModal = () => requestModal.classList.remove('active');

  openRequestBtnNav.addEventListener('click', openModal);
  openRequestBtnBottom.addEventListener('click', openModal);
  closeRequestModal.addEventListener('click', closeModal);
  cancelRequestModal.addEventListener('click', closeModal);

  // Submit Request Form Handler
  bookRequestForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const requestData = {
      studentDetails: {
        fullName: document.getElementById('reqFullName').value.trim(),
        rollNumber: document.getElementById('reqRollNumber').value.trim(),
        department: document.getElementById('reqDepartment').value.trim(),
        yearSemester: document.getElementById('reqYearSemester').value.trim(),
        mobileNumber: document.getElementById('reqMobileNumber').value.trim(),
        email: document.getElementById('reqEmail').value.trim()
      },
      bookDetails: {
        title: document.getElementById('reqBookTitle').value.trim(),
        author: document.getElementById('reqBookAuthor').value.trim(),
        publisher: document.getElementById('reqBookPublisher').value.trim(),
        edition: document.getElementById('reqBookEdition').value.trim(),
        reason: document.getElementById('reqReason').value.trim()
      }
    };

    try {
      const res = await API.submitRequest(requestData);
      showToast(res.message || 'Your book request has been submitted successfully.');
      bookRequestForm.reset();
      closeModal();
    } catch (err) {
      showToast('Failed to submit book request. Please try again.', 'error');
    }
  });

  // Expose global refresher for admin updates
  window.refreshStudentView = () => {
    loadTotalCount();
    loadBooks();
  };
});
