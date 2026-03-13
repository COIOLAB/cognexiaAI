/**
 * Webhooks API Endpoints
 */

import { apiClient } from '../client';
import type {
  Webhook,
  CreateWebhookRequest,
  WebhookLog,
  PaginatedResponse,
} from '../types';

export const webhooksApi = {
  /**
   * Get all webhooks for organization
   */
  getAll: async (organizationId: string): Promise<Webhook[]> => {
    const response = await apiClient.get<Webhook[]>(
      `/webhooks?organizationId=${organizationId}`
    );
    return response.data;
  },

  /**
   * Get webhook by ID
   */
  getById: async (id: string): Promise<Webhook> => {
    const response = await apiClient.get<Webhook>(`/webhooks/${id}`);
    return response.data;
  },

  /**
   * Create new webhook
   */
  create: async (
    organizationId: string,
    data: CreateWebhookRequest
  ): Promise<Webhook> => {
    const response = await apiClient.post<Webhook>('/webhooks', {
      organizationId,
      ...data,
    });
    return response.data;
  },

  /**
   * Update webhook
   */
  update: async (
    id: string,
    data: Partial<CreateWebhookRequest>
  ): Promise<Webhook> => {
    const response = await apiClient.patch<Webhook>(`/webhooks/${id}`, data);
    return response.data;
  },

  /**
   * Delete webhook
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/webhooks/${id}`);
  },

  /**
   * Toggle webhook active status
   */
  toggle: async (id: string): Promise<Webhook> => {
    const response = await apiClient.post<Webhook>(`/webhooks/${id}/toggle`);
    return response.data;
  },

  /**
   * Test webhook
   */
  test: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
    }>(`/webhooks/${id}/test`);
    return response.data;
  },

  /**
   * Get webhook logs
   */
  getLogs: async (
    webhookId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<WebhookLog>> => {
    const response = await apiClient.get<PaginatedResponse<WebhookLog>>(
      `/webhooks/${webhookId}/logs?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  /**
   * Regenerate webhook secret
   */
  regenerateSecret: async (id: string): Promise<Webhook> => {
    const response = await apiClient.post<Webhook>(
      `/webhooks/${id}/regenerate-secret`
    );
    return response.data;
  },
};
