import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const TOKEN_KEY = 'admin_token';

export const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
};
export const setToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch { /* ignore */ }
};

// Таймаут большой: бесплатный сервер может «просыпаться» около минуты
const api = axios.create({ baseURL: API_URL, timeout: 60000 });
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const data = (r) => r.data;

export const login = (username, password) => api.post('/admin/login', { username, password }).then(data);
export const fetchLanguages = () => api.get('/languages').then(data);
export const fetchAdminMenu = () => api.get('/admin/menu').then(data);

export const createCategory = (body) => api.post('/admin/categories', body).then(data);
export const updateCategory = (id, body) => api.put(`/admin/categories/${id}`, body).then(data);
export const deleteCategory = (id) => api.delete(`/admin/categories/${id}`).then(data);

export const createDish = (body) => api.post('/admin/dishes', body).then(data);
export const updateDish = (id, body) => api.put(`/admin/dishes/${id}`, body).then(data);
export const deleteDish = (id) => api.delete(`/admin/dishes/${id}`).then(data);
export const setAvailability = (id, is_available) =>
  api.patch(`/admin/dishes/${id}/availability`, { is_available }).then(data);
