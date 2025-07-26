import axios from 'axios';

// API Configuration
const API_CONFIG = {
  // Base URL for API calls
  baseURL: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : window.location.origin,
  
  // Timeout for API requests
  timeout: 10000,
  
  // Default headers
  headers: {
    'Content-Type': 'application/json',
  }
};

// Configure axios defaults

axios.defaults.baseURL = API_CONFIG.baseURL;
axios.defaults.timeout = API_CONFIG.timeout;
axios.defaults.headers.common = {
  ...axios.defaults.headers.common,
  ...API_CONFIG.headers
};

// Add request interceptor for debugging
axios.interceptors.request.use(
  (config) => {
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
axios.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default axios;
export { API_CONFIG }; 