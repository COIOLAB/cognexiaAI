import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient, { PaginatedResponse } from '@/lib/api-client';
import { queryClient } from '@/lib/query-client';
import {
  SubscriptionPlan,
  Transaction,
  BillingMetrics,
  CreatePlanRequest,
  UpdatePlanRequest,
} from '@/types/subscription';
import { toast } from 'react-hot-toast';

export const useBillingMetrics = () =>
  useQuery({
    queryKey: ['billing-metrics'],
    queryFn: async () => {
      const [revenueRes, statsRes] = await Promise.all([
        apiClient.get('/dashboards/admin/revenue-metrics'),
        apiClient.get('/billing-transactions/reports/stats'),
      ]);
      const revenue = (revenueRes.data?.data ?? revenueRes.data) as any;
      const stats = (statsRes.data?.data ?? statsRes.data) as any;
      const totalTransactions =
        (stats.successfulTransactions || 0) + (stats.failedTransactions || 0);
      return {
        totalRevenue: revenue.totalRevenue || stats.totalRevenue || 0,
        monthlyRecurringRevenue: revenue.monthlyRecurringRevenue || 0,
        annualRecurringRevenue: revenue.annualRecurringRevenue || 0,
        averageRevenuePerUser: revenue.averageRevenuePerUser || 0,
        totalTransactions,
        successfulTransactions: stats.successfulTransactions || 0,
        failedTransactions: stats.failedTransactions || 0,
        refundedAmount: stats.totalRefunds || 0,
      } as BillingMetrics;
    },
  });

export const useTransactions = (params?: {
  page?: number;
  limit?: number;
  organizationId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}) =>
  useQuery({
    queryKey: ['transactions', params],
    queryFn: async () => {
      const { data } = await apiClient.get('/billing-transactions', { params });
      const payload = data?.data ?? data;
      const transactions = payload.transactions || [];
      const total = payload.total ?? transactions.length;
      const page = payload.page ?? 1;
      const limit = payload.limit ?? params?.limit ?? 50;
      const totalPages = payload.totalPages ?? Math.ceil(total / limit);
      return {
        data: transactions,
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      } as PaginatedResponse<Transaction>;
    },
  });

export const useSubscriptionPlans = () =>
  useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data } = await apiClient.get<SubscriptionPlan[]>('/subscription-plans');
      return (data as any)?.data ?? data;
    },
  });

export const useSubscriptionPlan = (id: string) =>
  useQuery({
    queryKey: ['subscription-plan', id],
    queryFn: async () => {
      const { data } = await apiClient.get<SubscriptionPlan>(`/subscription-plans/${id}`);
      return (data as any)?.data ?? data;
    },
    enabled: !!id,
  });

export const useCreatePlan = () =>
  useMutation({
    mutationFn: async (data: CreatePlanRequest) => {
      const response = await apiClient.post('/subscription-plans', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      toast.success('Plan created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create plan');
    },
  });

export const useUpdatePlan = () =>
  useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePlanRequest }) => {
      const response = await apiClient.patch(`/subscription-plans/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-plan', variables.id] });
      toast.success('Plan updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update plan');
    },
  });

export const useExportTransactions = () =>
  useMutation({
    mutationFn: async (params: {
      startDate: string;
      endDate: string;
      organizationId?: string;
    }) => {
      const response = await apiClient.get('/billing-transactions/reports/export-csv', {
        params,
        responseType: 'blob',
      });
      return response.data;
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Transactions exported successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to export transactions');
    },
  });
