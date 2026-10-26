import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// Request interceptor to inject JWT bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lifedrone_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthenticated sessions
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      const currentPath = window.location.pathname;
      if (currentPath.includes('/dashboard')) {
        localStorage.removeItem('lifedrone_token');
        localStorage.removeItem('lifedrone_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  registerHospital: (data) => api.post('/auth/register-hospital', data),
  registerBloodBank: (data) => api.post('/auth/register-blood-bank', data),
  geocode: (q) => api.get('/auth/geocode', { params: { q } }),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  getDemoAccounts: () => api.get('/auth/demo-accounts')
};

export const hospitalAPI = {
  getDashboard: () => api.get('/hospital/dashboard'),
  searchInventory: (params) => api.get('/hospital/inventory/search', { params }),
  createRequest: (data) => api.post('/hospital/requests', data),
  getRequests: (params) => api.get('/hospital/requests', { params }),
  getRequestDetails: (id) => api.get(`/hospital/requests/${id}`),
  cancelRequest: (id, data) => api.post(`/hospital/requests/${id}/cancel`, data),
  getDeliveryTracking: (id) => api.get(`/hospital/deliveries/${id}/tracking`),
  restartSimulation: (id) => api.post(`/hospital/deliveries/${id}/restart-simulation`),
  verifyPasskey: (id, passkey) => api.post(`/hospital/deliveries/${id}/verify-passkey`, { passkey })
};

export const bloodBankAPI = {
  getDashboard: () => api.get('/blood-bank/dashboard'),
  getInventory: (params) => api.get('/blood-bank/inventory', { params }),
  addInventory: (data) => api.post('/blood-bank/inventory', data),
  updateInventory: (id, data) => api.patch(`/blood-bank/inventory/${id}`, data),
  getRequests: (params) => api.get('/blood-bank/requests', { params }),
  acceptRequest: (id) => api.post(`/blood-bank/requests/${id}/accept`),
  rejectRequest: (id, reason) => api.post(`/blood-bank/requests/${id}/reject`, { reason }),
  preparePackage: (id, data) => api.post(`/blood-bank/requests/${id}/prepare`, data),
  dispatchDelivery: (id, data) => api.post(`/blood-bank/requests/${id}/dispatch`, data)
};

export const routeAPI = {
  calculate: (data) => api.post('/routes/calculate', data),
  getNetwork: () => api.get('/routes/network'),
  getDeliveryRoute: (id) => api.get(`/routes/deliveries/${id}/route`)
};

export const publicAPI = {
  getMetrics: () => api.get('/metrics'),
  getInstitutions: () => api.get('/institutions'),
  getHospitals: () => api.get('/hospital/list'),
  submitContact: (data) => api.post('/contact', data)
};

export const supportAPI = {
  chat: (data) => api.post('/support/chat', data),
  requestCallback: (data) => api.post('/support/callback', data)
};

export default api;
