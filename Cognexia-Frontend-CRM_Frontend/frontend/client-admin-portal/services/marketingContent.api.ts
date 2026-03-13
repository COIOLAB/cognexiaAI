import apiClient from '@/lib/api-client';

export interface GeneratedContentItem {
  id: string;
  contentType: string;
  prompt: string;
  generatedText: string;
  model?: string;
  usageCount?: number;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

const CONTENT_URL = '/crm/marketing/content';

export const marketingContentApi = {
  async getContent(type?: string): Promise<GeneratedContentItem[]> {
    const response = await apiClient.get(CONTENT_URL, {
      params: type ? { type } : undefined,
    });
    return response.data?.data || response.data;
  },

  async createContent(payload: {
    contentType: string;
    prompt: string;
    generatedText: string;
    model?: string;
    metadata?: Record<string, any>;
  }): Promise<GeneratedContentItem> {
    const response = await apiClient.post(CONTENT_URL, payload);
    return response.data?.data || response.data;
  },
};
