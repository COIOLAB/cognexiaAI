import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '@/services/dashboard.api';
import { toast } from 'sonner';
import type {
  CreateDashboardDto,
  UpdateDashboardDto,
  DashboardQueryDto,
} from '@/types/api.types';

const QUERY_KEYS = {
  dashboards: ['dashboards'] as const,
  dashboard: (id: string) => ['dashboards', id] as const,
  widgetData: (dashboardId: string, widgetId: string) =>
    ['dashboards', dashboardId, 'widgets', widgetId] as const,
  userMetrics: ['dashboards', 'user', 'metrics'] as const,
  salesFunnel: ['dashboards', 'user', 'sales-funnel'] as const,
  recentActivities: (limit: number) =>
    ['dashboards', 'user', 'recent-activities', limit] as const,
  teamActivities: (limit: number) =>
    ['dashboards', 'user', 'team-activities', limit] as const,
  teamMembers: ['dashboards', 'user', 'team-members'] as const,
  performanceMetrics: (period: 'day' | 'week' | 'month') =>
    ['dashboards', 'user', 'performance-metrics', period] as const,
  revenueMetrics: ['dashboards', 'user', 'revenue-metrics'] as const,
  marketingMetrics: ['dashboards', 'user', 'marketing-metrics'] as const,
  supportSlaMetrics: ['dashboards', 'user', 'support-sla'] as const,
  tierAnalytics: ['dashboards', 'user', 'tier-analytics'] as const,
};

// Get all dashboards
export const useGetDashboards = (query?: DashboardQueryDto) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.dashboards, query],
    queryFn: () => dashboardApi.getDashboards(query),
  });
};

// Get dashboard by ID
export const useGetDashboard = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard(id),
    queryFn: () => dashboardApi.getDashboardById(id),
    enabled: !!id,
  });
};

// Create dashboard
export const useCreateDashboard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDashboardDto) => dashboardApi.createDashboard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboards });
      toast.success('Dashboard created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create dashboard');
    },
  });
};

// Update dashboard
export const useUpdateDashboard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDashboardDto }) =>
      dashboardApi.updateDashboard(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboards });
      toast.success('Dashboard updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update dashboard');
    },
  });
};

// Delete dashboard
export const useDeleteDashboard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => dashboardApi.deleteDashboard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboards });
      toast.success('Dashboard deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete dashboard');
    },
  });
};

// Get widget data
export const useGetWidgetData = (
  dashboardId: string,
  widgetId: string,
  filters?: Record<string, any>
) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.widgetData(dashboardId, widgetId), filters],
    queryFn: () => dashboardApi.getWidgetData(dashboardId, widgetId, filters),
    enabled: !!dashboardId && !!widgetId,
  });
};

// User dashboard metrics
export const useUserDashboardMetrics = () => {
  return useQuery({
    queryKey: QUERY_KEYS.userMetrics,
    queryFn: () => dashboardApi.getUserMetrics(),
  });
};

// Sales funnel
export const useSalesFunnel = () => {
  return useQuery({
    queryKey: QUERY_KEYS.salesFunnel,
    queryFn: () => dashboardApi.getSalesFunnel(),
  });
};

// Recent activities
export const useRecentActivities = (limit: number = 6) => {
  return useQuery({
    queryKey: QUERY_KEYS.recentActivities(limit),
    queryFn: () => dashboardApi.getRecentActivities(limit),
  });
};

// Team activities
export const useTeamActivities = (limit: number = 10) => {
  return useQuery({
    queryKey: QUERY_KEYS.teamActivities(limit),
    queryFn: () => dashboardApi.getTeamActivities(limit),
  });
};

// Team members (direct reports)
export const useTeamMembers = () => {
  return useQuery({
    queryKey: QUERY_KEYS.teamMembers,
    queryFn: () => dashboardApi.getTeamMembers(),
  });
};

// Performance metrics
export const usePerformanceMetrics = (period: 'day' | 'week' | 'month' = 'month') => {
  return useQuery({
    queryKey: QUERY_KEYS.performanceMetrics(period),
    queryFn: () => dashboardApi.getPerformanceMetrics(period),
  });
};

// Revenue metrics
export const useRevenueMetrics = () => {
  return useQuery({
    queryKey: QUERY_KEYS.revenueMetrics,
    queryFn: () => dashboardApi.getRevenueMetrics(),
  });
};

// Marketing metrics
export const useMarketingMetrics = () => {
  return useQuery({
    queryKey: QUERY_KEYS.marketingMetrics,
    queryFn: () => dashboardApi.getMarketingMetrics(),
  });
};

// Support SLA metrics
export const useSupportSlaMetrics = () => {
  return useQuery({
    queryKey: QUERY_KEYS.supportSlaMetrics,
    queryFn: () => dashboardApi.getSupportSlaMetrics(),
  });
};

// Tier analytics
export const useTierAnalytics = () => {
  return useQuery({
    queryKey: QUERY_KEYS.tierAnalytics,
    queryFn: () => dashboardApi.getTierAnalytics(),
  });
};
