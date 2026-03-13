import api from '@/lib/api';
import type {
  EmailTemplate,
  CreateEmailTemplateDto,
  UpdateEmailTemplateDto,
  TemplateFilters,
  TemplateStats,
} from '@/types/api.types';

export const emailTemplateApi = {
  /**
   * Get all email templates with optional filters
   */
  getTemplates: async (filters?: TemplateFilters) => {
    const { data } = await api.get('/crm/marketing/templates', { params: filters });
    return data;
  },

  /**
   * Get email template by ID
   */
  getTemplateById: async (id: string) => {
    const { data } = await api.get(`/crm/marketing/templates/${id}`);
    return data;
  },

  /**
   * Create new email template
   */
  createTemplate: async (templateData: CreateEmailTemplateDto) => {
    const { data } = await api.post('/crm/marketing/templates', templateData);
    return data;
  },

  /**
   * Update email template
   */
  updateTemplate: async (id: string, templateData: UpdateEmailTemplateDto) => {
    const { data } = await api.put(`/crm/marketing/templates/${id}`, templateData);
    return data;
  },

  /**
   * Delete email template
   */
  deleteTemplate: async (id: string) => {
    const { data } = await api.delete(`/crm/marketing/templates/${id}`);
    return data;
  },

  /**
   * Duplicate email template
   */
  duplicateTemplate: async (id: string) => {
    const { data } = await api.post(`/crm/marketing/templates/${id}/duplicate`);
    return data;
  },

  /**
   * Get template statistics
   */
  getTemplateStats: async () => {
    const { data } = await api.get('/crm/marketing/templates/stats');
    return data;
  },

  /**
   * Get templates by category
   */
  getTemplatesByCategory: async (category: string) => {
    const { data } = await api.get('/crm/marketing/templates', { params: { category } });
    return data;
  },

  /**
   * Bulk delete templates
   */
  bulkDeleteTemplates: async (ids: string[]) => {
    const { data } = await api.post('/crm/marketing/templates/bulk/delete', { ids });
    return data;
  },

  /**
   * Export templates
   */
  exportTemplates: async (filters?: TemplateFilters, format: 'csv' | 'json' = 'json') => {
    const { data } = await api.get('/crm/marketing/templates/export', {
      params: { ...filters, format },
      responseType: 'blob',
    });
    return data;
  },

  /**
   * Get template usage history
   */
  getTemplateUsage: async (id: string) => {
    const { data } = await api.get(`/crm/marketing/templates/${id}/usage`);
    return data;
  },

  /**
   * Test send template
   */
  testTemplate: async (id: string, email: string) => {
    const { data } = await api.post(`/crm/marketing/templates/${id}/test`, { email });
    return data;
  },
};
