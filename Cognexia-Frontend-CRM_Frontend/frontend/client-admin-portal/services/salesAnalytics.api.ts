import apiClient from '@/lib/api-client';
import type {
  ApiResponse,
  SalesAnalytics,
  PipelineData,
  SalesForecast,
  TeamPerformance,
  TeamQuotas,
} from '@/types/api.types';

const BASE_URL = '/crm/sales';

/**
 * Get sales analytics with KPIs, trends, and insights
 */
export const getSalesAnalytics = async (_params?: {
  period?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  salesRep?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<ApiResponse<SalesAnalytics>> => {
  const { data } = await apiClient.get<ApiResponse<SalesAnalytics>>(`${BASE_URL}/metrics`);
  return data;
};

/**
 * Get sales pipeline overview with stages and conversion rates
 */
export const getSalesPipeline = async (params?: {
  salesRep?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<ApiResponse<PipelineData>> => {
  const queryParams = new URLSearchParams();

  if (params?.salesRep) queryParams.append('salesRep', params.salesRep);
  if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
  if (params?.dateTo) queryParams.append('dateTo', params.dateTo);

  const { data } = await apiClient.get<ApiResponse<PipelineData>>(
    `${BASE_URL}/pipeline?${queryParams.toString()}`
  );
  return data;
};

/**
 * Get sales forecast with scenarios and confidence intervals
 */
export const getSalesForecast = async (_params?: {
  period?: 'monthly' | 'quarterly' | 'yearly';
  includeConfidenceInterval?: boolean;
}): Promise<ApiResponse<SalesForecast>> => {
  const { data } = await apiClient.get<ApiResponse<SalesForecast>>(`${BASE_URL}/forecasting`);
  return data;
};

/**
 * Get sales team performance metrics
 */
export const getTeamPerformance = async (_params?: {
  period?: string;
  teamId?: string;
}): Promise<ApiResponse<TeamPerformance>> => {
  const { data } = await apiClient.get<ApiResponse<TeamPerformance>>(`${BASE_URL}/metrics`);
  return data;
};

/**
 * Get sales quotas and achievement tracking
 */
export const getSalesQuotas = async (_params?: {
  period?: string;
  salesRep?: string;
}): Promise<ApiResponse<TeamQuotas>> => {
  const { data } = await apiClient.get<ApiResponse<TeamQuotas>>(`${BASE_URL}/metrics`);
  return data;
};

export default {
  getSalesAnalytics,
  getSalesPipeline,
  getSalesForecast,
  getTeamPerformance,
  getSalesQuotas,
};
