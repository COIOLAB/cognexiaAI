/**
 * Billing API Endpoints
 */

import { apiClient, buildQueryString } from '../client';
import type {
  BillingTransaction,
  CreateBillingTransactionRequest,
  BillingFilters,
  PaginatedResponse,
} from '../types';

export const billingApi = {
  /**
   * Get all billing transactions with filters
   */
  getAll: async (
    filters?: BillingFilters
  ): Promise<PaginatedResponse<BillingTransaction>> => {
    const queryString = buildQueryString(filters);
    const response = await apiClient.get<PaginatedResponse<BillingTransaction>>(
      `/billing/transactions${queryString}`
    );
    return response.data;
  },

  /**
   * Get transaction by ID
   */
  getById: async (id: string): Promise<BillingTransaction> => {
    const response = await apiClient.get<BillingTransaction>(
      `/billing/transactions/${id}`
    );
    return response.data;
  },

  /**
   * Create new billing transaction
   */
  create: async (
    data: CreateBillingTransactionRequest
  ): Promise<BillingTransaction> => {
    const response = await apiClient.post<BillingTransaction>(
      '/billing/transactions',
      data
    );
    return response.data;
  },

  /**
   * Get organization billing history
   */
  getOrganizationBilling: async (
    organizationId: string
  ): Promise<PaginatedResponse<BillingTransaction>> => {
    const response = await apiClient.get<PaginatedResponse<BillingTransaction>>(
      `/billing/organizations/${organizationId}/transactions`
    );
    return response.data;
  },

  /**
   * Get billing summary for organization
   */
  getSummary: async (
    organizationId: string
  ): Promise<{
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    failedAmount: number;
    transactionCount: number;
  }> => {
    const response = await apiClient.get(
      `/billing/organizations/${organizationId}/summary`
    );
    return response.data;
  },

  /**
   * Retry failed payment
   */
  retryPayment: async (transactionId: string): Promise<BillingTransaction> => {
    const response = await apiClient.post<BillingTransaction>(
      `/billing/transactions/${transactionId}/retry`
    );
    return response.data;
  },

  /**
   * Refund transaction
   */
  refund: async (transactionId: string): Promise<BillingTransaction> => {
    const response = await apiClient.post<BillingTransaction>(
      `/billing/transactions/${transactionId}/refund`
    );
    return response.data;
  },

  /**
   * Download invoice
   */
  downloadInvoice: async (transactionId: string): Promise<Blob> => {
    const response = await apiClient.get(
      `/billing/transactions/${transactionId}/invoice`,
      { responseType: 'blob' }
    );
    return response.data;
  },
};
