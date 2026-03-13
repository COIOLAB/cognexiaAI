import { useQuery, useMutation } from '@tanstack/react-query';
import { analyticsApi } from '@/services/analytics.api';
import { toast } from 'sonner';
import type {
  FunnelAnalysisDto,
  CohortAnalysisDto,
  RevenueForecastDto,
} from '@/types/api.types';

const QUERY_KEYS = {
  conversionMetrics: ['analytics', 'conversion'] as const,
  bottlenecks: ['analytics', 'bottlenecks'] as const,
  pipelineForecast: ['analytics', 'pipeline-forecast'] as const,
};

// Funnel analysis
export const useFunnelAnalysis = () => {
  return useMutation({
    mutationFn: (data: FunnelAnalysisDto) => analyticsApi.funnelAnalysis(data),
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to analyze funnel');
    },
  });
};

// Get conversion metrics
export const useConversionMetrics = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.conversionMetrics, startDate, endDate],
    queryFn: () => analyticsApi.conversionMetrics(startDate, endDate),
  });
};

// Get bottlenecks
export const useBottlenecks = () => {
  return useQuery({
    queryKey: QUERY_KEYS.bottlenecks,
    queryFn: () => analyticsApi.bottlenecks(),
  });
};

// Cohort analysis
export const useCohortAnalysis = () => {
  return useMutation({
    mutationFn: (data: CohortAnalysisDto) => analyticsApi.cohortAnalysis(data),
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to analyze cohort');
    },
  });
};

// Revenue forecast
export const useRevenueForecast = () => {
  return useMutation({
    mutationFn: (data?: RevenueForecastDto) => analyticsApi.revenueForecast(data),
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to forecast revenue');
    },
  });
};

// Pipeline forecast
export const usePipelineForecast = () => {
  return useQuery({
    queryKey: QUERY_KEYS.pipelineForecast,
    queryFn: () => analyticsApi.pipelineForecast(),
  });
};
