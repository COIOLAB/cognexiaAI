import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emailCampaignApi } from '@/services/emailCampaign.api';
import { toast } from 'sonner';
import type { EmailCampaign, EmailCampaignFilters, CreateEmailCampaignDto, UpdateEmailCampaignDto } from '@/types/api.types';

export const emailCampaignKeys = {
  all: ['emailCampaigns'] as const,
  lists: () => [...emailCampaignKeys.all, 'list'] as const,
  list: (filters?: EmailCampaignFilters) => [...emailCampaignKeys.lists(), filters] as const,
  details: () => [...emailCampaignKeys.all, 'detail'] as const,
  detail: (id: string) => [...emailCampaignKeys.details(), id] as const,
  stats: () => [...emailCampaignKeys.all, 'stats'] as const,
};

export const useGetEmailCampaigns = (filters?: EmailCampaignFilters) => {
  return useQuery({
    queryKey: emailCampaignKeys.list(filters),
    queryFn: () => emailCampaignApi.getEmailCampaigns(filters),
  });
};

export const useGetEmailCampaign = (id: string) => {
  return useQuery({
    queryKey: emailCampaignKeys.detail(id),
    queryFn: () => emailCampaignApi.getEmailCampaignById(id),
    enabled: !!id,
  });
};

export const useCreateEmailCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmailCampaignDto) => emailCampaignApi.createEmailCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emailCampaignKeys.lists() });
      queryClient.invalidateQueries({ queryKey: emailCampaignKeys.stats() });
      toast.success('Email campaign created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create email campaign');
    },
  });
};

export const useUpdateEmailCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmailCampaignDto }) =>
      emailCampaignApi.updateEmailCampaign(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: emailCampaignKeys.lists() });
      queryClient.invalidateQueries({ queryKey: emailCampaignKeys.detail(id) });
      toast.success('Email campaign updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update email campaign');
    },
  });
};

export const useDeleteEmailCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => emailCampaignApi.deleteEmailCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emailCampaignKeys.lists() });
      queryClient.invalidateQueries({ queryKey: emailCampaignKeys.stats() });
      toast.success('Email campaign deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete email campaign');
    },
  });
};

export const useSendEmailCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => emailCampaignApi.sendEmailCampaign(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: emailCampaignKeys.lists() });
      queryClient.invalidateQueries({ queryKey: emailCampaignKeys.detail(id) });
      toast.success('Email campaign sent successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to send email campaign');
    },
  });
};

export const useScheduleEmailCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, scheduledFor }: { id: string; scheduledFor: string }) =>
      emailCampaignApi.scheduleEmailCampaign(id, scheduledFor),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: emailCampaignKeys.lists() });
      queryClient.invalidateQueries({ queryKey: emailCampaignKeys.detail(id) });
      toast.success('Email campaign scheduled successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to schedule email campaign');
    },
  });
};

export const useTestEmailCampaign = () => {
  return useMutation({
    mutationFn: ({ id, email }: { id: string; email: string }) =>
      emailCampaignApi.testEmailCampaign(id, email),
    onSuccess: () => {
      toast.success('Test email sent successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to send test email');
    },
  });
};

export const useEmailStats = (id: string) => {
  return useQuery({
    queryKey: [...emailCampaignKeys.all, 'emailStats', id],
    queryFn: () => emailCampaignApi.getEmailStats(id),
    enabled: !!id,
  });
};

export const useEmailEngagement = (id: string) => {
  return useQuery({
    queryKey: [...emailCampaignKeys.all, 'engagement', id],
    queryFn: () => emailCampaignApi.getEmailEngagement(id),
    enabled: !!id,
  });
};

export const usePauseEmailCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => emailCampaignApi.pauseEmailCampaign(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: emailCampaignKeys.lists() });
      queryClient.invalidateQueries({ queryKey: emailCampaignKeys.detail(id) });
      toast.success('Email campaign paused successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to pause email campaign');
    },
  });
};

export const useEmailCampaignStats = () => {
  return useQuery({
    queryKey: emailCampaignKeys.stats(),
    queryFn: async () => {
      const response = await emailCampaignApi.getEmailCampaigns();
      const campaigns = response?.data?.campaigns || response?.data || response || [];
      const totals = campaigns.reduce(
        (acc: any, campaign: EmailCampaign) => {
          acc.totalSent += campaign.stats?.sent || 0;
          acc.totalOpenRate += campaign.stats?.openRate || 0;
          acc.totalClickRate += campaign.stats?.clickRate || 0;
          acc.totalConversions += campaign.stats?.conversions || 0;
          return acc;
        },
        { totalSent: 0, totalOpenRate: 0, totalClickRate: 0, totalConversions: 0 }
      );

      const count = campaigns.length || 1;

      return {
        data: {
          totalSent: totals.totalSent,
          openRate: Math.round((totals.totalOpenRate / count) * 10) / 10,
          clickRate: Math.round((totals.totalClickRate / count) * 10) / 10,
          conversions: totals.totalConversions,
        },
      };
    },
  });
};
