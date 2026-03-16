/**
 * Subscription Plans API Endpoints
 */

import { apiClient } from '../client';
import type {
  SubscriptionPlan,
  CreateSubscriptionPlanRequest,
  PaginatedResponse,
} from '../types';

export const subscriptionPlansApi = {
  /**
   * Get all subscription plans
   */
  getAll: async (): Promise<PaginatedResponse<SubscriptionPlan>> => {
    const response = await apiClient.get<PaginatedResponse<SubscriptionPlan>>(
      '/subscription-plans'
    );
    return response.data;
  },

  /**
   * Get subscription plan by ID
   */
  getById: async (id: string): Promise<SubscriptionPlan> => {
    const response = await apiClient.get<SubscriptionPlan>(
      `/subscription-plans/${id}`
    );
    return response.data;
  },

  /**
   * Create new subscription plan
   */
  create: async (
    data: CreateSubscriptionPlanRequest
  ): Promise<SubscriptionPlan> => {
    const response = await apiClient.post<SubscriptionPlan>(
      '/subscription-plans',
      data
    );
    return response.data;
  },

  /**
   * Update subscription plan
   */
  update: async (
    id: string,
    data: Partial<CreateSubscriptionPlanRequest>
  ): Promise<SubscriptionPlan> => {
    const response = await apiClient.patch<SubscriptionPlan>(
      `/subscription-plans/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete subscription plan
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/subscription-plans/${id}`);
  },

  /**
   * Get public plans (no auth required)
   */
  getPublicPlans: async (): Promise<SubscriptionPlan[]> => {
    const response = await apiClient.get<SubscriptionPlan[]>(
      '/subscription-plans/public'
    );
    return response.data;
  },
};
