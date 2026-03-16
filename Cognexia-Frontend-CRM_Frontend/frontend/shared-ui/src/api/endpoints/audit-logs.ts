/**
 * Audit Logs API Endpoints
 */

import { apiClient, buildQueryString } from '../client';
import type { AuditLog, PaginatedResponse, AuditAction } from '../types';

export interface AuditLogFilters {
  organizationId?: string;
  userId?: string;
  action?: AuditAction;
  entityType?: string;
  entityId?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  page?: number;
  limit?: number;
}

export const auditLogsApi = {
  /**
   * Get audit logs with filters
   */
  getAll: async (
    filters?: AuditLogFilters
  ): Promise<PaginatedResponse<AuditLog>> => {
    const queryString = buildQueryString(filters);
    const response = await apiClient.get<PaginatedResponse<AuditLog>>(
      `/audit-logs${queryString}`
    );
    return response.data;
  },

  /**
   * Get audit log by ID
   */
  getById: async (id: string): Promise<AuditLog> => {
    const response = await apiClient.get<AuditLog>(`/audit-logs/${id}`);
    return response.data;
  },

  /**
   * Get audit logs for organization
   */
  getByOrganization: async (
    organizationId: string,
    filters?: Omit<AuditLogFilters, 'organizationId'>
  ): Promise<PaginatedResponse<AuditLog>> => {
    const queryString = buildQueryString(filters);
    const response = await apiClient.get<PaginatedResponse<AuditLog>>(
      `/audit-logs/organizations/${organizationId}${queryString}`
    );
    return response.data;
  },

  /**
   * Get audit logs for user
   */
  getByUser: async (
    userId: string,
    filters?: Omit<AuditLogFilters, 'userId'>
  ): Promise<PaginatedResponse<AuditLog>> => {
    const queryString = buildQueryString(filters);
    const response = await apiClient.get<PaginatedResponse<AuditLog>>(
      `/audit-logs/users/${userId}${queryString}`
    );
    return response.data;
  },

  /**
   * Get audit logs for specific entity
   */
  getByEntity: async (
    entityType: string,
    entityId: string,
    filters?: Omit<AuditLogFilters, 'entityType' | 'entityId'>
  ): Promise<PaginatedResponse<AuditLog>> => {
    const queryString = buildQueryString(filters);
    const response = await apiClient.get<PaginatedResponse<AuditLog>>(
      `/audit-logs/entities/${entityType}/${entityId}${queryString}`
    );
    return response.data;
  },

  /**
   * Export audit logs
   */
  export: async (
    filters?: AuditLogFilters,
    format: 'csv' | 'json' = 'csv'
  ): Promise<Blob> => {
    const queryString = buildQueryString({ ...filters, format });
    const response = await apiClient.get(`/audit-logs/export${queryString}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
