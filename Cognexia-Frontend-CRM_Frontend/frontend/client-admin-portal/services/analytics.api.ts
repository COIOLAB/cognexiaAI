import apiClient from '@/lib/api-client';
import type {
  FunnelAnalysisDto,
  FunnelStageData,
  CohortAnalysisDto,
  RevenueForecastDto,
  ForecastDataPoint,
} from '@/types/api.types';

const BASE_URL = '/reporting/analytics';

export const analyticsApi = {
  // Funnel analysis
  funnelAnalysis: async (data: FunnelAnalysisDto): Promise<FunnelStageData[]> => {
    const response = await apiClient.post(`${BASE_URL}/funnel`, data);
    return response.data;
  },

  // Get conversion metrics
  conversionMetrics: async (
    startDate?: string,
    endDate?: string
  ): Promise<Record<string, any>> => {
    const response = await apiClient.get(`${BASE_URL}/conversion-metrics`, {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // Get pipeline bottlenecks
  bottlenecks: async (): Promise<any[]> => {
    const response = await apiClient.get(`${BASE_URL}/bottlenecks`);
    return response.data;
  },

  // Cohort analysis
  cohortAnalysis: async (data: CohortAnalysisDto): Promise<Record<string, any>> => {
    const response = await apiClient.post(`${BASE_URL}/cohort`, data);
    return response.data;
  },

  // Revenue forecast
  revenueForecast: async (data?: RevenueForecastDto): Promise<ForecastDataPoint[]> => {
    const response = await apiClient.post(`${BASE_URL}/forecast`, data || {});
    return response.data;
  },

  // Pipeline forecast
  pipelineForecast: async (): Promise<Record<string, any>> => {
    const response = await apiClient.get(`${BASE_URL}/pipeline-forecast`);
    return response.data;
  },
};
