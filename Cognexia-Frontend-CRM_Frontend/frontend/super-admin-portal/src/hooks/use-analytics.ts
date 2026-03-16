import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { ChurnAnalytics, CustomerMetrics } from '@/types/dashboard';

export const useRevenueAnalytics = (params: {
  startDate: string;
  endDate: string;
}) =>
  useQuery({
    queryKey: ['revenue-analytics', params],
    queryFn: async () => {
      const { data } = await apiClient.get('/dashboards/admin/revenue-metrics', { params });
      return (data as any)?.data ?? data;
    },
  });

export const useChurnAnalytics = (params: {
  startDate: string;
  endDate: string;
}) =>
  useQuery({
    queryKey: ['churn-analytics', params],
    queryFn: async () => {
      const [metricsRes, growthRes] = await Promise.all([
        apiClient.get('/dashboards/admin/platform-metrics'),
        apiClient.get('/dashboards/admin/growth-statistics', { params: { days: 30 } }),
      ]);
      const metrics = (metricsRes.data as any)?.data ?? metricsRes.data;
      const growth = (growthRes.data as any)?.data ?? growthRes.data;
      return {
        churnRate: metrics.churnRate || 0,
        churnedOrganizations: growth.churnedOrganizations || 0,
        churnReasonDistribution: [],
        churnTrend: [],
      } as ChurnAnalytics;
    },
  });

export const useCustomerMetrics = () =>
  useQuery({
    queryKey: ['customer-metrics'],
    queryFn: async () => {
      const { data } = await apiClient.get('/dashboards/admin/platform-metrics');
      const metrics = (data as any)?.data ?? data;
      return {
        totalCustomers: metrics.totalUsers || 0,
        activeCustomers: metrics.activeUsers || 0,
        averageLifetimeValue: 0,
        averageCustomerAge: 0,
        retentionRate: 0,
        customersByPlan: [],
      } as CustomerMetrics;
    },
  });

export const useUserGrowth = (days: number = 30) =>
  useQuery({
    queryKey: ['user-growth', days],
    queryFn: async () => {
      const { data } = await apiClient.get(`/dashboards/admin/growth-statistics?days=${days}`);
      return (data as any)?.data ?? data;
    },
  });
