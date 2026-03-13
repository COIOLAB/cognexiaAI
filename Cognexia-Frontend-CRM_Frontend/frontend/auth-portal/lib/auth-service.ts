import { apiClient } from './api-client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    userType: 'SUPER_ADMIN' | 'super_admin' | 'ORG_ADMIN' | 'org_admin' | 'USER' | 'user';
    organizationId?: string;
    organizationName?: string;
    roles?: string[];
  };
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  }

  static async demoLogin(): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/demo-login');
    return response.data;
  }

  static async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  }

  static async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/password-reset/request', { email });
    return response.data;
  }

  static async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/password-reset/confirm', { token, password });
    return response.data;
  }

  static storeAuth(authData: AuthResponse): void {
    // Store with both naming conventions for compatibility
    localStorage.setItem('accessToken', authData.accessToken);
    localStorage.setItem('refreshToken', authData.refreshToken);
    localStorage.setItem('access_token', authData.accessToken);
    localStorage.setItem('refresh_token', authData.refreshToken);
    localStorage.setItem('user', JSON.stringify(authData.user));
  }

  static clearAuth(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  /**
   * Redirect after login/register: pass tokens in URL hash so the target portal
   * (different origin) can read and store them. Without this, user would land logged out.
   */
  static redirectBasedOnRole(authData: AuthResponse): void {
    const { user, accessToken, refreshToken } = authData;
    const isSuperAdmin = user.userType === 'SUPER_ADMIN' || user.userType === 'super_admin' || user.roles?.includes('SUPER_ADMIN') || user.roles?.includes('super_admin');

    const SUPER_ADMIN_URL = process.env.NEXT_PUBLIC_SUPER_ADMIN_PORTAL_URL || 'http://localhost:3001';
    const CLIENT_URL = process.env.NEXT_PUBLIC_CLIENT_PORTAL_URL || 'http://localhost:3002';

    const tokens = encodeURIComponent(JSON.stringify({ accessToken, refreshToken, user }));

    if (isSuperAdmin) {
      window.location.href = `${SUPER_ADMIN_URL}/#auth=${tokens}`;
    } else {
      window.location.href = `${CLIENT_URL}/dashboard#auth=${tokens}`;
    }
  }
}
