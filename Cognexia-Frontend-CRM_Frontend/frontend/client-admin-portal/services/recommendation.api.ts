import apiClient from '@/lib/api-client';

export const recommendationApi = {
  getRecommendations: async (productId: string, limit?: number) => {
    const { data } = await apiClient.get(`/products/${productId}/recommendations`, {
      params: { limit },
    });
    return data;
  },

  getFrequentlyBoughtTogether: async (productId: string) => {
    const { data } = await apiClient.get(`/products/${productId}/frequently-bought-together`);
    return data;
  },

  getUpsell: async (productId: string) => {
    const { data } = await apiClient.get(`/products/${productId}/upsell`);
    return data;
  },
};
