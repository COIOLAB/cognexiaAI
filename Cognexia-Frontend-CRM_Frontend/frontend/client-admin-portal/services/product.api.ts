import apiClient from '@/lib/api-client';
import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
} from '@/types/api.types';

const BASE_URL = '/products';

export const productApi = {
  async getProducts(params?: ProductQueryDto): Promise<Product[]> {
    const response = await apiClient.get(BASE_URL, { params });
    return response.data;
  },

  async getProductById(id: string): Promise<Product> {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  async searchProducts(params: ProductQueryDto): Promise<Product[]> {
    const response = await apiClient.get(`${BASE_URL}/search`, { params });
    return response.data;
  },

  async getFeaturedProducts(limit?: number): Promise<Product[]> {
    const response = await apiClient.get(`${BASE_URL}/featured`, {
      params: { limit },
    });
    return response.data;
  },

  async getOnSaleProducts(limit?: number): Promise<Product[]> {
    const response = await apiClient.get(`${BASE_URL}/on-sale`, {
      params: { limit },
    });
    return response.data;
  },

  async getBestSellers(limit?: number): Promise<Product[]> {
    const response = await apiClient.get(`${BASE_URL}/best-sellers`, {
      params: { limit },
    });
    return response.data;
  },

  async getRecommendations(productId: string, limit?: number): Promise<Product[]> {
    const response = await apiClient.get(`${BASE_URL}/${productId}/recommendations`, {
      params: { limit },
    });
    return response.data;
  },

  async createProduct(data: CreateProductDto): Promise<Product> {
    const response = await apiClient.post(BASE_URL, data);
    return response.data;
  },

  async updateProduct(id: string, data: UpdateProductDto): Promise<Product> {
    const response = await apiClient.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },
};
