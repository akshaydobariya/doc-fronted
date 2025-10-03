import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login if we're not already on login/auth pages
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/auth/callback')) {
        // Check if user is actually logged in before redirecting
        console.error('401 Unauthorized:', error.config.url);
        // Don't auto-redirect, let the component handle it
      }
    }
    return Promise.reject(error);
  }
);

export default api;