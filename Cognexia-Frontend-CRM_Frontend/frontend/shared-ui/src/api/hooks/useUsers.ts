/**
 * Users React Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../endpoints';
import type { UserFilters } from '../types';

export const USER_KEYS = {
  all: ['users'] as const,
  lists: () => [...USER_KEYS.all, 'list'] as const,
  list: (filters?: UserFilters) => [...USER_KEYS.lists(), filters] as const,
  details: () => [...USER_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...USER_KEYS.details(), id] as const,
};

/**
 * Get all users
 */
export const useUsers = (filters?: UserFilters) => {
  return useQuery({
    queryKey: USER_KEYS.list(filters),
    queryFn: () => usersApi.getAll(filters),
  });
};

/**
 * Get user by ID
 */
export const useUser = (id: string) => {
  return useQuery({
    queryKey: USER_KEYS.detail(id),
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
  });
};

/**
 * Get users by organization
 */
export const useOrganizationUsers = (organizationId: string) => {
  return useQuery({
    queryKey: USER_KEYS.list({ organizationId }),
    queryFn: () => usersApi.getByOrganization(organizationId),
    enabled: !!organizationId,
  });
};

/**
 * Create user
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.lists() });
    },
  });
};

/**
 * Update user
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<any> }) =>
      usersApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.lists() });
      queryClient.setQueryData(USER_KEYS.detail(data.id), data);
    },
  });
};

/**
 * Delete user
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.lists() });
    },
  });
};

/**
 * Activate user
 */
export const useActivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersApi.activate,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.lists() });
      queryClient.setQueryData(USER_KEYS.detail(data.id), data);
    },
  });
};

/**
 * Deactivate user
 */
export const useDeactivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersApi.deactivate,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.lists() });
      queryClient.setQueryData(USER_KEYS.detail(data.id), data);
    },
  });
};

/**
 * Update user roles
 */
export const useUpdateUserRoles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, roles }: { id: string; roles: string[] }) =>
      usersApi.updateRoles(id, roles),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.lists() });
      queryClient.setQueryData(USER_KEYS.detail(data.id), data);
    },
  });
};
