import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '@/services/inventory.api';
import type {
  InventoryItem,
  InventoryTransaction,
  StockAlert,
  AdjustStockDto,
  Product,
} from '@/types/api.types';

const QUERY_KEY = 'inventory';

export const useGetLowStockProducts = () => {
  return useQuery<Product[]>({
    queryKey: [QUERY_KEY, 'low-stock'],
    queryFn: () => inventoryApi.getLowStockProducts(),
  });
};

export const useGetInventoryReport = () => {
  return useQuery<{
    totalProducts: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalInventoryValue: number;
    lowStockProducts: Product[];
  }>({
    queryKey: [QUERY_KEY, 'report'],
    queryFn: () => inventoryApi.getInventoryReport(),
  });
};

export const useGetInventoryByProduct = (productId: string) => {
  return useQuery<InventoryItem>({
    queryKey: [QUERY_KEY, 'product', productId],
    queryFn: () => inventoryApi.getInventoryByProduct(productId),
    enabled: !!productId,
  });
};

export const useGetStockTransactions = (productId?: string) => {
  return useQuery<InventoryTransaction[]>({
    queryKey: [QUERY_KEY, 'transactions', productId],
    queryFn: () => inventoryApi.getStockTransactions(productId),
  });
};

export const useAdjustStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AdjustStockDto) => inventoryApi.adjustStock(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useGetStockAlerts = () => {
  return useQuery<StockAlert[]>({
    queryKey: [QUERY_KEY, 'alerts'],
    queryFn: () => inventoryApi.getStockAlerts(),
  });
};
