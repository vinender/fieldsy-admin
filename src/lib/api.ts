import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

console.log('API URL being used:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.error || error.message
    });
    
    // Don't redirect on 401 for login or verify endpoints
    const isAuthEndpoint = error.config?.url?.includes('/admin/login') || 
                          error.config?.url?.includes('/admin/verify');
    
    if (error.response?.status === 401 && !isAuthEndpoint) {
      console.log('Unauthorized access, redirecting to login...');
      // Only redirect for non-auth endpoints when unauthorized
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    } else if (error.response?.status === 401 && isAuthEndpoint) {
      console.log('Login/verify failed with 401, NOT redirecting');
    }
    
    return Promise.reject(error);
  }
);

export default api;