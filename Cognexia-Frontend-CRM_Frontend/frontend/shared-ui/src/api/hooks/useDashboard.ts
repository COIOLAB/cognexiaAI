/**
 * Dashboard React Query Hooks
 */

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../endpoints';

export const DASHBOARD_KEYS = {
  all: ['dashboard'] as const,
  platform: () => [...DASHBOARD_KEYS.all, 'platform'] as const,
  organization: (orgId: string) =>
    [...DASHBOARD_KEYS.all, 'organization', orgId] as const,
  revenueChart: (days: number) =>
    [...DASHBOARD_KEYS.all, 'revenue-chart', days] as const,
  organizationGrowth: (days: number) =>
    [...DASHBOARD_KEYS.all, 'org-growth', days] as const,
  topOrganizations: (limit: number) =>
    [...DASHBOARD_KEYS.all, 'top-orgs', limit] as const,
};

/**
 * Get platform metrics (Super Admin)
 */
export const usePlatformMetrics = () => {
  return useQuery({
    queryKey: DASHBOARD_KEYS.platform(),
    queryFn: dashboardApi.getPlatformMetrics,
  });
};

/**
 * Get organization metrics (Client Admin)
 */
export const useOrganizationMetrics = (organizationId: string) => {
  return useQuery({
    queryKey: DASHBOARD_KEYS.organization(organizationId),
    queryFn: () => dashboardApi.getOrganizationMetrics(organizationId),
    enabled: !!organizationId,
  });
};

/**
 * Get revenue chart data
 */
export const useRevenueChart = (days: number = 30) => {
  return useQuery({
    queryKey: DASHBOARD_KEYS.revenueChart(days),
    queryFn: () => dashboardApi.getRevenueChart(days),
  });
};

/**
 * Get organization growth chart
 */
export const useOrganizationGrowth = (days: number = 30) => {
  return useQuery({
    queryKey: DASHBOARD_KEYS.organizationGrowth(days),
    queryFn: () => dashboardApi.getOrganizationGrowth(days),
  });
};

/**
 * Get top organizations by revenue
 */
export const useTopOrganizations = (limit: number = 10) => {
  return useQuery({
    queryKey: DASHBOARD_KEYS.topOrganizations(limit),
    queryFn: () => dashboardApi.getTopOrganizations(limit),
  });
};
