import api from '@/lib/api';
import type {
  EmailCampaign,
  CreateEmailCampaignDto,
  UpdateEmailCampaignDto,
  EmailCampaignFilters,
  EmailCampaignStats,
  EmailStats,
} from '@/types/api.types';

export const emailCampaignApi = {
  /**
   * Get all email campaigns with optional filters
   */
  getEmailCampaigns: async (filters?: EmailCampaignFilters) => {
    const { data } = await api.get('/email/campaigns', { params: filters });
    return data;
  },

  /**
   * Get email campaign by ID
   */
  getEmailCampaignById: async (id: string) => {
    const { data } = await api.get(`/email/campaigns/${id}`);
    return data;
  },

  /**
   * Create new email campaign
   */
  createEmailCampaign: async (campaignData: CreateEmailCampaignDto) => {
    const { data } = await api.post('/email/campaigns', campaignData);
    return data;
  },

  /**
   * Update email campaign
   */
  updateEmailCampaign: async (id: string, campaignData: UpdateEmailCampaignDto) => {
    const { data } = await api.put(`/email/campaigns/${id}`, campaignData);
    return data;
  },

  /**
   * Delete email campaign
   */
  deleteEmailCampaign: async (id: string) => {
    const { data } = await api.delete(`/email/campaigns/${id}`);
    return data;
  },

  /**
   * Send email campaign immediately
   */
  sendEmailCampaign: async (id: string) => {
    const { data } = await api.post(`/email/campaigns/${id}/send`);
    return data;
  },

  /**
   * Schedule email campaign
   */
  scheduleEmailCampaign: async (id: string, scheduledFor: string) => {
    const { data } = await api.post(`/email/campaigns/${id}/schedule`, {
      scheduledFor,
    });
    return data;
  },

  /**
   * Test email campaign (send to test email)
   */
  testEmailCampaign: async (id: string, email: string) => {
    const { data } = await api.post(`/email/campaigns/${id}/test`, { email });
    return data;
  },

  /**
   * Get email campaign statistics
   */
  getEmailStats: async (id: string) => {
    const { data } = await api.get(`/email/campaigns/${id}`);
    return data;
  },

  /**
   * Get email campaign engagement data
   */
  getEmailEngagement: async (id: string) => {
    const { data } = await api.get(`/email/campaigns/${id}/engagement`);
    return data;
  },

  /**
   * Get email campaign recipients
   */
  getEmailRecipients: async (id: string) => {
    const { data } = await api.get(`/email/campaigns/${id}/recipients`);
    return data;
  },

  /**
   * Pause email campaign
   */
  pauseEmailCampaign: async (id: string) => {
    const { data } = await api.post(`/email/campaigns/${id}/pause`);
    return data;
  },

  /**
   * Export email metrics
   */
  exportEmailMetrics: async (id: string, format: 'csv' | 'excel' = 'csv') => {
    const { data } = await api.get(`/email/campaigns/${id}/export`, {
      params: { format },
      responseType: 'blob',
    });
    return data;
  },

  /**
   * Get overall email campaign statistics
   */
  getCampaignStats: async () => {
    const { data } = await api.get('/email/campaigns');
    return data;
  },

  /**
   * Get link clicks for email campaign
   */
  getLinkClicks: async (id: string) => {
    const { data } = await api.get(`/email/campaigns/${id}/clicks`);
    return data;
  },
};
