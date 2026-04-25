// config.js - API Configuration and Constants
import axios from 'axios';

// API Configuration
export const API_CONFIG = {
  // Backend API base URL (FastAPI with Uvicorn)
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  
  // API Endpoints
  ENDPOINTS: {
    // Health & Status
    HEALTH: '/api/health',
    
    // Analysis endpoints
    ANALYZE: '/api/analyze',
    GET_ANALYSES: '/api/analyses',
    GET_ANALYSIS: '/api/analyses/{id}',
    
    // Report & Export endpoints
    EXPORT_REPORT: '/api/export/{id}',
    DOWNLOAD_REPORT: '/api/reports/{id}/download',
    
    // Settings endpoints
    GET_SETTINGS: '/api/settings',
    UPDATE_SETTINGS: '/api/settings',
    
    // Statistics & Reports
    GET_STATISTICS: '/api/statistics',
    GET_REPORTS: '/api/reports',
    
    // File upload constraints
    ALLOWED_TYPES: ['csv', 'json', 'xlsx', 'pdf'],
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
    TIMEOUT: 30000 // 30 seconds
  },
  
  // Fairness thresholds aligned with EEOC compliance
  FAIRNESS_THRESHOLDS: {
    DISPARATE_IMPACT_RATIO: 0.80, // 80% rule
    STATISTICAL_PARITY_DIFF: 0.10,
    DEMOGRAPHIC_PARITY_GAP: 0.10,
    OVERALL_BIAS_THRESHOLD: 70,
    DEMOGRAPHIC_BIAS_THRESHOLD: 70,
    GENDER_BIAS_THRESHOLD: 70,
    ETHNICITY_BIAS_THRESHOLD: 70
  },
  
  // Bias level classifications
  BIAS_LEVELS: {
    LOW: { min: 0, max: 40, label: 'Low', color: '#10b981' },
    MEDIUM: { min: 41, max: 70, label: 'Medium', color: '#f59e0b' },
    HIGH: { min: 71, max: 100, label: 'High', color: '#ef4444' }
  }
};

// Axios instance with interceptors
export const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth tokens (if needed later)
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access - redirect to login');
    } else if (error.response?.status >= 500) {
      // Handle server errors
      console.error('Server error:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// URL builder utility
export const buildUrl = (endpoint, params = {}) => {
  let url = endpoint;
  Object.keys(params).forEach(key => {
    url = url.replace(`{${key}}`, params[key]);
  });
  return url;
};

// Retry mechanism for failed requests
export const fetchWithRetry = async (url, options = {}, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axiosInstance(url, options);
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
};

// File upload with progress tracking
export const uploadFile = (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  return axiosInstance.post(API_CONFIG.ENDPOINTS.ANALYZE, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });
};

// Health check
export const checkHealth = async () => {
  const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.HEALTH);
  return response.data;
};