import api from '@/lib/api';
import type {
  MarketingSegment,
  CreateSegmentDto,
  UpdateSegmentDto,
  SegmentFilters,
  SegmentStats,
} from '@/types/api.types';

export const marketingSegmentApi = {
  /**
   * Get all segments with optional filters
   */
  getSegments: async (filters?: SegmentFilters) => {
    const { data } = await api.get('/crm/marketing/segments', { params: filters });
    return data;
  },

  /**
   * Get segment by ID
   */
  getSegmentById: async (id: string) => {
    const { data } = await api.get(`/crm/marketing/segments/${id}`);
    return data;
  },

  /**
   * Create new segment
   */
  createSegment: async (segmentData: CreateSegmentDto) => {
    const { data } = await api.post('/crm/marketing/segments', segmentData);
    return data;
  },

  /**
   * Update segment
   */
  updateSegment: async (id: string, segmentData: UpdateSegmentDto) => {
    const { data } = await api.put(`/crm/marketing/segments/${id}`, segmentData);
    return data;
  },

  /**
   * Delete segment
   */
  deleteSegment: async (id: string) => {
    const { data } = await api.delete(`/crm/marketing/segments/${id}`);
    return data;
  },

  /**
   * Get segment size
   */
  getSegmentSize: async (id: string) => {
    const { data } = await api.get(`/crm/marketing/segments/${id}/size`);
    return data;
  },

  /**
   * Get segment contacts
   */
  getSegmentContacts: async (id: string, page = 1, limit = 100) => {
    const { data } = await api.get(`/crm/marketing/segments/${id}/contacts`, {
      params: { page, limit },
    });
    return data;
  },

  /**
   * Refresh segment (recalculate members)
   */
  refreshSegment: async (id: string) => {
    const { data } = await api.post(`/crm/marketing/segments/${id}/recalculate`);
    return data;
  },

  /**
   * Export segment contacts
   */
  exportSegment: async (id: string, format: 'csv' | 'excel' = 'csv') => {
    const { data } = await api.get(`/crm/marketing/segments/${id}/export`, {
      params: { format },
      responseType: 'blob',
    });
    return data;
  },

  /**
   * Get segment statistics
   */
  getSegmentStats: async () => {
    const { data } = await api.get('/crm/marketing/segments/stats');
    return data;
  },

  /**
   * Get campaigns using this segment
   */
  getSegmentCampaigns: async (id: string) => {
    const { data } = await api.get(`/crm/marketing/segments/${id}/campaigns`);
    return data;
  },

  /**
   * Bulk delete segments
   */
  bulkDeleteSegments: async (ids: string[]) => {
    const { data } = await api.post('/crm/marketing/segments/bulk/delete', { ids });
    return data;
  },
};
