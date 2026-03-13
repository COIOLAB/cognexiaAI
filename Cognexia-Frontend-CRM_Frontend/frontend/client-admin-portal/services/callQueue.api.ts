import apiClient from '@/lib/api-client';
import type { ApiResponse } from '@/types/api.types';

const BASE_URL = '/call-queues';

export const callQueueApi = {
  list: async (params?: Record<string, any>) => {
    const { data } = await apiClient.get<ApiResponse<any>>(BASE_URL, { params });
    return data;
  },
  getById: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<any>>(`${BASE_URL}/${id}`);
    return data;
  },
  create: async (payload: any) => {
    const { data } = await apiClient.post<ApiResponse<any>>(BASE_URL, payload);
    return data;
  },
  update: async (id: string, payload: any) => {
    const { data } = await apiClient.put<ApiResponse<any>>(`${BASE_URL}/${id}`, payload);
    return data;
  },
  remove: async (id: string) => {
    const { data } = await apiClient.delete<ApiResponse<any>>(`${BASE_URL}/${id}`);
    return data;
  },
  available: async () => {
    const { data } = await apiClient.get<ApiResponse<any>>(`${BASE_URL}/available`);
    return data;
  },
  getStatistics: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<any>>(`${BASE_URL}/${id}/statistics`);
    return data;
  },
  addAgent: async (id: string, agentId: string) => {
    const { data } = await apiClient.post<ApiResponse<any>>(`${BASE_URL}/${id}/agents`, { agentId });
    return data;
  },
  removeAgent: async (id: string, agentId: string) => {
    const { data } = await apiClient.delete<ApiResponse<any>>(`${BASE_URL}/${id}/agents/${agentId}`);
    return data;
  },
};
