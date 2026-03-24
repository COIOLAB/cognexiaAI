import { createResourceApi } from './resource.api';
import { AuditLog, PaginatedApiResponse } from '@/types/api.types';
import apiClient from '@/lib/api-client';

const base = createResourceApi('/audit-logs');

export const auditLogApi = {
  ...base,
  list: async (params?: Record<string, any>) => {
    const { data } = await apiClient.get<PaginatedApiResponse<AuditLog>>('/audit-logs', { params });
    return data;
  },
};
