import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient, { PaginatedResponse } from '@/lib/api-client';
import { queryClient } from '@/lib/query-client';
import {
  Organization,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  OrganizationStats,
} from '@/types/organization';
import { toast } from 'react-hot-toast';

export const useOrganizations = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) =>
  useQuery({
    queryKey: ['organizations', params],
    queryFn: async () => {
      const { data } = await apiClient.get('/organizations', { params });
      const payload = data?.data ?? data;
      const organizations = payload.organizations || [];
      const total = payload.total ?? organizations.length;
      const page = payload.page ?? params?.page ?? 1;
      const limit = payload.limit ?? params?.limit ?? 50;
      const totalPages = payload.totalPages ?? Math.ceil(total / limit);
      const normalized = organizations.map((org: any) => ({
        ...org,
        userCount: org.currentUserCount ?? org.userCount,
        owner: org.contactPersonName
          ? { id: '', name: org.contactPersonName, email: org.contactPersonEmail }
          : undefined,
      }));
      const filtered = normalized.filter((org: any) => !org.deletedAt);
      return {
        data: filtered,
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
        hasNext: page < Math.ceil(filtered.length / limit),
        hasPrevious: page > 1,
      } as PaginatedResponse<Organization>;
    },
  });

export const useOrganization = (id: string) =>
  useQuery({
    queryKey: ['organization', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Organization>(`/organizations/${id}`);
      return (data as any)?.data ?? data;
    },
    enabled: !!id,
  });

export const useOrganizationStats = (id: string) =>
  useQuery({
    queryKey: ['organization-stats', id],
    queryFn: async () => {
      const { data } = await apiClient.get<OrganizationStats>(`/organizations/${id}/statistics`);
      return (data as any)?.data ?? data;
    },
    enabled: !!id,
  });

export const useCreateOrganization = () =>
  useMutation({
    mutationFn: async (data: CreateOrganizationRequest) => {
      const response = await apiClient.post('/organizations', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organization created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create organization');
    },
  });

export const useUpdateOrganization = () =>
  useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateOrganizationRequest }) => {
      const response = await apiClient.put(`/organizations/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organization', variables.id] });
      toast.success('Organization updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update organization');
    },
  });

export const useSuspendOrganization = () =>
  useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/organizations/${id}/suspend`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organization suspended');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to suspend organization');
    },
  });

export const useActivateOrganization = () =>
  useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/organizations/${id}/activate`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organization activated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to activate organization');
    },
  });

export const useDeleteOrganization = () =>
  useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/organizations/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organization deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete organization');
    },
  });
