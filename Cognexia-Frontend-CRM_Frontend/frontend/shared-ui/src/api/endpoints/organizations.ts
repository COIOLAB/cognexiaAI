/**
 * Organizations API Endpoints
 */

import { apiClient, buildQueryString } from '../client';
import type {
  Organization,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  OrganizationFilters,
  PaginatedResponse,
} from '../types';

export const organizationsApi = {
  /**
   * Get all organizations with filters
   */
  getAll: async (
    filters?: OrganizationFilters
  ): Promise<PaginatedResponse<Organization>> => {
    const queryString = buildQueryString(filters);
    const response = await apiClient.get<PaginatedResponse<Organization>>(
      `/organizations${queryString}`
    );
    return response.data;
  },

  /**
   * Get organization by ID
   */
  getById: async (id: string): Promise<Organization> => {
    const response = await apiClient.get<Organization>(`/organizations/${id}`);
    return response.data;
  },

  /**
   * Create new organization
   */
  create: async (data: CreateOrganizationRequest): Promise<Organization> => {
    const response = await apiClient.post<Organization>('/organizations', data);
    return response.data;
  },

  /**
   * Update organization
   */
  update: async (
    id: string,
    data: UpdateOrganizationRequest
  ): Promise<Organization> => {
    const response = await apiClient.patch<Organization>(
      `/organizations/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete organization
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/organizations/${id}`);
  },

  /**
   * Suspend organization
   */
  suspend: async (id: string): Promise<Organization> => {
    const response = await apiClient.post<Organization>(
      `/organizations/${id}/suspend`
    );
    return response.data;
  },

  /**
   * Activate organization
   */
  activate: async (id: string): Promise<Organization> => {
    const response = await apiClient.post<Organization>(
      `/organizations/${id}/activate`
    );
    return response.data;
  },

  /**
   * Get organization statistics
   */
  getStats: async (
    id: string
  ): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalRevenue: number;
    monthlyRevenue: number;
  }> => {
    const response = await apiClient.get(`/organizations/${id}/stats`);
    return response.data;
  },
};
