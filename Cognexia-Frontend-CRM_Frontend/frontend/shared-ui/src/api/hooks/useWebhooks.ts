/**
 * Webhooks React Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { webhooksApi } from '../endpoints';
import type { CreateWebhookRequest } from '../types';

export const WEBHOOK_KEYS = {
  all: ['webhooks'] as const,
  lists: () => [...WEBHOOK_KEYS.all, 'list'] as const,
  list: (orgId: string) => [...WEBHOOK_KEYS.lists(), orgId] as const,
  details: () => [...WEBHOOK_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...WEBHOOK_KEYS.details(), id] as const,
  logs: (webhookId: string, page: number) =>
    [...WEBHOOK_KEYS.detail(webhookId), 'logs', page] as const,
};

/**
 * Get all webhooks for organization
 */
export const useWebhooks = (organizationId: string) => {
  return useQuery({
    queryKey: WEBHOOK_KEYS.list(organizationId),
    queryFn: () => webhooksApi.getAll(organizationId),
    enabled: !!organizationId,
  });
};

/**
 * Get webhook by ID
 */
export const useWebhook = (id: string) => {
  return useQuery({
    queryKey: WEBHOOK_KEYS.detail(id),
    queryFn: () => webhooksApi.getById(id),
    enabled: !!id,
  });
};

/**
 * Get webhook logs
 */
export const useWebhookLogs = (webhookId: string, page: number = 1) => {
  return useQuery({
    queryKey: WEBHOOK_KEYS.logs(webhookId, page),
    queryFn: () => webhooksApi.getLogs(webhookId, page),
    enabled: !!webhookId,
  });
};

/**
 * Create webhook
 */
export const useCreateWebhook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationId,
      data,
    }: {
      organizationId: string;
      data: CreateWebhookRequest;
    }) => webhooksApi.create(organizationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WEBHOOK_KEYS.lists() });
    },
  });
};

/**
 * Update webhook
 */
export const useUpdateWebhook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateWebhookRequest>;
    }) => webhooksApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: WEBHOOK_KEYS.lists() });
      queryClient.setQueryData(WEBHOOK_KEYS.detail(data.id), data);
    },
  });
};

/**
 * Delete webhook
 */
export const useDeleteWebhook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: webhooksApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WEBHOOK_KEYS.lists() });
    },
  });
};

/**
 * Toggle webhook
 */
export const useToggleWebhook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: webhooksApi.toggle,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: WEBHOOK_KEYS.lists() });
      queryClient.setQueryData(WEBHOOK_KEYS.detail(data.id), data);
    },
  });
};

/**
 * Test webhook
 */
export const useTestWebhook = () => {
  return useMutation({
    mutationFn: webhooksApi.test,
  });
};

/**
 * Regenerate webhook secret
 */
export const useRegenerateWebhookSecret = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: webhooksApi.regenerateSecret,
    onSuccess: (data) => {
      queryClient.setQueryData(WEBHOOK_KEYS.detail(data.id), data);
    },
  });
};
