import { useQuery } from '@tanstack/react-query';
import {
  getSalesAnalytics,
  getSalesPipeline,
  getSalesForecast,
  getTeamPerformance,
  getSalesQuotas,
} from '@/services/salesAnalytics.api';

const QUERY_KEYS = {
  SALES_ANALYTICS: 'sales-analytics',
  SALES_PIPELINE: 'sales-pipeline',
  SALES_FORECAST: 'sales-forecast',
  TEAM_PERFORMANCE: 'team-performance',
  SALES_QUOTAS: 'sales-quotas',
};

/**
 * Fetch sales analytics with KPIs and trends
 */
export const useSalesAnalytics = (params: {
  period?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  salesRep?: string;
  dateFrom?: string;
  dateTo?: string;
} = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SALES_ANALYTICS, params],
    queryFn: () => getSalesAnalytics(params),
  });
};

/**
 * Fetch sales pipeline data
 */
export const useSalesPipeline = (params?: {
  salesRep?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SALES_PIPELINE, params],
    queryFn: () => getSalesPipeline(params),
  });
};

/**
 * Fetch sales forecast
 */
export const useSalesForecast = (params?: {
  period?: 'monthly' | 'quarterly' | 'yearly';
  includeConfidenceInterval?: boolean;
}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SALES_FORECAST, params],
    queryFn: () => getSalesForecast(params),
  });
};

/**
 * Fetch team performance metrics
 */
export const useTeamPerformance = (params?: {
  period?: string;
  teamId?: string;
}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TEAM_PERFORMANCE, params],
    queryFn: () => getTeamPerformance(params),
  });
};

/**
 * Fetch sales quotas
 */
export const useSalesQuotas = (params?: {
  period?: string;
  salesRep?: string;
}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SALES_QUOTAS, params],
    queryFn: () => getSalesQuotas(params),
  });
};
