import type { AxiosRequestConfig } from 'axios';
import apiClient from '@/lib/api-client';
import type { ApiResponse } from '@/types/api.types';

export function createResourceApi(baseUrl: string) {
  return {
    list: async (params?: Record<string, any>) => {
      const { data } = await apiClient.get<ApiResponse<any>>(baseUrl, { params });
      return data;
    },
    getById: async (id: string, params?: Record<string, any>) => {
      const { data } = await apiClient.get<ApiResponse<any>>(`${baseUrl}/${id}`, { params });
      return data;
    },
    create: async (payload: any) => {
      const { data } = await apiClient.post<ApiResponse<any>>(baseUrl, payload);
      return data;
    },
    update: async (id: string, payload: any) => {
      const { data } = await apiClient.put<ApiResponse<any>>(`${baseUrl}/${id}`, payload);
      return data;
    },
    remove: async (id: string) => {
      const { data } = await apiClient.delete<ApiResponse<any>>(`${baseUrl}/${id}`);
      return data;
    },
    request: async <T = any>(config: AxiosRequestConfig) => {
      const suffix = config.url ? `/${config.url.replace(/^\//, '')}` : '';
      const { data } = await apiClient.request<ApiResponse<T>>({
        ...config,
        url: `${baseUrl}${suffix}`,
      });
      return data;
    },
  };
}
