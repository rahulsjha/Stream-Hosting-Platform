import axios from 'axios';

const isBrowser = typeof window !== 'undefined';
const isLocalhost = isBrowser && ['localhost', '127.0.0.1'].includes(window.location.hostname);
const DEFAULT_LOCAL_API = 'http://localhost:3000/api';
const DEFAULT_PROD_API = 'https://sil-api-308720634926.us-central1.run.app/api';

function normalizeApiBase(rawBase) {
  const fallback = DEFAULT_LOCAL_API;
  if (!rawBase) return fallback;

  const trimmed = rawBase.trim();

  try {
    const url = new URL(trimmed);
    if (!url.pathname || url.pathname === '/') {
      url.pathname = '/api';
    } else if (!url.pathname.endsWith('/api')) {
      url.pathname = `${url.pathname.replace(/\/$/, '')}/api`;
    }
    url.hash = '';
    url.search = '';
    return url.toString().replace(/\/$/, '');
  } catch {
    return fallback;
  }
}

// Prefer an explicit environment variable. For local development, default to
// the backend on port 3000. In production, default to the deployed Cloud Run
// backend so browser requests go directly to the API instead of the frontend.
const API_BASE = normalizeApiBase(
  process.env.REACT_APP_API_URL || (
    isBrowser
      ? (isLocalhost ? DEFAULT_LOCAL_API : DEFAULT_PROD_API)
      : DEFAULT_LOCAL_API
  )
);

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('sil_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { API_BASE };
export default apiClient;
