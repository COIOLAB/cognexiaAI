import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportApi } from '@/services/report.api';
import { toast } from 'sonner';
import type { CreateReportDto, UpdateReportDto, RunReportDto } from '@/types/api.types';

const QUERY_KEYS = {
  reports: ['reports'] as const,
  report: (id: string) => ['reports', id] as const,
  templates: ['reports', 'templates'] as const,
  reportResult: (id: string) => ['reports', id, 'result'] as const,
};

// Get all reports
export const useGetReports = () => {
  return useQuery({
    queryKey: QUERY_KEYS.reports,
    queryFn: () => reportApi.getReports(),
  });
};

// Get report by ID
export const useGetReport = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.report(id),
    queryFn: () => reportApi.getReportById(id),
    enabled: !!id,
  });
};

// Get report templates
export const useGetReportTemplates = () => {
  return useQuery({
    queryKey: QUERY_KEYS.templates,
    queryFn: () => reportApi.getReportTemplates(),
  });
};

// Create report
export const useCreateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReportDto) => reportApi.createReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reports });
      toast.success('Report created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create report');
    },
  });
};

// Update report
export const useUpdateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReportDto }) =>
      reportApi.updateReport(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.report(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reports });
      toast.success('Report updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update report');
    },
  });
};

// Delete report
export const useDeleteReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reportApi.deleteReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reports });
      toast.success('Report deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete report');
    },
  });
};

// Run report
export const useRunReport = (id: string) => {
  return useMutation({
    mutationFn: (params?: RunReportDto) => reportApi.runReport(id, params),
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to run report');
    },
  });
};
