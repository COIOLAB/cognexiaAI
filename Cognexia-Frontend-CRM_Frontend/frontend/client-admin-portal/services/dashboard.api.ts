import apiClient from '@/lib/api-client';
import type {
  Dashboard,
  CreateDashboardDto,
  UpdateDashboardDto,
  DashboardQueryDto,
} from '@/types/api.types';

const BASE_URL = '/dashboards';

const unwrap = <T>(payload: any): T => {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return payload.data as T;
  }
  return payload as T;
};

export const dashboardApi = {
  // Get all dashboards
  getDashboards: async (
    query?: DashboardQueryDto
  ): Promise<{ data: Dashboard[]; total: number }> => {
    const response = await apiClient.get(BASE_URL, { params: query });
    const dashboards = unwrap<Dashboard[]>(response.data);
    return {
      data: dashboards,
      total: dashboards.length,
    };
  },

  // Get dashboard by ID
  getDashboardById: async (id: string): Promise<Dashboard> => {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return unwrap(response.data);
  },

  // Create new dashboard
  createDashboard: async (data: CreateDashboardDto): Promise<Dashboard> => {
    const response = await apiClient.post(BASE_URL, data);
    return unwrap(response.data);
  },

  // Update dashboard
  updateDashboard: async (id: string, data: UpdateDashboardDto): Promise<Dashboard> => {
    const response = await apiClient.put(`${BASE_URL}/${id}`, data);
    return unwrap(response.data);
  },

  // Delete dashboard
  deleteDashboard: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  // Get widget data
  getWidgetData: async (
    dashboardId: string,
    widgetId: string,
    filters?: Record<string, any>
  ): Promise<any> => {
    const response = await apiClient.post(`${BASE_URL}/${dashboardId}/widgets/${widgetId}/data`, filters);
    return unwrap(response.data);
  },

  // User dashboard metrics
  getUserMetrics: async () => {
    const response = await apiClient.get(`${BASE_URL}/user/metrics`);
    return unwrap(response.data);
  },

  // Sales funnel for dashboard
  getSalesFunnel: async () => {
    const response = await apiClient.get(`${BASE_URL}/user/sales-funnel`);
    return unwrap(response.data);
  },

  // Recent activities for dashboard
  getRecentActivities: async (limit: number = 10) => {
    const response = await apiClient.get(`${BASE_URL}/user/recent-activities`, {
      params: { limit },
    });
    return unwrap(response.data);
  },

  // Performance metrics for dashboard
  getPerformanceMetrics: async (period: 'day' | 'week' | 'month' = 'month') => {
    const response = await apiClient.get(`${BASE_URL}/user/performance-metrics`, {
      params: { period },
    });
    return unwrap(response.data);
  },

  // Revenue metrics for dashboard
  getRevenueMetrics: async () => {
    const response = await apiClient.get(`${BASE_URL}/user/revenue-metrics`);
    return unwrap(response.data);
  },

  // Marketing metrics for dashboard
  getMarketingMetrics: async () => {
    const response = await apiClient.get(`${BASE_URL}/user/marketing-metrics`);
    return unwrap(response.data);
  },

  // Support SLA metrics for dashboard
  getSupportSlaMetrics: async () => {
    const response = await apiClient.get(`${BASE_URL}/user/support-sla`);
    return unwrap(response.data);
  },

  // Tier analytics for dashboard
  getTierAnalytics: async () => {
    const response = await apiClient.get(`${BASE_URL}/user/tier-analytics`);
    return unwrap(response.data);
  },
};
