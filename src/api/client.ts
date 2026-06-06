import axios from 'axios';

const API_BASE = 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    if (response.data.success === false) {
      throw new Error(response.data.message || 'Request failed');
    }
    return response.data.data;
  },
  (error) => Promise.reject(error)
);

export default api;
