/**
 * Organizations React Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { organizationsApi } from '../endpoints';
import type {
  OrganizationFilters,
  UpdateOrganizationRequest,
} from '../types';

export const ORG_KEYS = {
  all: ['organizations'] as const,
  lists: () => [...ORG_KEYS.all, 'list'] as const,
  list: (filters?: OrganizationFilters) => [...ORG_KEYS.lists(), filters] as const,
  details: () => [...ORG_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...ORG_KEYS.details(), id] as const,
  stats: (id: string) => [...ORG_KEYS.detail(id), 'stats'] as const,
};

/**
 * Get all organizations
 */
export const useOrganizations = (filters?: OrganizationFilters) => {
  return useQuery({
    queryKey: ORG_KEYS.list(filters),
    queryFn: () => organizationsApi.getAll(filters),
  });
};

/**
 * Get organization by ID
 */
export const useOrganization = (id: string) => {
  return useQuery({
    queryKey: ORG_KEYS.detail(id),
    queryFn: () => organizationsApi.getById(id),
    enabled: !!id,
  });
};

/**
 * Get organization stats
 */
export const useOrganizationStats = (id: string) => {
  return useQuery({
    queryKey: ORG_KEYS.stats(id),
    queryFn: () => organizationsApi.getStats(id),
    enabled: !!id,
  });
};

/**
 * Create organization
 */
export const useCreateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: organizationsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORG_KEYS.lists() });
    },
  });
};

/**
 * Update organization
 */
export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrganizationRequest }) =>
      organizationsApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ORG_KEYS.lists() });
      queryClient.setQueryData(ORG_KEYS.detail(data.id), data);
    },
  });
};

/**
 * Delete organization
 */
export const useDeleteOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: organizationsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORG_KEYS.lists() });
    },
  });
};

/**
 * Suspend organization
 */
export const useSuspendOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: organizationsApi.suspend,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ORG_KEYS.lists() });
      queryClient.setQueryData(ORG_KEYS.detail(data.id), data);
    },
  });
};

/**
 * Activate organization
 */
export const useActivateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: organizationsApi.activate,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ORG_KEYS.lists() });
      queryClient.setQueryData(ORG_KEYS.detail(data.id), data);
    },
  });
};
