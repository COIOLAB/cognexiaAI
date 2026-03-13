import apiClient from '@/lib/api-client';
import { useTenantStore } from '@/stores/tenant-store';

const unwrap = (payload: any) => payload?.data ?? payload;
const orgId = () => useTenantStore.getState().currentOrganization?.id;

export const quantumApi = {
  async generateProfile(customerId: string) {
    const response = await apiClient.post('/quantum/personality-profile', {
      customerId,
      organizationId: orgId(),
    });
    return unwrap(response.data);
  },
  async getEntanglement(customerId: string) {
    const response = await apiClient.get(`/quantum/entanglement/${customerId}`, {
      params: { organizationId: orgId() },
    });
    return unwrap(response.data);
  },
  async simulateConsciousness(customerId: string) {
    const response = await apiClient.post('/quantum/consciousness-simulation', {
      customerId,
      organizationId: orgId(),
    });
    return unwrap(response.data);
  },
  async predictBehavior(customerId: string) {
    const response = await apiClient.get(`/quantum/behavioral-predictions/${customerId}`, {
      params: { organizationId: orgId() },
    });
    return unwrap(response.data);
  },
  async emotionalResonance(customerId: string) {
    const response = await apiClient.get(`/quantum/emotional-resonance/${customerId}`, {
      params: { organizationId: orgId() },
    });
    return unwrap(response.data);
  },
};
