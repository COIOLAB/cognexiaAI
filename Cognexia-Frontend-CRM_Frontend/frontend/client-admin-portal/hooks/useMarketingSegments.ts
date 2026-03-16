import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { marketingSegmentApi } from '@/services/marketingSegment.api';
import { toast } from 'sonner';
import type { MarketingSegment, SegmentFilters, CreateSegmentDto, UpdateSegmentDto } from '@/types/api.types';

export const segmentKeys = {
  all: ['segments'] as const,
  lists: () => [...segmentKeys.all, 'list'] as const,
  list: (filters?: SegmentFilters) => [...segmentKeys.lists(), filters] as const,
  details: () => [...segmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...segmentKeys.details(), id] as const,
  stats: () => [...segmentKeys.all, 'stats'] as const,
};

export const useGetSegments = (filters?: SegmentFilters) => {
  return useQuery({
    queryKey: segmentKeys.list(filters),
    queryFn: () => marketingSegmentApi.getSegments(filters),
  });
};

export const useGetSegment = (id: string) => {
  return useQuery({
    queryKey: segmentKeys.detail(id),
    queryFn: () => marketingSegmentApi.getSegmentById(id),
    enabled: !!id,
  });
};

export const useCreateSegment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSegmentDto) => marketingSegmentApi.createSegment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: segmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: segmentKeys.stats() });
      toast.success('Segment created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create segment');
    },
  });
};

export const useUpdateSegment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSegmentDto }) =>
      marketingSegmentApi.updateSegment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: segmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: segmentKeys.detail(id) });
      toast.success('Segment updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update segment');
    },
  });
};

export const useDeleteSegment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => marketingSegmentApi.deleteSegment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: segmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: segmentKeys.stats() });
      toast.success('Segment deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete segment');
    },
  });
};

export const useSegmentSize = (id: string) => {
  return useQuery({
    queryKey: [...segmentKeys.all, 'size', id],
    queryFn: () => marketingSegmentApi.getSegmentSize(id),
    enabled: !!id,
  });
};

export const useRefreshSegment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => marketingSegmentApi.refreshSegment(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: segmentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: segmentKeys.lists() });
      toast.success('Segment refreshed successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to refresh segment');
    },
  });
};

export const useSegmentStats = () => {
  return useQuery({
    queryKey: segmentKeys.stats(),
    queryFn: () => marketingSegmentApi.getSegmentStats(),
  });
};

export const useBulkDeleteSegments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => marketingSegmentApi.bulkDeleteSegments(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: segmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: segmentKeys.stats() });
      toast.success('Segments deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete segments');
    },
  });
};
