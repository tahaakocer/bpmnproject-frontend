import axios from 'axios';
import { getToken } from './tokenService';

const api = axios.create({
    baseURL: 'http://localhost:8282',
    headers: {
        'Content-Type': 'application/json'
    }
   
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    try {
        const token = await getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    } catch (error) {
        console.error('Token interceptor hatası:', error);
        return config;
    }
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newToken = await getToken();
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;