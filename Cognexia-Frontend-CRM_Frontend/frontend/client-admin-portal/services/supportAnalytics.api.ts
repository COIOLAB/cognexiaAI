import { api } from '@/lib/api';
import type {
  SupportAnalytics,
  SupportOverview,
  AgentPerformance,
  CategoryBreakdown,
  ResponseTimeMetrics,
} from '@/types/api.types';

const ANALYTICS_BASE = '/crm/support/analytics';

export const supportAnalyticsApi = {
  // Get comprehensive support analytics
  getAnalytics: async (filters?: { startDate?: string; endDate?: string; period?: string }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const { data } = await api.get<SupportAnalytics>(
      `${ANALYTICS_BASE}?${params.toString()}`
    );
    return data;
  },

  // Get support overview dashboard data
  getOverview: async () => {
    const { data } = await api.get<SupportOverview>(`${ANALYTICS_BASE}/overview`);
    return data;
  },

  // Get ticket metrics
  getTicketMetrics: async (filters?: { startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const { data } = await api.get(`${ANALYTICS_BASE}/tickets?${params.toString()}`);
    return data;
  },

  // Get agent performance metrics
  getAgentPerformance: async (filters?: { startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const { data } = await api.get<{ data: AgentPerformance[] }>(
      `${ANALYTICS_BASE}/agents?${params.toString()}`
    );
    return data;
  },

  // Get category breakdown
  getCategoryBreakdown: async (filters?: { startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const { data } = await api.get<{ data: CategoryBreakdown[] }>(
      `${ANALYTICS_BASE}/categories?${params.toString()}`
    );
    return data;
  },

  // Get response time metrics
  getResponseTimes: async (filters?: { startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const { data } = await api.get<ResponseTimeMetrics>(
      `${ANALYTICS_BASE}/response-times?${params.toString()}`
    );
    return data;
  },

  // Export analytics report
  exportReport: async (filters?: {
    startDate?: string;
    endDate?: string;
    format?: 'csv' | 'pdf' | 'xlsx';
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const { data } = await api.get(`${ANALYTICS_BASE}/export?${params.toString()}`, {
      responseType: 'blob',
    });
    return data;
  },
};
