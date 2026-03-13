import apiClient from '@/lib/api-client';
import { useTenantStore } from '@/stores/tenant-store';

const unwrap = (payload: any) => payload?.data ?? payload;
const orgId = () => useTenantStore.getState().currentOrganization?.id;

export const arvrApi = {
  async listShowrooms() {
    const response = await apiClient.get('/arvr/showrooms', {
      params: { organizationId: orgId() },
    });
    return unwrap(response.data);
  },
  async createShowroom(payload: Record<string, any>) {
    const response = await apiClient.post('/arvr/showrooms', {
      ...payload,
      organizationId: orgId(),
    });
    return unwrap(response.data);
  },
  async getAnalytics() {
    const response = await apiClient.get('/arvr/analytics', {
      params: { organizationId: orgId() },
    });
    return unwrap(response.data);
  },
  async createDemo(productId: string) {
    const response = await apiClient.post('/arvr/product-demos', {
      productId,
      organizationId: orgId(),
    });
    return unwrap(response.data);
  },
  async scheduleMeeting(payload: Record<string, any>) {
    const response = await apiClient.post('/arvr/meetings', {
      ...payload,
      organizationId: orgId(),
    });
    return unwrap(response.data);
  },
};
