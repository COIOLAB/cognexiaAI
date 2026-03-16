import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
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
} from '@/services/order.api';
import type {
  OrderFilters,
  CreateOrderDto,
  UpdateOrderDto,
} from '@/types/api.types';

const QUERY_KEYS = {
  ORDERS: 'orders',
  ORDER: 'order',
  ORDER_STATS: 'order-stats',
};

/**
 * Fetch orders with pagination and filters
 */
export const useOrders = (filters: OrderFilters = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.ORDERS, filters],
    queryFn: () => getOrders(filters),
  });
};

/**
 * Fetch single order by ID
 */
export const useOrder = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.ORDER, id],
    queryFn: () => getOrderById(id),
    enabled: !!id,
  });
};

/**
 * Fetch order statistics
 */
export const useOrderStats = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.ORDER_STATS],
    queryFn: getOrderStats,
  });
};

/**
 * Create new order mutation
 */
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderDto) => createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDER_STATS] });
    },
  });
};

/**
 * Update order mutation
 */
export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderDto }) =>
      updateOrder(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDER, variables.id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDER_STATS] });
    },
  });
};

/**
 * Cancel order mutation
 */
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      cancelOrder(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDER, variables.id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDER_STATS] });
    },
  });
};

/**
 * Confirm order mutation
 */
export const useConfirmOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => confirmOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDER, id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDER_STATS] });
    },
  });
};

/**
 * Ship order mutation
 */
export const useShipOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, trackingNumber }: { id: string; trackingNumber: string }) =>
      shipOrder(id, trackingNumber),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDER, variables.id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDER_STATS] });
    },
  });
};

/**
 * Deliver order mutation
 */
export const useDeliverOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deliverOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDER, id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDER_STATS] });
    },
  });
};

/**
 * Bulk cancel orders mutation
 */
export const useBulkCancelOrders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => bulkCancelOrders(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDER_STATS] });
    },
  });
};

/**
 * Export orders mutation
 */
export const useExportOrders = () => {
  return useMutation({
    mutationFn: (filters: OrderFilters) => exportOrders(filters),
  });
};
