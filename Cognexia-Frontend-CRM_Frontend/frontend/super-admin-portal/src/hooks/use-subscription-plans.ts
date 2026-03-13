import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingInterval: 'monthly' | 'yearly';
  features: string[];
  includedUsers: number;
  trialDays: number;
}

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const response = await apiClient.get<SubscriptionPlan[]>('/subscription-plans');
      return (response.data as any)?.data ?? response.data;
    },
  });
}
