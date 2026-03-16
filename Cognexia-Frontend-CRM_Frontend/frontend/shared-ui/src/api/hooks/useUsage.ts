/**
 * Usage Tracking React Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usageApi } from '../endpoints';
import type { UsageFilters } from '../types';

export const USAGE_KEYS = {
  all: ['usage'] as const,
  metrics: (filters?: UsageFilters) => [...USAGE_KEYS.all, 'metrics', filters] as const,
  stats: (orgId: string) => [...USAGE_KEYS.all, 'stats', orgId] as const,
  breakdown: (orgId: string, startDate?: string, endDate?: string) =>
    [...USAGE_KEYS.all, 'breakdown', orgId, startDate, endDate] as const,
  trend: (orgId: string, metricType: string, days: number) =>
    [...USAGE_KEYS.all, 'trend', orgId, metricType, days] as const,
};

/**
 * Get usage metrics
 */
export const useUsageMetrics = (filters?: UsageFilters) => {
  return useQuery({
    queryKey: USAGE_KEYS.metrics(filters),
    queryFn: () => usageApi.getMetrics(filters),
  });
};

/**
 * Get organization usage stats
 */
export const useUsageStats = (organizationId: string) => {
  return useQuery({
    queryKey: USAGE_KEYS.stats(organizationId),
    queryFn: () => usageApi.getStats(organizationId),
    enabled: !!organizationId,
  });
};

/**
 * Get usage breakdown
 */
export const useUsageBreakdown = (
  organizationId: string,
  startDate?: string,
  endDate?: string
) => {
  return useQuery({
    queryKey: USAGE_KEYS.breakdown(organizationId, startDate, endDate),
    queryFn: () => usageApi.getBreakdown(organizationId, startDate, endDate),
    enabled: !!organizationId,
  });
};

/**
 * Get usage trend
 */
export const useUsageTrend = (
  organizationId: string,
  metricType: string,
  days: number = 30
) => {
  return useQuery({
    queryKey: USAGE_KEYS.trend(organizationId, metricType, days),
    queryFn: () => usageApi.getTrend(organizationId, metricType, days),
    enabled: !!organizationId && !!metricType,
  });
};

/**
 * Track usage metric
 */
export const useTrackUsage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usageApi.track,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USAGE_KEYS.all });
    },
  });
};
