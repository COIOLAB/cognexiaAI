import apiClient from '@/lib/api-client';
import { useTenantStore } from '@/stores/tenant-store';

const unwrap = (payload: any) => payload?.data ?? payload;

const withOrganization = (payload: Record<string, any> = {}) => {
  const organizationId = useTenantStore.getState().currentOrganization?.id;
  return organizationId ? { ...payload, organizationId } : payload;
};

export const llmApi = {
  async getModels() {
    const organizationId = useTenantStore.getState().currentOrganization?.id;
    const response = await apiClient.get('/llm/models', {
      params: organizationId ? { organizationId } : undefined,
    });
    return unwrap(response.data);
  },
  async generateContent(payload: { prompt: string; contentType?: string }) {
    const response = await apiClient.post('/llm/content-generation', withOrganization(payload));
    return unwrap(response.data);
  },
  async startChat(payload: { title?: string; context?: string }) {
    const response = await apiClient.post('/llm/chat', withOrganization(payload));
    return unwrap(response.data);
  },
  async sendMessage(conversationId: string, payload: { message: string; role?: string }) {
    const response = await apiClient.post(
      `/llm/chat/${conversationId}/messages`,
      withOrganization(payload),
    );
    return unwrap(response.data);
  },
};
