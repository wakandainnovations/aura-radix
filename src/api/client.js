import axios from 'axios';

const API_BASE_URL = '/api';
const TIMEOUT = 40000; // 40 seconds

/**
 * Configuration for public endpoints that don't require authentication
 * Add endpoints here that should be accessible without a JWT token
 */
const PUBLIC_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/health', // health check endpoint
];

/**
 * Check if an endpoint is public (doesn't require auth)
 */
const isPublicEndpoint = (url) => {
  return PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

/**
 * Create authenticated API client with JWT token
 * Used for all protected API routes
 */
const createAuthenticatedClient = () => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add JWT token to every authenticated request
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('jwtToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn('No JWT token found. Redirecting to login.');
        window.location.href = '/login';
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  return client;
};

/**
 * Create public API client without authentication
 * Used for login, register, and other public endpoints
 */
const createPublicClient = () => {
  return axios.create({
    baseURL: API_BASE_URL,
    timeout: TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// Create both client instances
const publicApiClient = createPublicClient();
const authenticatedApiClient = createAuthenticatedClient();

/**
 * Universal API client that routes to appropriate client
 * Automatically uses public client for public endpoints, authenticated for protected ones
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // Only add auth token for protected endpoints
    if (!isPublicEndpoint(config.url)) {
      const token = localStorage.getItem('jwtToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Handle network errors (no response from server)
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return Promise.reject({
          status: 'TIMEOUT',
          message: 'Request timeout. Please try again.',
          isNetworkError: true,
        });
      }
      
      if (error.message === 'Network Error') {
        return Promise.reject({
          status: 'NETWORK_ERROR',
          message: 'Network error. Please check your connection.',
          isNetworkError: true,
        });
      }

      return Promise.reject({
        status: 'UNKNOWN_ERROR',
        message: error.message || 'An unexpected error occurred',
        isNetworkError: true,
      });
    }

    // Handle HTTP error responses
    const status = error.response?.status;
    const errorData = error.response?.data;

    // 400 - Bad Request
    if (status === 400) {
      return Promise.reject({
        status,
        message: errorData?.message || 'Invalid request',
        errors: errorData?.errors,
        data: errorData,
      });
    }

    // 401 - Unauthorized (token expired or invalid)
    if (status === 401) {
      localStorage.removeItem('jwtToken');
      window.location.href = '/login';
      return Promise.reject({
        status,
        message: 'Session expired. Please login again.',
        errors: errorData?.errors,
        data: errorData,
      });
    }

    // 403 - Forbidden (user lacks permissions)
    if (status === 403) {
      return Promise.reject({
        status,
        message: errorData?.message || 'You do not have permission to access this resource',
        errors: errorData?.errors,
        data: errorData,
      });
    }

    // 404 - Not Found
    if (status === 404) {
      return Promise.reject({
        status,
        message: errorData?.message || 'Resource not found',
        errors: errorData?.errors,
        data: errorData,
      });
    }

    // 409 - Conflict
    if (status === 409) {
      return Promise.reject({
        status,
        message: errorData?.message || 'A conflicting resource already exists',
        data: errorData,
      });
    }

    // 422 - Unprocessable Entity (validation errors)
    if (status === 422) {
      return Promise.reject({
        status,
        message: errorData?.message || 'Validation failed',
        errors: errorData?.errors,
        data: errorData,
        isValidationError: true,
      });
    }

    // 429 - Too Many Requests (rate limited)
    if (status === 429) {
      return Promise.reject({
        status,
        message: errorData?.message || 'Too many requests. Please try again later.',
        retryAfter: error.response?.headers?.['retry-after'],
        data: errorData,
      });
    }

    // 500+ - Server errors
    if (status >= 500) {
      return Promise.reject({
        status,
        message: errorData?.message || 'Server error. Please try again later.',
        errors: errorData?.errors,
        data: errorData,
        isServerError: true,
      });
    }

    // Default error handling for other status codes
    return Promise.reject({
      status,
      message: errorData?.message || error.message || 'An error occurred',
      errors: errorData?.errors,
      data: errorData,
    });
  }
);

/**
 * Export both specialized clients and the universal client
 * Use Cases:
 * - apiClient: Default for most requests (auto-routes public/authenticated)
 * - publicApiClient: Explicitly for public endpoints when needed
 * - authenticatedApiClient: Explicitly for protected endpoints when needed
 */
export default apiClient;
export { publicApiClient, authenticatedApiClient };
