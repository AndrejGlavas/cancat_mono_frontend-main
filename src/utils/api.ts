import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// const API_BASE_URL = '/api';
const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      config.headers['x-refresh-token'] = refreshToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Handle new tokens from regular responses
    const newAccessToken = response.headers['x-new-access-token'];
    const newRefreshToken = response.headers['x-new-refresh-token'];

    if (newAccessToken && newRefreshToken) {
      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;

    // Only attempt refresh if it's a 401 error and we haven't tried yet
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call the refresh endpoint
        const response = await api.post('/auth/refresh', { refreshToken });

        if (response.data?.accessToken && response.data?.refreshToken) {
          // Store new tokens
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);

          // Update authorization headers
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
            originalRequest.headers['x-refresh-token'] = response.data.refreshToken;
          }

          // Retry original request
          return api(originalRequest);
        } else {
          throw new Error('Invalid token refresh response');
        }
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // Check if we're already on the timeout page to prevent redirect loops
        if (!window.location.href.includes('/timeout')) {
          window.location.href = 'https://CanCat.io/timeout';
        }
        
        return Promise.reject(refreshError);
      }
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      if (!window.location.href.includes('/timeout')) {
        window.location.href = 'https://CanCat.io/timeout';
      }
      
      return Promise.reject(new Error('Request timed out'));
    }

    return Promise.reject(error);
  }
);

export default api;