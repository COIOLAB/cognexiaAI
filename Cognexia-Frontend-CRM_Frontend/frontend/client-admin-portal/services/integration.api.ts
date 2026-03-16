import apiClient from '@/lib/api-client';
import type { ApiResponse } from '@/types/api.types';

export type IntegrationConfig = {
  name: string;
  config: {
    name: string;
    type: 'ERP' | 'FINANCE' | 'HRMS' | 'EMAIL' | 'CALENDAR' | 'MESSAGING' | 'DATA_WAREHOUSE';
    credentials: Record<string, any>;
    endpoint?: string;
    api_key?: string;
    oauth_token?: string;
  };
};

export const integrationApi = {
  listStatuses: async () => {
    const { data } = await apiClient.get<ApiResponse<Record<string, any>>>('/integrations');
    return data;
  },

  register: async (payload: IntegrationConfig) => {
    const { data } = await apiClient.post<ApiResponse<void>>('/integrations/register', payload);
    return data;
  },

  sync: async (name: string, entity: string, payload: any) => {
    const { data } = await apiClient.post<ApiResponse<any>>(`/integrations/${name}/sync`, {
      entity,
      data: payload,
    });
    return data;
  },

  getHealth: async (name: string) => {
    const { data } = await apiClient.get<ApiResponse<any>>(`/integrations/${name}/health`);
    return data;
  },

  remove: async (name: string) => {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/integrations/${name}`);
    return data;
  },
};
