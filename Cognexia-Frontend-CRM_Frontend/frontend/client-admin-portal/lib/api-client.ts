import axios, { type AxiosError, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { useAuthStore } from '@/stores/auth-store';
import { useTenantStore } from '@/stores/tenant-store';

// Logging utility
const isDev = process.env.NODE_ENV === 'development';

function logRequest(config: InternalAxiosRequestConfig) {
  if (isDev) {
    console.group(`🔵 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log('Headers:', config.headers);
    if (config.data) console.log('Data:', config.data);
    if (config.params) console.log('Params:', config.params);
    console.groupEnd();
  }
}

function logResponse(response: AxiosResponse) {
  if (isDev) {
    console.group(`🟢 API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    console.groupEnd();
  }
}

function logError(error: AxiosError) {
  if (isDev) {
    console.group(`🔴 API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data || error.message);
    console.groupEnd();
  }
}

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV !== 'production' ? 'http://localhost:3003/api/v1' : '');

// Create axios instance with retry configuration
const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Retry configuration
  // validateStatus: (status) => status < 500, // REMOVED: Don't swallow 4xx errors
});

// Request interceptor - Add JWT token, tenant ID, and logging
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState();
    const { currentOrganization } = useTenantStore.getState();

    // Add Authorization header
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Add tenant header
    if (currentOrganization && config.headers) {
      config.headers['X-Tenant-ID'] = currentOrganization.id;
    }

    // Add request timestamp for tracking
    config.metadata = { startTime: Date.now() };

    // Log request
    logRequest(config);

    return config;
  },
  (error) => {
    logError(error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh, errors, and logging
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Calculate request duration
    const duration = Date.now() - (response.config.metadata?.startTime || 0);
    if (isDev && duration > 1000) {
      console.warn(`⚠️ Slow API request (${duration}ms): ${response.config.url}`);
    }

    // Log response
    logResponse(response);

    return response;
  },
  async (error: AxiosError) => {
    // Log error
    logError(error);
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized - Try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = useAuthStore.getState();
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call refresh token endpoint
        const refreshBaseUrl = apiBaseUrl || process.env.NEXT_PUBLIC_API_URL;
        if (!refreshBaseUrl) {
          throw new Error('API base URL is not configured');
        }
        const response = await axios.post(`${refreshBaseUrl}/auth/refresh`, { refreshToken });

        const { accessToken: newAccessToken } = response.data;

        // Update tokens in store
        useAuthStore.getState().updateTokens(newAccessToken, refreshToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        useAuthStore.getState().logout();
        useTenantStore.getState().clearTenant();
        
        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

export default apiClient;

// Helper function to get error message
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || 'An error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}
