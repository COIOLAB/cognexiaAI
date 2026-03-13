import apiClient from '@/lib/api-client';
import { useTenantStore } from '@/stores/tenant-store';

const unwrap = (payload: any) => payload?.data ?? payload;
const orgId = () => useTenantStore.getState().currentOrganization?.id;

export const holographicApi = {
  async createProjection(payload: Record<string, any>) {
    const response = await apiClient.post('/holographic/projections', {
      ...payload,
      organizationId: orgId(),
    });
    return unwrap(response.data);
  },
  async createSession(payload: Record<string, any>) {
    const response = await apiClient.post('/holographic/sessions', {
      ...payload,
      organizationId: orgId(),
    });
    return unwrap(response.data);
  },
  async getSession(sessionId: string) {
    const response = await apiClient.get(`/holographic/sessions/${sessionId}`, {
      params: { organizationId: orgId() },
    });
    return unwrap(response.data);
  },
  async getSessionAnalytics(sessionId: string) {
    const response = await apiClient.get(`/holographic/sessions/${sessionId}/analytics`, {
      params: { organizationId: orgId() },
    });
    return unwrap(response.data);
  },
};
