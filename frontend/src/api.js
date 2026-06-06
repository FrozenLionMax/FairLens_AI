// api.js - Frontend API Service
import { axiosInstance, API_CONFIG } from './config';

/**
 * Analyze a file for bias detection
 * @param {File} file - The file to analyze
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<Object>} Analysis results
 */
export const analyzeFile = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axiosInstance.post(API_CONFIG.ENDPOINTS.ANALYZE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });
  return response.data;
};

/**
 * Preview a file to get column metadata and sample rows
 * @param {File} file - The file to preview
 * @returns {Promise<Object>} Preview data with columns and rows
 */
export const previewFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axiosInstance.post(API_CONFIG.ENDPOINTS.PREVIEW, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Analyze using a preview_id and user-selected columns
 * @param {string} previewId
 * @param {string} targetColumn
 * @param {string} protectedColumn
 * @returns {Promise<Object>} Analysis results
 */
export const analyzeWithColumns = async (previewId, targetColumn, protectedColumn) => {
  const response = await axiosInstance.post(API_CONFIG.ENDPOINTS.ANALYZE_PREVIEW, {
    preview_id: previewId,
    target_column: targetColumn,
    protected_column: protectedColumn,
  });
  return response.data;
};

/**
 * Load sample hiring dataset for demo
 * @returns {Promise<Object>} Analysis results for sample data
 */
export const getSampleData = async () => {
  const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.SAMPLE_DATA);
  return response.data;
};


/**
 * Export analysis as PDF
 * @param {string} analysisId - Analysis ID (optional for legacy support)
 * @returns {Promise<Blob>} PDF blob
 */
export const exportPdf = async (analysisId) => {
  const url = analysisId
    ? `${API_CONFIG.ENDPOINTS.EXPORT_PDF}/${analysisId}`
    : API_CONFIG.ENDPOINTS.EXPORT_PDF;
  const response = await axiosInstance.get(url, { responseType: 'blob' });
  return response.data;
};

/**
 * Export analysis as JSON
 * @param {string} analysisId - Analysis ID (optional for legacy support)
 * @returns {Promise<Blob>} JSON blob
 */
export const exportJson = async (analysisId) => {
  const url = analysisId
    ? `${API_CONFIG.ENDPOINTS.EXPORT_JSON}/${analysisId}`
    : API_CONFIG.ENDPOINTS.EXPORT_JSON;
  const response = await axiosInstance.get(url, { responseType: 'blob' });
  return response.data;
};

/**
 * Get list of past analyses
 * @returns {Promise<Array>} List of analysis summaries
 */
export const getAnalyses = async () => {
  const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.ANALYSES);
  return response.data;
};

/**
 * Health check
 * @returns {Promise<Object>} Health status
 */
export const checkHealth = async () => {
  const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.HEALTH);
  return response.data;
};

/**
 * Run interactive What-If mitigation
 * @param {string} analysisId 
 * @param {string} proxyFeature 
 * @returns {Promise<Object>}
 */
export const runInteractiveMitigation = async (analysisId, proxyFeature) => {
  const response = await axiosInstance.post(API_CONFIG.ENDPOINTS.MITIGATE_INTERACTIVE, {
    analysis_id: analysisId,
    proxy_feature: proxyFeature,
  });
  return response.data;
};

/**
 * Validate file before upload
 * @param {File} file - File to validate
 * @returns {Object} Validation result { valid, errors }
 */
export const validateFile = (file) => {
  const errors = [];

  if (file.size > API_CONFIG.MAX_FILE_SIZE) {
    errors.push(`File size exceeds ${API_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
  }

  const fileExtension = file.name.split('.').pop().toLowerCase();
  if (!API_CONFIG.ALLOWED_TYPES.includes(fileExtension)) {
    errors.push(`File type .${fileExtension} not allowed. Allowed: ${API_CONFIG.ALLOWED_TYPES.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Fetch a specific analysis result by ID
 * @param {string} id Analysis ID
 * @returns {Promise<Object>} Full analysis data
 */
export const getAnalysisById = async (id) => {
  const response = await axiosInstance.get(`${API_CONFIG.ENDPOINTS.ANALYSIS_BY_ID}/${id}`);
  return response.data;
};

/**
 * Export mitigated dataset as CSV
 * @param {string} analysisId 
 * @param {string} droppedColumn 
 */
export const exportMitigatedCsv = async (analysisId, droppedColumn) => {
  const response = await axiosInstance.get(`/api/export/mitigated/${analysisId}?drop_column=${encodeURIComponent(droppedColumn)}`, {
    responseType: 'blob'
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `mitigated_data_${analysisId}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Chat with FairLens AI
 * @param {Object} messageData { messages: [], system: "", context_data: {} }
 * @returns {Promise<Object>}
 */
export const chat = async (messageData) => {
  const response = await axiosInstance.post(API_CONFIG.ENDPOINTS.CHAT, messageData);
  return response.data;
};

export default {
  analyzeFile,
  previewFile,
  analyzeWithColumns,
  getSampleData,
  chat,
  exportPdf,
  exportJson,
  getAnalyses,
  checkHealth,
  validateFile,
  runInteractiveMitigation,
};