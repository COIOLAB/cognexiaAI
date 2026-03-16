import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignApi } from '@/services/campaign.api';
import { toast } from 'sonner';
import type { Campaign, CampaignFilters, CreateCampaignDto, UpdateCampaignDto } from '@/types/api.types';

// Query Keys
export const campaignKeys = {
  all: ['campaigns'] as const,
  lists: () => [...campaignKeys.all, 'list'] as const,
  list: (filters?: CampaignFilters) => [...campaignKeys.lists(), filters] as const,
  details: () => [...campaignKeys.all, 'detail'] as const,
  detail: (id: string) => [...campaignKeys.details(), id] as const,
  stats: () => [...campaignKeys.all, 'stats'] as const,
  performance: (id: string) => [...campaignKeys.all, 'performance', id] as const,
};

/**
 * Get all campaigns with filters
 */
export const useGetCampaigns = (filters?: CampaignFilters) => {
  return useQuery({
    queryKey: campaignKeys.list(filters),
    queryFn: () => campaignApi.getCampaigns(filters),
  });
};

/**
 * Get campaign by ID
 */
export const useGetCampaign = (id: string) => {
  return useQuery({
    queryKey: campaignKeys.detail(id),
    queryFn: () => campaignApi.getCampaignById(id),
    enabled: !!id,
  });
};

/**
 * Create new campaign
 */
export const useCreateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCampaignDto) => campaignApi.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
      queryClient.invalidateQueries({ queryKey: campaignKeys.stats() });
      toast.success('Campaign created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create campaign');
    },
  });
};

/**
 * Update campaign
 */
export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCampaignDto }) =>
      campaignApi.updateCampaign(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: campaignKeys.stats() });
      toast.success('Campaign updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update campaign');
    },
  });
};

/**
 * Delete campaign
 */
export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => campaignApi.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
      queryClient.invalidateQueries({ queryKey: campaignKeys.stats() });
      toast.success('Campaign deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete campaign');
    },
  });
};

/**
 * Activate campaign
 */
export const useActivateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => campaignApi.activateCampaign(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: campaignKeys.stats() });
      toast.success('Campaign activated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to activate campaign');
    },
  });
};

/**
 * Pause campaign
 */
export const usePauseCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => campaignApi.pauseCampaign(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: campaignKeys.stats() });
      toast.success('Campaign paused successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to pause campaign');
    },
  });
};

/**
 * Complete campaign
 */
export const useCompleteCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => campaignApi.completeCampaign(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: campaignKeys.stats() });
      toast.success('Campaign completed successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to complete campaign');
    },
  });
};

/**
 * Get campaign statistics
 */
export const useCampaignStats = () => {
  return useQuery({
    queryKey: campaignKeys.stats(),
    queryFn: () => campaignApi.getCampaignStats(),
  });
};

/**
 * Get campaign performance
 */
export const useCampaignPerformance = (id: string) => {
  return useQuery({
    queryKey: campaignKeys.performance(id),
    queryFn: () => campaignApi.getCampaignPerformance(id),
    enabled: !!id,
  });
};

/**
 * Bulk delete campaigns
 */
export const useBulkDeleteCampaigns = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => campaignApi.bulkDeleteCampaigns(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
      queryClient.invalidateQueries({ queryKey: campaignKeys.stats() });
      toast.success('Campaigns deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete campaigns');
    },
  });
};
