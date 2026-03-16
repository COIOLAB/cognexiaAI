import apiClient from '@/lib/api-client';
import type {
  ProductCategory,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '@/types/api.types';

const BASE_URL = '/categories';

export const categoryApi = {
  async getCategories(): Promise<ProductCategory[]> {
    const response = await apiClient.get(BASE_URL);
    return response.data;
  },

  async getCategoryById(id: string): Promise<ProductCategory> {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  async getCategoryTree(): Promise<ProductCategory[]> {
    const response = await apiClient.get(`${BASE_URL}/tree`);
    return response.data;
  },

  async createCategory(data: CreateCategoryDto): Promise<ProductCategory> {
    const response = await apiClient.post(BASE_URL, data);
    return response.data;
  },

  async updateCategory(id: string, data: UpdateCategoryDto): Promise<ProductCategory> {
    const response = await apiClient.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },
};
