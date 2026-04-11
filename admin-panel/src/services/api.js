import axios from 'axios';

const api = axios.create();

// DYNAMIC BASE URL: This is the "Actual Rectification" for the Website.
// It ensures that when you "Sync" the tunnel, every future request uses the new URL
// without needing to restart the browser or clear cache.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const savedUrl = localStorage.getItem('serverUrl');
  
  // Set the dynamic URL from Sync
  config.baseURL = savedUrl || 'http://localhost:8989/api';
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Bypass Cloudflare/Tunnel warnings
  config.headers['Bypass-Tunnel-Reminder'] = 'true';
  
  return config;
});

export default api;
