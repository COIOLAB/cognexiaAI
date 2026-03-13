import { useQuery } from '@tanstack/react-query';
import { marketingAnalyticsApi } from '@/services/marketingAnalytics.api';

export const analyticsKeys = {
  all: ['marketingAnalytics'] as const,
  overview: () => [...analyticsKeys.all, 'overview'] as const,
  analytics: (period?: string) => [...analyticsKeys.all, 'analytics', period] as const,
  campaigns: (period?: string) => [...analyticsKeys.all, 'campaigns', period] as const,
  emails: (period?: string) => [...analyticsKeys.all, 'emails', period] as const,
  channels: (period?: string) => [...analyticsKeys.all, 'channels', period] as const,
  roi: (period?: string) => [...analyticsKeys.all, 'roi', period] as const,
  engagement: (period?: string) => [...analyticsKeys.all, 'engagement', period] as const,
  funnel: (period?: string) => [...analyticsKeys.all, 'funnel', period] as const,
};

export const useMarketingOverview = () => {
  return useQuery({
    queryKey: analyticsKeys.overview(),
    queryFn: () => marketingAnalyticsApi.getOverview(),
  });
};

export const useMarketingAnalytics = (period: string = '30d') => {
  return useQuery({
    queryKey: analyticsKeys.analytics(period),
    queryFn: () => marketingAnalyticsApi.getAnalytics(period),
  });
};

export const useCampaignAnalytics = (period: string = '30d') => {
  return useQuery({
    queryKey: analyticsKeys.campaigns(period),
    queryFn: () => marketingAnalyticsApi.getCampaignAnalytics(period),
  });
};

export const useEmailAnalytics = (period: string = '30d') => {
  return useQuery({
    queryKey: analyticsKeys.emails(period),
    queryFn: () => marketingAnalyticsApi.getEmailAnalytics(period),
  });
};

export const useChannelPerformance = (period: string = '30d') => {
  return useQuery({
    queryKey: analyticsKeys.channels(period),
    queryFn: () => marketingAnalyticsApi.getChannelPerformance(period),
  });
};

export const useROIMetrics = (period: string = '30d') => {
  return useQuery({
    queryKey: analyticsKeys.roi(period),
    queryFn: () => marketingAnalyticsApi.getROIMetrics(period),
  });
};

export const useEngagementTrends = (period: string = '30d') => {
  return useQuery({
    queryKey: analyticsKeys.engagement(period),
    queryFn: () => marketingAnalyticsApi.getEngagementTrends(period),
  });
};

export const useConversionFunnel = (period: string = '30d') => {
  return useQuery({
    queryKey: analyticsKeys.funnel(period),
    queryFn: () => marketingAnalyticsApi.getConversionFunnel(period),
  });
};
