/**
 * Audit Logs React Query Hooks
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import { auditLogsApi } from '../endpoints';
import type { AuditLogFilters } from '../endpoints';

export const AUDIT_KEYS = {
  all: ['audit-logs'] as const,
  lists: () => [...AUDIT_KEYS.all, 'list'] as const,
  list: (filters?: AuditLogFilters) => [...AUDIT_KEYS.lists(), filters] as const,
  details: () => [...AUDIT_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...AUDIT_KEYS.details(), id] as const,
  organization: (orgId: string, filters?: Omit<AuditLogFilters, 'organizationId'>) =>
    [...AUDIT_KEYS.all, 'organization', orgId, filters] as const,
  user: (userId: string, filters?: Omit<AuditLogFilters, 'userId'>) =>
    [...AUDIT_KEYS.all, 'user', userId, filters] as const,
  entity: (
    entityType: string,
    entityId: string,
    filters?: Omit<AuditLogFilters, 'entityType' | 'entityId'>
  ) => [...AUDIT_KEYS.all, 'entity', entityType, entityId, filters] as const,
};

/**
 * Get all audit logs
 */
export const useAuditLogs = (filters?: AuditLogFilters) => {
  return useQuery({
    queryKey: AUDIT_KEYS.list(filters),
    queryFn: () => auditLogsApi.getAll(filters),
  });
};

/**
 * Get audit log by ID
 */
export const useAuditLog = (id: string) => {
  return useQuery({
    queryKey: AUDIT_KEYS.detail(id),
    queryFn: () => auditLogsApi.getById(id),
    enabled: !!id,
  });
};

/**
 * Get audit logs for organization
 */
export const useOrganizationAuditLogs = (
  organizationId: string,
  filters?: Omit<AuditLogFilters, 'organizationId'>
) => {
  return useQuery({
    queryKey: AUDIT_KEYS.organization(organizationId, filters),
    queryFn: () => auditLogsApi.getByOrganization(organizationId, filters),
    enabled: !!organizationId,
  });
};

/**
 * Get audit logs for user
 */
export const useUserAuditLogs = (
  userId: string,
  filters?: Omit<AuditLogFilters, 'userId'>
) => {
  return useQuery({
    queryKey: AUDIT_KEYS.user(userId, filters),
    queryFn: () => auditLogsApi.getByUser(userId, filters),
    enabled: !!userId,
  });
};

/**
 * Get audit logs for entity
 */
export const useEntityAuditLogs = (
  entityType: string,
  entityId: string,
  filters?: Omit<AuditLogFilters, 'entityType' | 'entityId'>
) => {
  return useQuery({
    queryKey: AUDIT_KEYS.entity(entityType, entityId, filters),
    queryFn: () => auditLogsApi.getByEntity(entityType, entityId, filters),
    enabled: !!entityType && !!entityId,
  });
};

/**
 * Export audit logs
 */
export const useExportAuditLogs = () => {
  return useMutation({
    mutationFn: ({
      filters,
      format = 'csv',
    }: {
      filters?: AuditLogFilters;
      format?: 'csv' | 'json';
    }) => auditLogsApi.export(filters, format),
  });
};
