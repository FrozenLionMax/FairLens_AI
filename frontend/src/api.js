// api.js - Frontend API Service with Axios
import { axiosInstance, API_CONFIG, buildUrl, uploadFile } from './config';

/**
 * Analyze a file for bias detection
 * @param {File} file - The file to analyze
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<Object>} Analysis results
 */
export const analyzeFile = async (file, onProgress) => {
  try {
    const response = await uploadFile(file, onProgress);
    return response.data;
  } catch (error) {
    console.error('File analysis error:', error);
    throw error;
  }
};

/**
 * Get all analyses
 * @returns {Promise<Array>} List of analyses
 */
export const getAllAnalyses = async () => {
  try {
    const response = await axiosInstance.get(buildUrl(API_CONFIG.ENDPOINTS.GET_ANALYSES));
    return response.data;
  } catch (error) {
    console.error('Failed to fetch analyses:', error);
    throw error;
  }
};

/**
 * Get specific analysis details
 * @param {string} analysisId - Analysis ID
 * @returns {Promise<Object>} Analysis details with fairness metrics
 */
export const getAnalysisDetails = async (analysisId) => {
  try {
    const url = buildUrl(API_CONFIG.ENDPOINTS.GET_ANALYSIS, { id: analysisId });
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch analysis details:', error);
    throw error;
  }
};

/**
 * Export analysis report
 * @param {string} analysisId - Analysis ID
 * @returns {Promise<Blob>} PDF report blob
 */
export const exportReport = async (analysisId) => {
  try {
    const url = buildUrl(API_CONFIG.ENDPOINTS.EXPORT_REPORT, { id: analysisId });
    const response = await axiosInstance.get(url, { responseType: 'blob' });
    return response.data;
  } catch (error) {
    console.error('Failed to export report:', error);
    throw error;
  }
};

/**
 * Download report file
 * @param {string} reportId - Report ID
 * @returns {Promise<Blob>} Report file blob
 */
export const downloadReport = async (reportId) => {
  try {
    const url = buildUrl(API_CONFIG.ENDPOINTS.DOWNLOAD_REPORT, { id: reportId });
    const response = await axiosInstance.get(url, { responseType: 'blob' });
    return response.data;
  } catch (error) {
    console.error('Failed to download report:', error);
    throw error;
  }
};

/**
 * Get user settings
 * @returns {Promise<Object>} User settings
 */
export const getSettings = async () => {
  try {
    const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.GET_SETTINGS);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    throw error;
  }
};

/**
 * Update user settings
 * @param {Object} settings - Settings to update
 * @returns {Promise<Object>} Updated settings
 */
export const updateSettings = async (settings) => {
  try {
    const response = await axiosInstance.post(API_CONFIG.ENDPOINTS.UPDATE_SETTINGS, settings);
    return response.data;
  } catch (error) {
    console.error('Failed to update settings:', error);
    throw error;
  }
};

/**
 * Get platform statistics
 * @returns {Promise<Object>} Platform statistics
 */
export const getStatistics = async () => {
  try {
    const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.GET_STATISTICS);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch statistics:', error);
    throw error;
  }
};

/**
 * Get all reports
 * @returns {Promise<Array>} List of reports
 */
export const getReports = async () => {
  try {
    const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.GET_REPORTS);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch reports:', error);
    throw error;
  }
};

/**
 * Validate file before upload
 * @param {File} file - File to validate
 * @returns {Object} Validation result
 */
export const validateFile = (file) => {
  const errors = [];

  // Check file size
  if (file.size > API_CONFIG.MAX_FILE_SIZE) {
    errors.push(`File size exceeds ${API_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
  }

  // Check file type
  const fileExtension = file.name.split('.').pop().toLowerCase();
  if (!API_CONFIG.ALLOWED_TYPES.includes(fileExtension)) {
    errors.push(`File type .${fileExtension} not allowed. Allowed: ${API_CONFIG.ALLOWED_TYPES.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

export default {
  analyzeFile,
  getAllAnalyses,
  getAnalysisDetails,
  exportReport,
  downloadReport,
  getSettings,
  updateSettings,
  getStatistics,
  getReports,
  validateFile
};