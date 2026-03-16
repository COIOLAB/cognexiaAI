import apiClient from '@/lib/api-client';
import { useTenantStore } from '@/stores/tenant-store';

const unwrap = (payload: any) => payload?.data ?? payload;
const orgId = () => useTenantStore.getState().currentOrganization?.id;

export const realTimeApi = {
  async getLiveMetrics() {
    const response = await apiClient.get('/real-time/metrics/live', {
      params: { organizationId: orgId() },
    });
    return unwrap(response.data);
  },
  async getAlerts() {
    const response = await apiClient.get('/real-time/alerts', {
      params: { organizationId: orgId() },
    });
    return unwrap(response.data);
  },
  async createAlert(payload: Record<string, any>) {
    const response = await apiClient.post('/real-time/alerts', {
      ...payload,
      organizationId: orgId(),
    });
    return unwrap(response.data);
  },
  async getLiveActivity() {
    const response = await apiClient.get('/real-time/customer-activity/live', {
      params: { organizationId: orgId() },
    });
    return unwrap(response.data);
  },
};
