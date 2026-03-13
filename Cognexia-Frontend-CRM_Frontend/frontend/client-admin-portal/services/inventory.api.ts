import apiClient from '@/lib/api-client';
import type {
  InventoryItem,
  InventoryTransaction,
  StockAlert,
  AdjustStockDto,
  Product,
} from '@/types/api.types';

const INVENTORY_URL = '/products/inventory';

export const inventoryApi = {
  async getLowStockProducts(): Promise<Product[]> {
    const response = await apiClient.get(`${INVENTORY_URL}/low-stock`);
    return response.data;
  },

  async getInventoryReport(): Promise<{
    totalProducts: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalInventoryValue: number;
    lowStockProducts: Product[];
  }> {
    const response = await apiClient.get(`${INVENTORY_URL}/report`);
    return response.data;
  },

  async getInventoryByProduct(productId: string): Promise<InventoryItem> {
    const response = await apiClient.get(`${INVENTORY_URL}/product/${productId}`);
    return response.data;
  },

  async getStockTransactions(productId?: string): Promise<InventoryTransaction[]> {
    const params = productId ? { productId } : {};
    const response = await apiClient.get(`${INVENTORY_URL}/transactions`, { params });
    return response.data;
  },

  async adjustStock(data: AdjustStockDto): Promise<void> {
    await apiClient.post(`${INVENTORY_URL}/adjust`, data);
  },

  async getStockAlerts(): Promise<StockAlert[]> {
    const response = await apiClient.get(`${INVENTORY_URL}/alerts`);
    return response.data;
  },
};
