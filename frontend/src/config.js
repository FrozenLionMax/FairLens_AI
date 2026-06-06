// config.js - API Configuration and Constants
import axios from 'axios';

// API Configuration
export const API_CONFIG = {
  // Backend API base URL (FastAPI with Uvicorn)
  // Uses VITE_API_URL if set, falls back to localhost for dev, and relative paths ('') for production deployments.
  BASE_URL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000' : ''),
  
  // API Endpoints — aligned with actual backend routes
  ENDPOINTS: {
    HEALTH: '/api/health',
    ANALYZE: '/api/analyze',
    SAMPLE_DATA: '/api/sample-data',
    CHAT: '/api/chat',
    EXPORT_PDF: '/api/export/pdf',
    EXPORT_JSON: '/api/export/json',
    ANALYSES: '/api/analyses',
    TEST_AI: '/api/test-ai',
    MITIGATE_INTERACTIVE: '/api/mitigate-interactive',
    PREVIEW: '/api/preview',
    ANALYZE_PREVIEW: '/api/analyze-preview',
    ANALYSIS_BY_ID: '/api/analyses',
  },

  // File upload constraints
  ALLOWED_TYPES: ['csv', 'json', 'xlsx'],
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  TIMEOUT: 60000, // 60 seconds
  
  // Fairness thresholds aligned with EEOC compliance
  FAIRNESS_THRESHOLDS: {
    DISPARATE_IMPACT_RATIO: 0.80, // 80% rule
    STATISTICAL_PARITY_DIFF: 0.10,
    DEMOGRAPHIC_PARITY_GAP: 0.10,
    OVERALL_BIAS_THRESHOLD: 70,
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

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data);
    }
    return Promise.reject(error);
  }
);

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