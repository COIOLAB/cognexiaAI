import apiClient from '@/lib/api-client';
import type {
  ApiResponse,
  PaginatedApiResponse,
  SalesOrder,
  CreateOrderDto,
  UpdateOrderDto,
  OrderFilters,
  OrderStats,
} from '@/types/api.types';

const BASE_URL = '/sales/orders';

/**
 * Get all orders with pagination and filters
 */
export const getOrders = async (
  filters: OrderFilters = {}
): Promise<PaginatedApiResponse<SalesOrder>> => {
  const params = new URLSearchParams();

  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.status) params.append('status', filters.status);
  if (filters.customerId) params.append('customerId', filters.customerId);
  if (filters.salesRepId) params.append('salesRepId', filters.salesRepId);
  if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.append('dateTo', filters.dateTo);
  if (filters.search) params.append('search', filters.search);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

  const { data } = await apiClient.get<PaginatedApiResponse<SalesOrder>>(
    `${BASE_URL}?${params.toString()}`
  );
  return data;
};

/**
 * Get order by ID
 */
export const getOrderById = async (id: string): Promise<ApiResponse<SalesOrder>> => {
  const { data } = await apiClient.get<ApiResponse<SalesOrder>>(`${BASE_URL}/${id}`);
  return data;
};

/**
 * Create new order
 */
export const createOrder = async (orderData: CreateOrderDto): Promise<ApiResponse<SalesOrder>> => {
  const { data } = await apiClient.post<ApiResponse<SalesOrder>>(BASE_URL, orderData);
  return data;
};

/**
 * Update order
 */
export const updateOrder = async (
  id: string,
  orderData: UpdateOrderDto
): Promise<ApiResponse<SalesOrder>> => {
  const { data } = await apiClient.put<ApiResponse<SalesOrder>>(`${BASE_URL}/${id}`, orderData);
  return data;
};

/**
 * Cancel order
 */
export const cancelOrder = async (id: string, reason?: string): Promise<ApiResponse<SalesOrder>> => {
  const { data } = await apiClient.post<ApiResponse<SalesOrder>>(`${BASE_URL}/${id}/cancel`, {
    reason,
  });
  return data;
};

/**
 * Confirm order
 */
export const confirmOrder = async (id: string): Promise<ApiResponse<SalesOrder>> => {
  const { data } = await apiClient.post<ApiResponse<SalesOrder>>(`${BASE_URL}/${id}/confirm`);
  return data;
};

/**
 * Ship order
 */
export const shipOrder = async (
  id: string,
  trackingNumber: string
): Promise<ApiResponse<SalesOrder>> => {
  const { data } = await apiClient.post<ApiResponse<SalesOrder>>(`${BASE_URL}/${id}/ship`, {
    trackingNumber,
  });
  return data;
};

/**
 * Mark order as delivered
 */
export const deliverOrder = async (id: string): Promise<ApiResponse<SalesOrder>> => {
  const { data } = await apiClient.post<ApiResponse<SalesOrder>>(`${BASE_URL}/${id}/deliver`);
  return data;
};

/**
 * Get order statistics
 */
export const getOrderStats = async (): Promise<ApiResponse<OrderStats>> => {
  const { data } = await apiClient.get<ApiResponse<OrderStats>>(`${BASE_URL}/stats`);
  return data;
};

/**
 * Bulk cancel orders
 */
export const bulkCancelOrders = async (ids: string[]): Promise<ApiResponse<void>> => {
  const { data } = await apiClient.post<ApiResponse<void>>(`${BASE_URL}/bulk-cancel`, { ids });
  return data;
};

/**
 * Export orders to CSV
 */
export const exportOrders = async (filters: OrderFilters = {}): Promise<Blob> => {
  const params = new URLSearchParams();

  if (filters.status) params.append('status', filters.status);
  if (filters.customerId) params.append('customerId', filters.customerId);
  if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.append('dateTo', filters.dateTo);

  const { data } = await apiClient.get(`${BASE_URL}/export?${params.toString()}`, {
    responseType: 'blob',
  });
  return data;
};

export default {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  cancelOrder,
  confirmOrder,
  shipOrder,
  deliverOrder,
  getOrderStats,
  bulkCancelOrders,
  exportOrders,
};
