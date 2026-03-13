import api from '@/lib/api';
import type {
  MarketingAnalytics,
  MarketingOverview,
  ChannelPerformance,
  ROIMetrics,
  EngagementTrend,
  ConversionFunnel,
} from '@/types/api.types';

export const marketingAnalyticsApi = {
  /**
   * Get marketing overview dashboard data
   */
  getOverview: async () => {
    const { data } = await api.get('/crm/marketing/analytics/overview');
    return data;
  },

  /**
   * Get comprehensive marketing analytics
   */
  getAnalytics: async (period: string = '30d') => {
    const { data } = await api.get('/crm/marketing/analytics', {
      params: { period },
    });
    return data;
  },

  /**
   * Get campaign analytics
   */
  getCampaignAnalytics: async (period: string = '30d') => {
    const { data } = await api.get('/crm/marketing/analytics/campaigns', {
      params: { period },
    });
    return data;
  },

  /**
   * Get email analytics
   */
  getEmailAnalytics: async (period: string = '30d') => {
    const { data } = await api.get('/crm/marketing/analytics/emails', {
      params: { period },
    });
    return data;
  },

  /**
   * Get channel performance
   */
  getChannelPerformance: async (period: string = '30d') => {
    const { data } = await api.get('/crm/marketing/analytics/channels', {
      params: { period },
    });
    return data;
  },

  /**
   * Get ROI metrics
   */
  getROIMetrics: async (period: string = '30d') => {
    const { data } = await api.get('/crm/marketing/analytics/roi', {
      params: { period },
    });
    return data;
  },

  /**
   * Get engagement trends
   */
  getEngagementTrends: async (period: string = '30d') => {
    const { data } = await api.get('/crm/marketing/analytics/engagement', {
      params: { period },
    });
    return data;
  },

  /**
   * Get conversion funnel
   */
  getConversionFunnel: async (period: string = '30d') => {
    const { data } = await api.get('/crm/marketing/analytics/funnel', {
      params: { period },
    });
    return data;
  },

  /**
   * Export analytics report
   */
  exportAnalytics: async (period: string = '30d', format: 'pdf' | 'csv' = 'pdf') => {
    const { data } = await api.get('/crm/marketing/analytics/export', {
      params: { period, format },
      responseType: 'blob',
    });
    return data;
  },
};
