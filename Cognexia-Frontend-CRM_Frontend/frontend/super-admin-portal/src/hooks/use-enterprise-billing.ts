import { useQuery, useMutation, UseQueryOptions } from '@tanstack/react-query';
import apiClient, { PaginatedResponse } from '@/lib/api-client';
import { queryClient } from '@/lib/query-client';
import { toast } from 'react-hot-toast';
import {
  BillingConfig,
  EnterprisePayment,
  CreatePaymentRequest,
  ApprovePaymentRequest,
  MarkPaidRequest,
  RejectRequest,
  PaymentFilters,
} from '@/types/enterprise-billing';

// Billing Configuration Hooks
export const useBillingConfig = (organizationId: string) =>
  useQuery<BillingConfig>({
    queryKey: ['billing-config', organizationId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/organizations/${organizationId}/billing-config`);
      return (data?.data ?? data) as BillingConfig;
    },
    enabled: !!organizationId,
  });

export const useUpdateBillingConfig = () =>
  useMutation({
    mutationFn: async ({
      organizationId,
      config,
    }: {
      organizationId: string;
      config: Partial<BillingConfig>;
    }) => {
      const response = await apiClient.patch(
        `/organizations/${organizationId}/billing-config`,
        config,
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['billing-config', variables.organizationId] });
      queryClient.invalidateQueries({ queryKey: ['organization', variables.organizationId] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Billing configuration updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update billing configuration');
    },
  });

export const useApproveOrganization = () =>
  useMutation({
    mutationFn: async (organizationId: string) => {
      const response = await apiClient.post(`/organizations/${organizationId}/approve-billing`);
      return response.data;
    },
    onSuccess: (_, organizationId) => {
      queryClient.invalidateQueries({ queryKey: ['billing-config', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['organization', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organization billing approved successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to approve organization');
    },
  });

export const useRejectOrganization = () =>
  useMutation({
    mutationFn: async ({ organizationId, reason }: { organizationId: string; reason: string }) => {
      const response = await apiClient.post(`/organizations/${organizationId}/reject-billing`, {
        reason,
      });
      return response.data;
    },
    onSuccess: (_, { organizationId }) => {
      queryClient.invalidateQueries({ queryKey: ['billing-config', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['organization', organizationId] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organization billing rejected');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reject organization');
    },
  });

// Enterprise Payment Hooks
export const useEnterprisePayments = (filters?: PaymentFilters) =>
  useQuery({
    queryKey: ['enterprise-payments', filters],
    queryFn: async () => {
      const { data } = await apiClient.get('/enterprise-payments', { params: filters });
      const payload = data?.data ?? data;
      
      if (Array.isArray(payload)) {
        return {
          data: payload,
          total: payload.length,
          page: 1,
          limit: payload.length,
          totalPages: 1,
        } as PaginatedResponse<EnterprisePayment>;
      }
      
      return {
        data: payload.data || payload,
        total: payload.total || 0,
        page: payload.page || 1,
        limit: payload.limit || 50,
        totalPages: payload.totalPages || 1,
        hasNext: payload.hasNext ?? false,
        hasPrevious: payload.hasPrevious ?? false,
      } as PaginatedResponse<EnterprisePayment>;
    },
  });

export const useEnterprisePayment = (paymentId: string) =>
  useQuery({
    queryKey: ['enterprise-payment', paymentId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/enterprise-payments/${paymentId}`);
      return (data?.data ?? data) as EnterprisePayment;
    },
    enabled: !!paymentId,
  });

export const useCreatePayment = () =>
  useMutation({
    mutationFn: async (data: CreatePaymentRequest) => {
      const response = await apiClient.post('/enterprise-payments', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enterprise-payments'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals-count'] });
      toast.success('Payment record created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create payment record');
    },
  });

export const useApprovePayment = () =>
  useMutation({
    mutationFn: async ({
      paymentId,
      data,
    }: {
      paymentId: string;
      data?: ApprovePaymentRequest;
    }) => {
      const response = await apiClient.post(`/enterprise-payments/${paymentId}/approve`, data || {});
      return response.data;
    },
    onSuccess: (_, { paymentId }) => {
      queryClient.invalidateQueries({ queryKey: ['enterprise-payments'] });
      queryClient.invalidateQueries({ queryKey: ['enterprise-payment', paymentId] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals-count'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Payment approved successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to approve payment');
    },
  });

export const useRejectPayment = () =>
  useMutation({
    mutationFn: async ({ paymentId, reason }: { paymentId: string; reason: string }) => {
      const response = await apiClient.post(`/enterprise-payments/${paymentId}/reject`, {
        reason,
      });
      return response.data;
    },
    onSuccess: (_, { paymentId }) => {
      queryClient.invalidateQueries({ queryKey: ['enterprise-payments'] });
      queryClient.invalidateQueries({ queryKey: ['enterprise-payment', paymentId] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals-count'] });
      toast.success('Payment rejected');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reject payment');
    },
  });

export const useMarkPaymentPaid = () =>
  useMutation({
    mutationFn: async ({ paymentId, data }: { paymentId: string; data: MarkPaidRequest }) => {
      const response = await apiClient.post(`/enterprise-payments/${paymentId}/mark-paid`, data);
      return response.data;
    },
    onSuccess: (_, { paymentId }) => {
      queryClient.invalidateQueries({ queryKey: ['enterprise-payments'] });
      queryClient.invalidateQueries({ queryKey: ['enterprise-payment', paymentId] });
      toast.success('Payment marked as paid successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to mark payment as paid');
    },
  });

export const useDeletePayment = () =>
  useMutation({
    mutationFn: async (paymentId: string) => {
      const response = await apiClient.delete(`/enterprise-payments/${paymentId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enterprise-payments'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals-count'] });
      toast.success('Payment deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete payment');
    },
  });

// Stats & Special Queries
export const usePendingApprovals = () =>
  useQuery({
    queryKey: ['pending-approvals'],
    queryFn: async () => {
      const { data } = await apiClient.get('/enterprise-payments/pending-approvals');
      const payload = data?.data ?? data;
      return (Array.isArray(payload) ? payload : []) as EnterprisePayment[];
    },
  });

export const usePendingApprovalsCount = () =>
  useQuery({
    queryKey: ['pending-approvals-count'],
    queryFn: async () => {
      const { data } = await apiClient.get('/enterprise-payments/stats/pending-count');
      return (data?.data?.count ?? 0) as number;
    },
  });

export const useOverduePayments = () =>
  useQuery({
    queryKey: ['overdue-payments'],
    queryFn: async () => {
      const { data } = await apiClient.get('/enterprise-payments/overdue');
      const payload = data?.data ?? data;
      return (Array.isArray(payload) ? payload : []) as EnterprisePayment[];
    },
  });
