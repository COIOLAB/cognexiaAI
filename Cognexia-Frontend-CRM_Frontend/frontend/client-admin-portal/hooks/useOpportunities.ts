import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  updateOpportunityStage,
  getOpportunityPipeline,
  bulkDeleteOpportunities,
  exportOpportunities,
  getOpportunityStats,
  getWinLossAnalysis,
} from '@/services/opportunity.api';
import {
  Opportunity,
  CreateOpportunityDto,
  UpdateOpportunityDto,
  OpportunityFilters,
  OpportunityStage,
} from '@/types/api.types';

/**
 * Opportunity Hooks
 * React Query hooks for opportunity management
 */

// Query keys
export const opportunityKeys = {
  all: ['opportunities'] as const,
  lists: () => [...opportunityKeys.all, 'list'] as const,
  list: (filters?: OpportunityFilters) => [...opportunityKeys.lists(), filters] as const,
  details: () => [...opportunityKeys.all, 'detail'] as const,
  detail: (id: string) => [...opportunityKeys.details(), id] as const,
  stats: () => [...opportunityKeys.all, 'stats'] as const,
  pipeline: () => [...opportunityKeys.all, 'pipeline'] as const,
  winLoss: () => [...opportunityKeys.all, 'win-loss'] as const,
};

// Get paginated opportunities with filters
export const useOpportunities = (filters?: OpportunityFilters) => {
  return useQuery({
    queryKey: opportunityKeys.list(filters),
    queryFn: () => getOpportunities(filters),
    staleTime: 30000,
  });
};

// Get single opportunity by ID
export const useOpportunity = (id: string) => {
  return useQuery({
    queryKey: opportunityKeys.detail(id),
    queryFn: () => getOpportunityById(id),
    enabled: !!id,
  });
};

// Get opportunity statistics
export const useOpportunityStats = () => {
  return useQuery({
    queryKey: opportunityKeys.stats(),
    queryFn: getOpportunityStats,
    staleTime: 60000,
  });
};

// Get pipeline data
export const useOpportunityPipeline = () => {
  return useQuery({
    queryKey: opportunityKeys.pipeline(),
    queryFn: getOpportunityPipeline,
    staleTime: 30000,
  });
};

// Get win/loss analysis
export const useWinLossAnalysis = () => {
  return useQuery({
    queryKey: opportunityKeys.winLoss(),
    queryFn: getWinLossAnalysis,
    staleTime: 60000,
  });
};

// Create new opportunity
export const useCreateOpportunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOpportunityDto) => createOpportunity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: opportunityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: opportunityKeys.stats() });
      queryClient.invalidateQueries({ queryKey: opportunityKeys.pipeline() });
      toast.success('Opportunity created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create opportunity');
    },
  });
};

// Update existing opportunity
export const useUpdateOpportunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOpportunityDto }) =>
      updateOpportunity(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: opportunityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: opportunityKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: opportunityKeys.stats() });
      queryClient.invalidateQueries({ queryKey: opportunityKeys.pipeline() });
      toast.success('Opportunity updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update opportunity');
    },
  });
};

// Delete opportunity
export const useDeleteOpportunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteOpportunity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: opportunityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: opportunityKeys.stats() });
      queryClient.invalidateQueries({ queryKey: opportunityKeys.pipeline() });
      toast.success('Opportunity deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete opportunity');
    },
  });
};

// Update opportunity stage
export const useUpdateOpportunityStage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: OpportunityStage }) =>
      updateOpportunityStage(id, stage),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: opportunityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: opportunityKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: opportunityKeys.stats() });
      queryClient.invalidateQueries({ queryKey: opportunityKeys.pipeline() });
      toast.success('Opportunity stage updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update stage');
    },
  });
};

// Bulk delete opportunities
export const useBulkDeleteOpportunities = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteOpportunities(ids),
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: opportunityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: opportunityKeys.stats() });
      queryClient.invalidateQueries({ queryKey: opportunityKeys.pipeline() });
      toast.success(`${ids.length} opportunities deleted successfully`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete opportunities');
    },
  });
};

// Export opportunities to CSV
export const useExportOpportunities = () => {
  return useMutation({
    mutationFn: (filters?: OpportunityFilters) => exportOpportunities(filters),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `opportunities-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Opportunities exported successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to export opportunities');
    },
  });
};
