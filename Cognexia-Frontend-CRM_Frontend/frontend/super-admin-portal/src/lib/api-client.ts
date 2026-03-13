import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'react-hot-toast';

// API base URL - adjust based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token = localStorage.getItem('access_token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // Handle 401 Unauthorized - Token expired
    // Don't redirect if we're receiving auth tokens via URL hash (from MFA flow)
    const isReceivingAuthTokens = typeof window !== 'undefined' && window.location.hash.startsWith('#auth=');
    // #region agent log
    if (error.response?.status === 401) fetch('http://127.0.0.1:7242/ingest/d1079146-7e27-4855-8d62-367cb374f03a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api-client:44',message:'401 received',data:{isReceivingAuthTokens,willRedirect:!originalRequest?._retry&&!isReceivingAuthTokens},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    if (error.response?.status === 401 && !originalRequest._retry && !isReceivingAuthTokens) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data;
          
          // Save new token
          localStorage.setItem('access_token', accessToken);
          
          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        // Redirect to login
        if (typeof window !== 'undefined') {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/d1079146-7e27-4855-8d62-367cb374f03a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api-client:78',message:'refresh failed, redirecting to login',data:{},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4'})}).catch(()=>{});
          // #endregion
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const errorMessage = 
      (error.response?.data as any)?.message || 
      error.message || 
      'An unexpected error occurred';
    
    // Show error toast
    toast.error(errorMessage);
    
    return Promise.reject(error);
  }
);

export default apiClient;

/**
 * API Response types
 */
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * API error type
 */
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
