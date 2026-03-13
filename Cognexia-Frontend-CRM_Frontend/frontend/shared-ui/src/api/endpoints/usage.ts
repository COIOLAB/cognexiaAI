/**
 * Usage Tracking API Endpoints
 */

import { apiClient, buildQueryString } from '../client';
import type {
  UsageMetric,
  UsageStats,
  UsageFilters,
  PaginatedResponse,
} from '../types';

export const usageApi = {
  /**
   * Get usage metrics with filters
   */
  getMetrics: async (
    filters?: UsageFilters
  ): Promise<PaginatedResponse<UsageMetric>> => {
    const queryString = buildQueryString(filters);
    const response = await apiClient.get<PaginatedResponse<UsageMetric>>(
      `/usage/metrics${queryString}`
    );
    return response.data;
  },

  /**
   * Get organization usage stats
   */
  getStats: async (organizationId: string): Promise<UsageStats> => {
    const response = await apiClient.get<UsageStats>(
      `/usage/organizations/${organizationId}/stats`
    );
    return response.data;
  },

  /**
   * Track usage metric
   */
  track: async (data: {
    organizationId: string;
    metricType: string;
    value: number;
    unit: string;
    metadata?: Record<string, any>;
  }): Promise<UsageMetric> => {
    const response = await apiClient.post<UsageMetric>('/usage/track', data);
    return response.data;
  },

  /**
   * Get usage breakdown by type
   */
  getBreakdown: async (
    organizationId: string,
    startDate?: string,
    endDate?: string
  ): Promise<
    Array<{
      metricType: string;
      totalValue: number;
      unit: string;
    }>
  > => {
    const queryString = buildQueryString({ startDate, endDate });
    const response = await apiClient.get(
      `/usage/organizations/${organizationId}/breakdown${queryString}`
    );
    return response.data;
  },

  /**
   * Get usage trend
   */
  getTrend: async (
    organizationId: string,
    metricType: string,
    days: number = 30
  ): Promise<
    Array<{
      date: string;
      value: number;
    }>
  > => {
    const response = await apiClient.get(
      `/usage/organizations/${organizationId}/trend?metricType=${metricType}&days=${days}`
    );
    return response.data;
  },
};
