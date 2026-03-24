import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { slaApi } from '@/services/sla.api';
import { toast } from 'sonner';
import type {
  SLAPolicy,
  CreateSLADto,
  UpdateSLADto,
} from '@/types/api.types';

const QUERY_KEYS = {
  policies: ['sla-policies'] as const,
  policy: (id: string) => ['sla-policies', id] as const,
  violations: ['sla', 'violations'] as const,
  metrics: ['sla', 'metrics'] as const,
  compliance: (ticketId: string) => ['sla', 'compliance', ticketId] as const,
};

// Get all SLA policies
export const useGetSLAPolicies = () => {
  return useQuery({
    queryKey: QUERY_KEYS.policies,
    queryFn: () => slaApi.getSLAPolicies(),
  });
};

// Get SLA policy by ID
export const useGetSLA = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.policy(id),
    queryFn: () => slaApi.getSLAById(id),
    enabled: !!id,
  });
};

// Create SLA policy
export const useCreateSLA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSLADto) => slaApi.createSLA(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.policies });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.metrics });
      toast.success('SLA policy created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create SLA policy');
    },
  });
};

// Update SLA policy
export const useUpdateSLA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSLADto }) =>
      slaApi.updateSLA(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.policy(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.policies });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.metrics });
      toast.success('SLA policy updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update SLA policy');
    },
  });
};

// Delete SLA policy
export const useDeleteSLA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => slaApi.deleteSLA(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.policies });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.metrics });
      toast.success('SLA policy deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete SLA policy');
    },
  });
};

// Check SLA compliance
export const useCheckCompliance = () => {
  return useMutation({
    mutationFn: (ticketId: string) => slaApi.checkCompliance(ticketId),
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to check compliance');
    },
  });
};

// Get SLA violations
export const useSLAViolations = (filters?: {
  startDate?: string;
  endDate?: string;
  priority?: string;
}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.violations, filters],
    queryFn: () => slaApi.getSLAViolations(filters),
  });
};

// Get SLA metrics
export const useSLAMetrics = (filters?: {
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.metrics, filters],
    queryFn: () => slaApi.getSLAMetrics(filters),
  });
};
