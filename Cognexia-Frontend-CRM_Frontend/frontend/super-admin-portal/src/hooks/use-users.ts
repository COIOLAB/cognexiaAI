import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient, { PaginatedResponse } from '@/lib/api-client';
import { queryClient } from '@/lib/query-client';
import { User, InviteUserRequest, UpdateUserRequest } from '@/types/user';
import { toast } from 'react-hot-toast';

export const useUsers = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  organizationId?: string;
}) =>
  useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      const { data } = await apiClient.get('/users', { params });
      const payload = data?.data ?? data;
      const rawUsers = payload.users || payload || [];
      const users = rawUsers.map((user: any) => ({
        ...user,
        organizationName: user.organization?.name || user.organizationName,
      }));
      const total = payload.total ?? users.length;
      const page = payload.page ?? params?.page ?? 1;
      const limit = payload.limit ?? params?.limit ?? 50;
      const totalPages = payload.totalPages ?? Math.ceil(total / limit);
      return {
        data: users,
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      } as PaginatedResponse<User>;
    },
  });

export const useUser = (id: string) =>
  useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const { data } = await apiClient.get<User>(`/users/${id}`);
      return data;
    },
    enabled: !!id,
  });

export const useInviteUser = () =>
  useMutation({
    mutationFn: async (data: InviteUserRequest) => {
      const response = await apiClient.post('/users/invite', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User invited successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to invite user');
    },
  });

export const useUpdateUser = () =>
  useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserRequest }) => {
      const response = await apiClient.patch(`/users/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
      toast.success('User updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update user');
    },
  });

export const useDeleteUser = () =>
  useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/users/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    },
  });
