import apiClient from '@/lib/api-client';
import type { ApiResponse } from '@/types/api.types';

export type WorkflowDefinition = {
  name: string;
  description?: string;
  trigger: any;
  steps: any[];
  created_by: string;
  tags?: string[];
};

export const workflowApi = {
  list: async () => {
    const { data } = await apiClient.get<ApiResponse<any[]>>('/workflows');
    return data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<any>>(`/workflows/${id}`);
    return data;
  },

  create: async (payload: WorkflowDefinition) => {
    const { data } = await apiClient.post<ApiResponse<any>>('/workflows', payload);
    return data;
  },

  update: async (id: string, payload: Partial<WorkflowDefinition>) => {
    const { data } = await apiClient.put<ApiResponse<any>>(`/workflows/${id}`, payload);
    return data;
  },

  remove: async (id: string) => {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/workflows/${id}`);
    return data;
  },

  execute: async (id: string, payload: any) => {
    const { data } = await apiClient.post<ApiResponse<any>>(`/workflows/${id}/execute`, payload);
    return data;
  },
};
