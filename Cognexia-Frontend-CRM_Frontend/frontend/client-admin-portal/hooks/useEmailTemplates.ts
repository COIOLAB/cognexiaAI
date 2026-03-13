import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emailTemplateApi } from '@/services/emailTemplate.api';
import { toast } from 'sonner';
import type { EmailTemplate, TemplateFilters, CreateEmailTemplateDto, UpdateEmailTemplateDto } from '@/types/api.types';

// Query Keys
export const templateKeys = {
  all: ['templates'] as const,
  lists: () => [...templateKeys.all, 'list'] as const,
  list: (filters?: TemplateFilters) => [...templateKeys.lists(), filters] as const,
  details: () => [...templateKeys.all, 'detail'] as const,
  detail: (id: string) => [...templateKeys.details(), id] as const,
  stats: () => [...templateKeys.all, 'stats'] as const,
  usage: (id: string) => [...templateKeys.all, 'usage', id] as const,
};

export const useGetTemplates = (filters?: TemplateFilters) => {
  return useQuery({
    queryKey: templateKeys.list(filters),
    queryFn: () => emailTemplateApi.getTemplates(filters),
  });
};

export const useGetTemplate = (id: string) => {
  return useQuery({
    queryKey: templateKeys.detail(id),
    queryFn: () => emailTemplateApi.getTemplateById(id),
    enabled: !!id,
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmailTemplateDto) => emailTemplateApi.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: templateKeys.stats() });
      toast.success('Template created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create template');
    },
  });
};

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmailTemplateDto }) =>
      emailTemplateApi.updateTemplate(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: templateKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: templateKeys.stats() });
      toast.success('Template updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update template');
    },
  });
};

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => emailTemplateApi.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: templateKeys.stats() });
      toast.success('Template deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete template');
    },
  });
};

export const useDuplicateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => emailTemplateApi.duplicateTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: templateKeys.stats() });
      toast.success('Template duplicated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to duplicate template');
    },
  });
};

export const useTemplateStats = () => {
  return useQuery({
    queryKey: templateKeys.stats(),
    queryFn: () => emailTemplateApi.getTemplateStats(),
  });
};

export const useTestTemplate = () => {
  return useMutation({
    mutationFn: ({ id, email }: { id: string; email: string }) =>
      emailTemplateApi.testTemplate(id, email),
    onSuccess: () => {
      toast.success('Test email sent successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to send test email');
    },
  });
};

export const useTemplateUsage = (id: string) => {
  return useQuery({
    queryKey: templateKeys.usage(id),
    queryFn: () => emailTemplateApi.getTemplateUsage(id),
    enabled: !!id,
  });
};

export const useBulkDeleteTemplates = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => emailTemplateApi.bulkDeleteTemplates(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: templateKeys.stats() });
      toast.success('Templates deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete templates');
    },
  });
};
