import apiClient from '@/lib/api-client';
import type { ApiResponse } from '@/types/api.types';

const BASE_URL = '/calls';

export const callsApi = {
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
  getMissed: async () => {
    const { data } = await apiClient.get<ApiResponse<any>>(`${BASE_URL}/missed`);
    return data;
  },
  getByAgent: async (agentId: string) => {
    const { data } = await apiClient.get<ApiResponse<any>>(`${BASE_URL}/agent/${agentId}`);
    return data;
  },
  getByCustomer: async (customerId: string) => {
    const { data } = await apiClient.get<ApiResponse<any>>(`${BASE_URL}/customer/${customerId}`);
    return data;
  },
  answer: async (id: string) => {
    const { data } = await apiClient.post<ApiResponse<any>>(`${BASE_URL}/${id}/answer`);
    return data;
  },
  hangup: async (id: string) => {
    const { data } = await apiClient.post<ApiResponse<any>>(`${BASE_URL}/${id}/hangup`);
    return data;
  },
  hold: async (id: string) => {
    const { data } = await apiClient.post<ApiResponse<any>>(`${BASE_URL}/${id}/hold`);
    return data;
  },
  resume: async (id: string) => {
    const { data } = await apiClient.post<ApiResponse<any>>(`${BASE_URL}/${id}/resume`);
    return data;
  },
  transfer: async (id: string, payload: any) => {
    const { data } = await apiClient.post<ApiResponse<any>>(`${BASE_URL}/${id}/transfer`, payload);
    return data;
  },
};
