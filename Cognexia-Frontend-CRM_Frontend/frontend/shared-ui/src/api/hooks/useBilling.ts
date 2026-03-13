/**
 * Billing React Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { billingApi } from '../endpoints';
import type { BillingFilters } from '../types';

export const BILLING_KEYS = {
  all: ['billing'] as const,
  lists: () => [...BILLING_KEYS.all, 'list'] as const,
  list: (filters?: BillingFilters) => [...BILLING_KEYS.lists(), filters] as const,
  details: () => [...BILLING_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...BILLING_KEYS.details(), id] as const,
  orgBilling: (orgId: string) => [...BILLING_KEYS.all, 'organization', orgId] as const,
  summary: (orgId: string) => [...BILLING_KEYS.orgBilling(orgId), 'summary'] as const,
};

/**
 * Get all billing transactions
 */
export const useBillingTransactions = (filters?: BillingFilters) => {
  return useQuery({
    queryKey: BILLING_KEYS.list(filters),
    queryFn: () => billingApi.getAll(filters),
  });
};

/**
 * Get transaction by ID
 */
export const useBillingTransaction = (id: string) => {
  return useQuery({
    queryKey: BILLING_KEYS.detail(id),
    queryFn: () => billingApi.getById(id),
    enabled: !!id,
  });
};

/**
 * Get organization billing history
 */
export const useOrganizationBilling = (organizationId: string) => {
  return useQuery({
    queryKey: BILLING_KEYS.orgBilling(organizationId),
    queryFn: () => billingApi.getOrganizationBilling(organizationId),
    enabled: !!organizationId,
  });
};

/**
 * Get billing summary
 */
export const useBillingSummary = (organizationId: string) => {
  return useQuery({
    queryKey: BILLING_KEYS.summary(organizationId),
    queryFn: () => billingApi.getSummary(organizationId),
    enabled: !!organizationId,
  });
};

/**
 * Create billing transaction
 */
export const useCreateBillingTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: billingApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BILLING_KEYS.lists() });
    },
  });
};

/**
 * Retry payment
 */
export const useRetryPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: billingApi.retryPayment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: BILLING_KEYS.lists() });
      queryClient.setQueryData(BILLING_KEYS.detail(data.id), data);
    },
  });
};

/**
 * Refund transaction
 */
export const useRefundTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: billingApi.refund,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: BILLING_KEYS.lists() });
      queryClient.setQueryData(BILLING_KEYS.detail(data.id), data);
    },
  });
};

/**
 * Download invoice
 */
export const useDownloadInvoice = () => {
  return useMutation({
    mutationFn: billingApi.downloadInvoice,
  });
};
