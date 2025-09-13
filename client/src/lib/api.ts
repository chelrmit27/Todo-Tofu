import axios from 'axios';

// Determine API base URL based on environment
const getApiBaseUrl = () => {
  // Use environment variable if available (for production deployment)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In production (Vercel), use relative path if on same domain
  if (import.meta.env.PROD) {
    return '/api';
  }
  
  // For development, use localhost
  return 'http://localhost:5001/api';
};

// Export the base URL function so other files can use it
export { getApiBaseUrl };

// Create centralized API instance
export const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  timeout: 10000,
});

// Add debugging
console.log('API Configuration:', {
  baseURL: api.defaults.baseURL,
  prod: import.meta.env.PROD,
  mode: import.meta.env.MODE,
  env: import.meta.env
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    console.log('Making API request to:', config.url, 'Full URL:', `${config.baseURL}${config.url}`);
    const token = localStorage.getItem('token');
    if (token) {
      if (!config.headers) {
        config.headers = new axios.AxiosHeaders();
      }
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log('API response received:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error Details:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      baseURL: error.config?.baseURL
    });
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  },
);

export default api;
