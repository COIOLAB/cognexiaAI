/**
 * Subscription Plans React Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { subscriptionPlansApi } from '../endpoints';

export const PLAN_KEYS = {
  all: ['subscription-plans'] as const,
  lists: () => [...PLAN_KEYS.all, 'list'] as const,
  list: () => [...PLAN_KEYS.lists()] as const,
  details: () => [...PLAN_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PLAN_KEYS.details(), id] as const,
  public: () => [...PLAN_KEYS.all, 'public'] as const,
};

/**
 * Get all subscription plans
 */
export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: PLAN_KEYS.list(),
    queryFn: subscriptionPlansApi.getAll,
  });
};

/**
 * Get subscription plan by ID
 */
export const useSubscriptionPlan = (id: string) => {
  return useQuery({
    queryKey: PLAN_KEYS.detail(id),
    queryFn: () => subscriptionPlansApi.getById(id),
    enabled: !!id,
  });
};

/**
 * Get public plans (no auth required)
 */
export const usePublicPlans = () => {
  return useQuery({
    queryKey: PLAN_KEYS.public(),
    queryFn: subscriptionPlansApi.getPublicPlans,
  });
};

/**
 * Create subscription plan
 */
export const useCreateSubscriptionPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: subscriptionPlansApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLAN_KEYS.lists() });
    },
  });
};

/**
 * Update subscription plan
 */
export const useUpdateSubscriptionPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<any>;
    }) => subscriptionPlansApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PLAN_KEYS.lists() });
      queryClient.setQueryData(PLAN_KEYS.detail(data.id), data);
    },
  });
};

/**
 * Delete subscription plan
 */
export const useDeleteSubscriptionPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: subscriptionPlansApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLAN_KEYS.lists() });
    },
  });
};
