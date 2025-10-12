import axios from 'axios';
import { toast } from 'react-hot-toast';

// Store for refresh promise to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor - add token to all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 and refresh token
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axios(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        // No refresh token, redirect to login
        localStorage.clear();
        window.location.href = '/Login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post('https://api.automation365.io/auth/refresh', {
          refresh_token: refreshToken
        }, {
          skipAuthRefresh: true // Custom flag to skip interceptor for this request
        });

        const { access_token, refresh_token } = response.data;
        
        localStorage.setItem('token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        
        processQueue(null, access_token);
        
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return axios(originalRequest);
        
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.clear();
        toast.error('Session expired. Please login again.');
        window.location.href = '/Login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Skip interceptor for refresh token requests
axios.interceptors.request.use((config) => {
  if (config.skipAuthRefresh) {
    delete config.headers.Authorization;
  }
  return config;
});

export default axios;