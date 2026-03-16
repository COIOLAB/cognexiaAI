import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import {
  PlatformMetrics,
  RevenueDataPoint,
  OrganizationGrowthDataPoint,
  ActivityLog,
  SystemHealth,
  SubscriptionDistribution,
} from '@/types/dashboard';

const unwrap = <T>(payload: any): T => (payload?.data ?? payload) as T;

export const usePlatformMetrics = () =>
  useQuery({
    queryKey: ['platform-metrics'],
    queryFn: async () => {
      const { data } = await apiClient.get('/dashboards/admin/platform-metrics');
      const metrics = unwrap<PlatformMetrics>(data);
      return {
        ...metrics,
        annualRecurringRevenue: metrics.monthlyRecurringRevenue * 12,
        averageRevenuePerUser: metrics.totalUsers ? metrics.totalRevenue / metrics.totalUsers : 0,
        newUsersThisMonth: 0,
        revenueThisMonth: metrics.totalRevenue,
        growthRate: 0,
      };
    },
  });

export const useRevenueData = (days: number = 30) =>
  useQuery({
    queryKey: ['revenue-data', days],
    queryFn: async () => {
      const year = new Date().getFullYear();
      const { data } = await apiClient.get(`/billing-transactions/reports/monthly-revenue`, {
        params: { year },
      });
      const rows = unwrap<{ month: number; revenue: number; transactionCount: number }[]>(data);
      return rows.map((row) => ({
        date: `${year}-${String(row.month).padStart(2, '0')}-01`,
        revenue: row.revenue,
        subscriptions: row.transactionCount,
        newOrganizations: 0,
      })) as RevenueDataPoint[];
    },
  });

export const useOrganizationGrowth = (days: number = 30) =>
  useQuery({
    queryKey: ['organization-growth', days],
    queryFn: async () => {
      const { data } = await apiClient.get(`/dashboards/admin/growth-statistics?days=${days}`);
      const stats = unwrap<any>(data);
      const today = new Date().toISOString().slice(0, 10);
      return [
        {
          date: today,
          total: stats.newOrganizations || 0,
          active: stats.newOrganizations || 0,
          trial: 0,
          churned: stats.churnedOrganizations || 0,
        },
      ] as OrganizationGrowthDataPoint[];
    },
  });

export const useActivityLog = (limit: number = 10) =>
  useQuery({
    queryKey: ['activity-log', limit],
    queryFn: async () => {
      const { data } = await apiClient.get(`/audit-logs`, { params: { limit } });
      return unwrap<ActivityLog[]>(data);
    },
  });

export const useSubscriptionDistribution = () =>
  useQuery({
    queryKey: ['subscription-distribution'],
    queryFn: async () => {
      const { data } = await apiClient.get(`/dashboards/admin/plan-distribution`);
      const rows = unwrap<any[]>(data);
      return rows.map((row) => ({
        planName: row.planName,
        count: row.organizationCount ?? row.count ?? 0,
        revenue: row.revenue ?? 0,
        percentage: row.percentage ?? 0,
      })) as SubscriptionDistribution[];
    },
  });

export const useSystemHealth = () =>
  useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      const { data } = await apiClient.get('/dashboards/admin/system-health');
      const health = unwrap<any>(data);
      const status = health.database === 'down' ? 'DOWN' : health.database === 'degraded' ? 'DEGRADED' : 'HEALTHY';
      const upFlag = health.database === 'down' ? 'DOWN' : 'UP';
      return {
        status,
        apiStatus: upFlag,
        databaseStatus: upFlag,
        redisStatus: 'UP',
        stripeStatus: 'UP',
        emailServiceStatus: 'UP',
        uptime: 0,
        avgResponseTime: health.apiResponseTime ?? 0,
        errorRate: health.errorRate ?? 0,
        requestsPerMinute: 0,
        lastChecked: new Date().toISOString(),
      } as SystemHealth;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
