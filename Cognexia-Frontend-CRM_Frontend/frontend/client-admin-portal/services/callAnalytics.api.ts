import apiClient from '@/lib/api-client';
import type { ApiResponse } from '@/types/api.types';

const BASE_URL = '/call-analytics';

export const callAnalyticsApi = {
  getSummary: async (params?: Record<string, any>) => {
    const { data } = await apiClient.get<ApiResponse<any>>(BASE_URL, { params });
    return data;
  },
  getTrends: async (params?: Record<string, any>) => {
    const { data } = await apiClient.get<ApiResponse<any>>(`${BASE_URL}/trends`, { params });
    return data;
  },
  getAgentPerformance: async (agentId: string, params?: Record<string, any>) => {
    const { data } = await apiClient.get<ApiResponse<any>>(
      `${BASE_URL}/agent/${agentId}/performance`,
      { params },
    );
    return data;
  },
};
