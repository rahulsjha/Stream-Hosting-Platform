import axios from 'axios';

const isBrowser = typeof window !== 'undefined';
const isLocalhost = isBrowser && ['localhost', '127.0.0.1'].includes(window.location.hostname);
const DEFAULT_REMOTE_API = 'https://sil-api-811882866295.us-central1.run.app/api';

function normalizeApiBase(rawBase) {
  const fallback = DEFAULT_REMOTE_API;
  if (!rawBase) return fallback;

  const trimmed = rawBase.trim();

  if (/\.run\.appapi(\/|$)/.test(trimmed)) {
    return trimmed.replace(/\.run\.appapi(\/|$)/, '.run.app/api$1').replace(/\/$/, '');
  }

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
// the backend on port 3000 so the React dev server on 3001 does not swallow API requests.
const API_BASE = normalizeApiBase(
  process.env.REACT_APP_API_URL || (
    isBrowser
      ? (isLocalhost ? 'https://sil-api-i6jmi6wdba-uc.a.run.app/api' : `${window.location.origin}/api`)
      : DEFAULT_REMOTE_API
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

export default apiClient;
