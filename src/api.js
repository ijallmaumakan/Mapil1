/**
 * Little Olie Bistro - API Client Service
 * Menghubungkan Frontend ke Backend Express.js di http://localhost:5000/api
 */

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Helper untuk mengambil token otentikasi dari localStorage jika ada
 */
export const getAuthToken = () => {
  return localStorage.getItem('little_olie_token');
};

/**
 * Helper untuk menyimpan token otentikasi
 */
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('little_olie_token', token);
  } else {
    localStorage.removeItem('little_olie_token');
  }
};

/**
 * Cek status konektivitas server backend
 */
export const checkServerHealth = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(`${API_BASE_URL}/menus`, {
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Mengambil semua data menu dari database
 */
export const fetchAllMenus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/menus`);
    if (!response.ok) {
      throw new Error(`Gagal mengambil menu: HTTP ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching menus:', error);
    throw error;
  }
};

/**
 * Mengambil detail menu berdasarkan ID
 */
export const fetchMenuById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/menus/${id}`);
    if (!response.ok) {
      throw new Error(`Menu ID ${id} tidak ditemukan`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching menu ${id}:`, error);
    throw error;
  }
};

/**
 * Menambahkan menu baru ke server
 * @param {FormData} formData - Data form berisi name, price, category, desc, dan img file
 */
export const createMenu = async (formData) => {
  try {
    const headers = {};
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/menus`, {
      method: 'POST',
      headers,
      body: formData // multipart/form-data dikelola otomatis oleh browser
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Gagal menambahkan menu');
    }
    return result;
  } catch (error) {
    console.error('Error creating menu:', error);
    throw error;
  }
};

/**
 * Memperbarui data menu
 * @param {number|string} id - ID menu yang diperbarui
 * @param {FormData} formData - Data form update
 */
export const updateMenu = async (id, formData) => {
  try {
    const headers = {};
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/menus/${id}`, {
      method: 'PUT',
      headers,
      body: formData
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Gagal memperbarui menu');
    }
    return result;
  } catch (error) {
    console.error(`Error updating menu ${id}:`, error);
    throw error;
  }
};

/**
 * Menghapus menu berdasarkan ID
 */
export const deleteMenu = async (id) => {
  try {
    const headers = {};
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/menus/${id}`, {
      method: 'DELETE',
      headers
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Gagal menghapus menu');
    }
    return result;
  } catch (error) {
    console.error(`Error deleting menu ${id}:`, error);
    throw error;
  }
};

/**
 * Login user / admin
 */
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Gagal login');
    }
    if (result.token) {
      setAuthToken(result.token);
    }
    return result;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

/**
 * Registrasi user baru
 */
export const registerUser = async (name, email, password, role = 'admin') => {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password, role })
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Gagal registrasi');
    }
    return result;
  } catch (error) {
    console.error('Error registering:', error);
    throw error;
  }
};
