import axios from 'axios';
import {API_URL} from '../constants/config';
import {store} from '../store';

const api = axios.create({
  baseURL: API_URL.endsWith('/') ? API_URL : `${API_URL}/`,
  timeout: 20000,
  headers: {
    'Bypass-Tunnel-Reminder': 'true',
    'User-Agent': 'QueuelessCampusMobile',
  },
});

// Helper to update base URL dynamically (e.g. from SettingsScreen)
export const updateApiBaseURL = (newURL: string) => {
  api.defaults.baseURL = newURL.endsWith('/') ? newURL : `${newURL}/`;
};

api.interceptors.request.use(
  config => {
    const state = store.getState();
    const token = state.auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

// Response Interceptor: Better Error Reporting (MediSentry Style)
api.interceptors.response.use(
  response => response,
  async error => {
    let errorMessage = 'An unexpected error occurred';

    if (error.response) {
      // Server responded with an error
      const status = error.response.status;
      if (status === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
      } else if (status === 404) {
        errorMessage = 'The requested resource was not found.';
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      } else if (status >= 500) {
        errorMessage = `[Antigravity Debug: ${status}] ${
          error.response.data?.message || 'Server Error'
        } (URL: ${error.config.url})`;
      } else {
        errorMessage = error.response.data?.message || errorMessage;
      }
    } else if (error.request) {
      // Network Error or Timeout
      const attemptedUrl = api.defaults.baseURL || API_URL;
      const isTunnel =
        attemptedUrl.includes('trycloudflare.com') ||
        attemptedUrl.includes('localtunnel.me');

      if (isTunnel) {
        errorMessage = `Connection failed. The Network Tunnel may have expired or the backend server is not running.\n\nTarget: ${attemptedUrl}`;
      } else {
        errorMessage = `Connection failed. Please ensure your laptop/phone are on the same WiFi.\n\nTarget: ${attemptedUrl}`;
      }
    } else {
      errorMessage = error.message;
    }

    // Create a user-friendly error
    const enhancedError = new Error(errorMessage);
    (enhancedError as any).status = error.response?.status;

    return Promise.reject(enhancedError);
  },
);

export default api;
