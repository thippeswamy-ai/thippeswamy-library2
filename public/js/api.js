const API_BASE = '/api';

const API = {
  // Books
  async getBooks(search = '', category = '') {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    const res = await fetch(`${API_BASE}/books?${params.toString()}`);
    return res.json();
  },

  async getBookStats() {
    const res = await fetch(`${API_BASE}/books/stats`);
    return res.json();
  },

  async getBookById(id) {
    const res = await fetch(`${API_BASE}/books/${id}`);
    return res.json();
  },

  async addBook(formData, token) {
    const res = await fetch(`${API_BASE}/books`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    return res.json();
  },

  async updateBook(id, formData, token) {
    const res = await fetch(`${API_BASE}/books/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    return res.json();
  },

  async deleteBook(id, token) {
    const res = await fetch(`${API_BASE}/books/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  // Student Requests
  async submitRequest(requestData) {
    const res = await fetch(`${API_BASE}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });
    return res.json();
  },

  async getRequests(token, status = '', search = '') {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    const res = await fetch(`${API_BASE}/requests?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  async getRequestStats(token) {
    const res = await fetch(`${API_BASE}/requests/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  async updateRequestStatus(id, statusData, token) {
    const res = await fetch(`${API_BASE}/requests/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(statusData)
    });
    return res.json();
  },

  // Auth & Admin Management
  async login(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return res.json();
  },

  async getAdmins(token) {
    const res = await fetch(`${API_BASE}/auth/admins`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  async addAdmin(adminData, token) {
    const res = await fetch(`${API_BASE}/auth/admins`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(adminData)
    });
    return res.json();
  },

  async deleteAdmin(id, token) {
    const res = await fetch(`${API_BASE}/auth/admins/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  async resetAdminPassword(id, newPassword, token) {
    const res = await fetch(`${API_BASE}/auth/admins/${id}/reset-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ newPassword })
    });
    return res.json();
  }
};
