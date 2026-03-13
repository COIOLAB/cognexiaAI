/**
 * Auth Helper Utility
 * Shared authentication utilities for JWT storage, validation, and role management
 */

import { jwtDecode } from 'jwt-decode';

export interface JWTPayload {
  sub: string; // userId
  email: string;
  userType: 'SUPER_ADMIN' | 'ORG_ADMIN' | 'ORG_USER';
  organizationId?: string;
  roles: string[];
  permissions?: string[];
  iat: number;
  exp: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  organizationId?: string;
}

/**
 * Token Storage Keys
 */
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  ORGANIZATION_ID: 'organizationId',
  USER_DATA: 'userData',
} as const;

/**
 * Store authentication tokens in localStorage
 */
export function storeTokens(tokens: AuthTokens): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
  
  if (tokens.organizationId) {
    localStorage.setItem(STORAGE_KEYS.ORGANIZATION_ID, tokens.organizationId);
  }
}

/**
 * Retrieve access token from localStorage
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

/**
 * Retrieve refresh token from localStorage
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
}

/**
 * Retrieve organization ID from localStorage
 */
export function getOrganizationId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.ORGANIZATION_ID);
}

/**
 * Clear all authentication data from localStorage
 */
export function clearAuthData(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.ORGANIZATION_ID);
  localStorage.removeItem(STORAGE_KEYS.USER_DATA);
}

/**
 * Decode JWT token to extract payload
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwtDecode<JWTPayload>(token);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload) return true;
  
  const currentTime = Date.now() / 1000;
  return payload.exp < currentTime;
}

/**
 * Check if token will expire soon (within 5 minutes)
 */
export function isTokenExpiringSoon(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload) return true;
  
  const currentTime = Date.now() / 1000;
  const fiveMinutes = 5 * 60;
  return payload.exp < (currentTime + fiveMinutes);
}

/**
 * Validate current access token
 */
export function isAuthenticated(): boolean {
  const token = getAccessToken();
  if (!token) return false;
  return !isTokenExpired(token);
}

/**
 * Get current user from JWT
 */
export function getCurrentUser(): JWTPayload | null {
  const token = getAccessToken();
  if (!token) return null;
  return decodeToken(token);
}

/**
 * Extract user roles from JWT
 */
export function getUserRoles(): string[] {
  const user = getCurrentUser();
  return user?.roles || [];
}

/**
 * Check if user has specific role
 */
export function hasRole(role: string): boolean {
  const roles = getUserRoles();
  return roles.includes(role);
}

/**
 * Check if user is Super Admin
 */
export function isSuperAdmin(): boolean {
  const user = getCurrentUser();
  return user?.userType === 'SUPER_ADMIN' || hasRole('SUPER_ADMIN');
}

/**
 * Check if user is Owner
 */
export function isOwner(): boolean {
  return hasRole('OWNER');
}

/**
 * Check if user is Admin (includes Owner)
 */
export function isAdmin(): boolean {
  return hasRole('ADMIN') || hasRole('OWNER');
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(roles: string[]): boolean {
  const userRoles = getUserRoles();
  return roles.some(role => userRoles.includes(role));
}

/**
 * Check if user has all of the specified roles
 */
export function hasAllRoles(roles: string[]): boolean {
  const userRoles = getUserRoles();
  return roles.every(role => userRoles.includes(role));
}

/**
 * Get user permissions from JWT
 */
export function getUserPermissions(): string[] {
  const user = getCurrentUser();
  return user?.permissions || [];
}

/**
 * Check if user has specific permission
 */
export function hasPermission(permission: string): boolean {
  const permissions = getUserPermissions();
  return permissions.includes(permission);
}

/**
 * Redirect user based on their role
 */
export function redirectToAppropriatePortal(): void {
  if (typeof window === 'undefined') return;
  
  if (isSuperAdmin()) {
    // Redirect to super admin portal
    window.location.href = process.env.NEXT_PUBLIC_SUPER_ADMIN_URL || 'http://localhost:3001/dashboard';
  } else {
    // Redirect to client portal
    window.location.href = process.env.NEXT_PUBLIC_CLIENT_PORTAL_URL || 'http://localhost:3002/dashboard';
  }
}

/**
 * Get Authorization header value
 */
export function getAuthHeader(): string | null {
  const token = getAccessToken();
  return token ? `Bearer ${token}` : null;
}

/**
 * Refresh access token using refresh token
 * @param refreshTokenEndpoint API endpoint to refresh token
 */
export async function refreshAccessToken(
  refreshTokenEndpoint: string = '/auth/refresh'
): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  
  try {
    const response = await fetch(refreshTokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });
    
    if (!response.ok) {
      throw new Error('Token refresh failed');
    }
    
    const data = await response.json();
    
    if (data.accessToken) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
      }
      return data.accessToken;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    clearAuthData();
    return null;
  }
}

/**
 * Set up automatic token refresh
 * Call this once when the app initializes
 */
export function setupAutoTokenRefresh(
  refreshCallback: () => Promise<void>,
  checkIntervalMs: number = 60000 // Check every minute
): () => void {
  const intervalId = setInterval(async () => {
    const token = getAccessToken();
    if (token && isTokenExpiringSoon(token)) {
      await refreshCallback();
    }
  }, checkIntervalMs);
  
  // Return cleanup function
  return () => clearInterval(intervalId);
}

/**
 * Format user display name from JWT
 */
export function getUserDisplayName(): string {
  const user = getCurrentUser();
  if (!user) return 'Guest';
  return user.email.split('@')[0]; // Use email prefix as display name
}

/**
 * Get organization context
 */
export function getOrganizationContext(): {
  organizationId: string | null;
  hasOrganization: boolean;
} {
  const organizationId = getOrganizationId();
  return {
    organizationId,
    hasOrganization: !!organizationId,
  };
}

/**
 * Check if token needs refresh and do it automatically
 */
export async function ensureValidToken(
  apiBaseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'
): Promise<boolean> {
  const token = getAccessToken();
  
  if (!token) return false;
  
  if (isTokenExpired(token)) {
    const newToken = await refreshAccessToken(`${apiBaseUrl}/auth/refresh`);
    return !!newToken;
  }
  
  return true;
}
