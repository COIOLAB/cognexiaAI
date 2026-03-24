import api from '@/lib/api';
import type {
  Campaign,
  CreateCampaignDto,
  UpdateCampaignDto,
  CampaignFilters,
  CampaignStats,
  CampaignPerformance,
} from '@/types/api.types';

export const campaignApi = {
  /**
   * Get all campaigns with optional filters
   */
  getCampaigns: async (filters?: CampaignFilters) => {
    const { data } = await api.get('/crm/marketing/campaigns', { params: filters });
    return data;
  },

  /**
   * Get campaign by ID
   */
  getCampaignById: async (id: string) => {
    const { data } = await api.get(`/crm/marketing/campaigns/${id}`);
    return data;
  },

  /**
   * Create new campaign
   */
  createCampaign: async (campaignData: CreateCampaignDto) => {
    const { data } = await api.post('/crm/marketing/campaigns', campaignData);
    return data;
  },

  /**
   * Update campaign
   */
  updateCampaign: async (id: string, campaignData: UpdateCampaignDto) => {
    const { data } = await api.put(`/crm/marketing/campaigns/${id}`, campaignData);
    return data;
  },

  /**
   * Delete campaign
   */
  deleteCampaign: async (id: string) => {
    const { data } = await api.delete(`/crm/marketing/campaigns/${id}`);
    return data;
  },

  /**
   * Activate campaign
   */
  activateCampaign: async (id: string) => {
    const { data } = await api.post(`/crm/marketing/campaigns/${id}/activate`);
    return data;
  },

  /**
   * Pause campaign
   */
  pauseCampaign: async (id: string) => {
    const { data } = await api.post(`/crm/marketing/campaigns/${id}/pause`);
    return data;
  },

  /**
   * Complete campaign
   */
  completeCampaign: async (id: string) => {
    const { data } = await api.post(`/crm/marketing/campaigns/${id}/complete`);
    return data;
  },

  /**
   * Get campaign statistics
   */
  getCampaignStats: async () => {
    const { data } = await api.get('/crm/marketing/campaigns/status');
    return data;
  },

  /**
   * Get campaign performance metrics
   */
  getCampaignPerformance: async (id: string) => {
    const { data } = await api.get(`/crm/marketing/campaigns/${id}/performance`);
    return data;
  },

  /**
   * Bulk delete campaigns
   */
  bulkDeleteCampaigns: async (ids: string[]) => {
    const { data } = await api.post('/crm/marketing/campaigns/bulk/delete', { ids });
    return data;
  },

  /**
   * Export campaigns to CSV/Excel
   */
  exportCampaigns: async (filters?: CampaignFilters, format: 'csv' | 'excel' = 'csv') => {
    const { data } = await api.get('/crm/marketing/campaigns/export', {
      params: { ...filters, format },
      responseType: 'blob',
    });
    return data;
  },

  /**
   * Get campaign analytics
   */
  getCampaignAnalytics: async (id: string, period?: string) => {
    const { data } = await api.get(`/crm/marketing/campaigns/${id}/analytics`, {
      params: { period },
    });
    return data;
  },

  /**
   * Duplicate campaign
   */
  duplicateCampaign: async (id: string) => {
    const { data } = await api.post(`/crm/marketing/campaigns/${id}/duplicate`);
    return data;
  },

  /**
   * Get campaign channels performance
   */
  getChannelPerformance: async (id: string) => {
    const { data } = await api.get(`/crm/marketing/campaigns/${id}/channels`);
    return data;
  },
};
