/**
 * Dashboard API Endpoints
 */

import { apiClient } from '../client';
import type { PlatformMetrics, OrganizationMetrics } from '../types';

export const dashboardApi = {
  /**
   * Get platform-wide metrics (Super Admin)
   */
  getPlatformMetrics: async (): Promise<PlatformMetrics> => {
    const response = await apiClient.get<PlatformMetrics>(
      '/dashboard/platform'
    );
    return response.data;
  },

  /**
   * Get organization metrics (Client Admin)
   */
  getOrganizationMetrics: async (
    organizationId: string
  ): Promise<OrganizationMetrics> => {
    const response = await apiClient.get<OrganizationMetrics>(
      `/dashboard/organizations/${organizationId}`
    );
    return response.data;
  },

  /**
   * Get revenue chart data
   */
  getRevenueChart: async (
    days: number = 30
  ): Promise<
    Array<{
      date: string;
      revenue: number;
      newCustomers: number;
    }>
  > => {
    const response = await apiClient.get(
      `/dashboard/platform/revenue?days=${days}`
    );
    return response.data;
  },

  /**
   * Get organization growth chart
   */
  getOrganizationGrowth: async (
    days: number = 30
  ): Promise<
    Array<{
      date: string;
      active: number;
      trial: number;
      suspended: number;
    }>
  > => {
    const response = await apiClient.get(
      `/dashboard/platform/growth?days=${days}`
    );
    return response.data;
  },

  /**
   * Get top organizations by revenue
   */
  getTopOrganizations: async (
    limit: number = 10
  ): Promise<
    Array<{
      id: string;
      name: string;
      revenue: number;
      userCount: number;
    }>
  > => {
    const response = await apiClient.get(
      `/dashboard/platform/top-organizations?limit=${limit}`
    );
    return response.data;
  },
};
