import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.syncfloww.com';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh and CORS error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle CORS / network errors (no response object)
    if (!error.response) {
      const isCORS =
        error.message?.toLowerCase().includes('network error') ||
        error.message?.toLowerCase().includes('cors') ||
        error.code === 'ERR_NETWORK';

      if (isCORS) {
        console.error(
          '[API] CORS or network error — the backend at',
          API_BASE_URL,
          'may not allow requests from this origin. Ensure CORS headers are configured on the server.'
        );
        return Promise.reject({
          ...error,
          friendlyMessage:
            'Unable to reach the server. This may be a network or CORS issue — please check your connection or contact support.',
        });
      }

      return Promise.reject({
        ...error,
        friendlyMessage: 'Unable to connect. Please check your internet connection and try again.',
      });
    }

    // Handle 401 — attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/api/users/auth/refresh/`, {
            refresh: refreshToken,
          });
          localStorage.setItem('access_token', data.access);
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return apiClient(originalRequest);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/auth';
        }
      }
    }

    // Handle 403 Forbidden (possible CORS misconfiguration on certain routes)
    if (error.response?.status === 0 || error.response?.status === 403) {
      console.error('[API] Possible CORS issue on', originalRequest?.url);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
