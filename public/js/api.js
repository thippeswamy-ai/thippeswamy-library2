const API_BASE = (typeof window !== 'undefined' && window.API_BASE_URL) 
  || localStorage.getItem('API_BASE_URL') 
  || '/api';

async function handleResponse(res) {
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json();
  }
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Server returned status ${res.status}: Backend API server is unreachable or not running.`);
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`Received invalid JSON response from server. Check backend hosting configuration.`);
  }
}

const API = {
  // Books
  async getBooks(search = '', category = '') {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    const res = await fetch(`${API_BASE}/books?${params.toString()}`);
    return handleResponse(res);
  },

  async getBookStats() {
    const res = await fetch(`${API_BASE}/books/stats`);
    return handleResponse(res);
  },

  async getBookById(id) {
    const res = await fetch(`${API_BASE}/books/${id}`);
    return handleResponse(res);
  },

  async addBook(formData, token) {
    const res = await fetch(`${API_BASE}/books`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    return handleResponse(res);
  },

  async updateBook(id, formData, token) {
    const res = await fetch(`${API_BASE}/books/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    return handleResponse(res);
  },

  async deleteBook(id, token) {
    const res = await fetch(`${API_BASE}/books/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(res);
  },

  // Student Requests
  async submitRequest(requestData) {
    const res = await fetch(`${API_BASE}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });
    return handleResponse(res);
  },

  async getRequests(token, status = '', search = '') {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    const res = await fetch(`${API_BASE}/requests?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(res);
  },

  async getRequestStats(token) {
    const res = await fetch(`${API_BASE}/requests/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(res);
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
    return handleResponse(res);
  },

  // Auth & Admin Management
  async login(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return handleResponse(res);
  },

  async getAdmins(token) {
    const res = await fetch(`${API_BASE}/auth/admins`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(res);
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
    return handleResponse(res);
  },

  async deleteAdmin(id, token) {
    const res = await fetch(`${API_BASE}/auth/admins/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(res);
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
    return handleResponse(res);
  }
};
