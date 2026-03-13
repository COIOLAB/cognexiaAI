/**
 * Users API Endpoints
 */

import { apiClient, buildQueryString } from '../client';
import type {
  User,
  UserFilters,
  PaginatedResponse,
  RegisterUserRequest,
} from '../types';

export const usersApi = {
  /**
   * Get all users with filters
   */
  getAll: async (filters?: UserFilters): Promise<PaginatedResponse<User>> => {
    const queryString = buildQueryString(filters);
    const response = await apiClient.get<PaginatedResponse<User>>(
      `/users${queryString}`
    );
    return response.data;
  },

  /**
   * Get user by ID
   */
  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  /**
   * Create new user
   */
  create: async (data: RegisterUserRequest): Promise<User> => {
    const response = await apiClient.post<User>('/users', data);
    return response.data;
  },

  /**
   * Update user
   */
  update: async (
    id: string,
    data: Partial<RegisterUserRequest>
  ): Promise<User> => {
    const response = await apiClient.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  /**
   * Delete user
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  /**
   * Activate user
   */
  activate: async (id: string): Promise<User> => {
    const response = await apiClient.post<User>(`/users/${id}/activate`);
    return response.data;
  },

  /**
   * Deactivate user
   */
  deactivate: async (id: string): Promise<User> => {
    const response = await apiClient.post<User>(`/users/${id}/deactivate`);
    return response.data;
  },

  /**
   * Update user roles
   */
  updateRoles: async (id: string, roles: string[]): Promise<User> => {
    const response = await apiClient.patch<User>(`/users/${id}/roles`, {
      roles,
    });
    return response.data;
  },

  /**
   * Get users by organization
   */
  getByOrganization: async (
    organizationId: string
  ): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<PaginatedResponse<User>>(
      `/users?organizationId=${organizationId}`
    );
    return response.data;
  },
};
