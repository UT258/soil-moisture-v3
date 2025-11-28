import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Authentication API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/updatedetails', data),
  updatePassword: (data) => api.put('/auth/updatepassword', data),
};

// Sensors API
export const sensorsAPI = {
  getAll: (params) => api.get('/sensors', { params }),
  getById: (id) => api.get(`/sensors/${id}`),
  create: (data) => api.post('/sensors', data),
  update: (id, data) => api.put(`/sensors/${id}`, data),
  delete: (id) => api.delete(`/sensors/${id}`),
  getInRadius: (lng, lat, distance) => api.get(`/sensors/radius/${lng}/${lat}/${distance}`),
  updateStatus: (sensorId, status) => api.put(`/sensors/${sensorId}/status`, status),
};

// Readings API
export const readingsAPI = {
  getAll: (params) => api.get('/readings', { params }),
  getById: (id) => api.get(`/readings/${id}`),
  create: (data) => api.post('/readings', data),
  getBySensor: (sensorId, params) => api.get(`/readings/sensor/${sensorId}`, { params }),
  getStats: (sensorId, params) => api.get(`/readings/stats/${sensorId}`, { params }),
  getLatest: () => api.get('/readings/latest'),
};

// Alerts API
export const alertsAPI = {
  getAll: (params) => api.get('/alerts', { params }),
  getById: (id) => api.get(`/alerts/${id}`),
  create: (data) => api.post('/alerts', data),
  update: (id, data) => api.put(`/alerts/${id}`, data),
  acknowledge: (id, notes) => api.put(`/alerts/${id}/acknowledge`, { notes }),
  resolve: (id, data) => api.put(`/alerts/${id}/resolve`, data),
  getActive: () => api.get('/alerts/active'),
  getStats: (params) => api.get('/alerts/stats', { params }),
};

// Risk Zones API
export const riskZonesAPI = {
  getAll: (params) => api.get('/risk-zones', { params }),
  getById: (id) => api.get(`/risk-zones/${id}`),
  create: (data) => api.post('/risk-zones', data),
  update: (id, data) => api.put(`/risk-zones/${id}`, data),
  delete: (id) => api.delete(`/risk-zones/${id}`),
  addFeedback: (id, feedback) => api.post(`/risk-zones/${id}/feedback`, feedback),
  getInBounds: (params) => api.get('/risk-zones/bounds', { params }),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getActivity: (params) => api.get('/dashboard/activity', { params }),
  getHealth: () => api.get('/dashboard/health'),
};

// Predictions API
export const predictionsAPI = {
  analyze: (data) => api.post('/predictions/analyze', data),
  getHistory: (params) => api.get('/predictions/history', { params }),
};

// Users API (Admin only)
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};
