'use client';

import axios from 'axios';

// Determine API base URL based on environment
const getApiBaseUrl = () => '/api'

// Create centralized API instance
export const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to automatically include auth token
api.interceptors.request.use(
  (config) => {
    console.log('🔍 Axios request:', {
      url: config.url,
      baseURL: config.baseURL,
      fullURL: (config.baseURL || '') + (config.url || ''),
      method: config.method
    });
    
    // Only add token for client-side requests
    if (typeof window !== 'undefined') {
      // Skip token for auth endpoints (login, register)
      const isAuthEndpoint = config.url?.includes('/auth/login') || config.url?.includes('/auth/register');
      
      if (!isAuthEndpoint) {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('🔑 Added auth token to request');
        }
      }
    }
    return config;
  },
  (error) => {
    console.error('🚨 Axios request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('✅ Axios response success:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('🚨 Axios response error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export default api;
