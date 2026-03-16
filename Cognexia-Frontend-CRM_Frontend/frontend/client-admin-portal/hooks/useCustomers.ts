import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '@/services/customer.api';
import type {
  Customer,
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerFilters,
} from '@/types/api.types';
import { toast } from 'sonner';

const QUERY_KEYS = {
  customers: ['customers'] as const,
  customer: (id: string) => ['customers', id] as const,
  customerStats: ['customers', 'stats'] as const,
  customerSegmentation: ['customers', 'segmentation'] as const,
};

/**
 * Hook to fetch paginated customers with filters
 */
export function useCustomers(filters?: CustomerFilters) {
  return useQuery({
    queryKey: [...QUERY_KEYS.customers, filters],
    queryFn: () => customerApi.getAll(filters),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to fetch a single customer by ID
 */
export function useCustomer(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.customer(id),
    queryFn: () => customerApi.getById(id),
    enabled: !!id,
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to fetch customer statistics
 */
export function useCustomerStats() {
  return useQuery({
    queryKey: QUERY_KEYS.customerStats,
    queryFn: () => customerApi.getStats(),
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to fetch customer segmentation data
 */
export function useCustomerSegmentation() {
  return useQuery({
    queryKey: QUERY_KEYS.customerSegmentation,
    queryFn: () => customerApi.getSegmentation(),
    staleTime: 120000, // 2 minutes
  });
}

/**
 * Hook to create a new customer
 */
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerDto) => customerApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customerStats });
      toast.success('Customer created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create customer');
    },
  });
}

/**
 * Hook to update an existing customer
 */
export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerDto }) =>
      customerApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customer(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customerStats });
      toast.success('Customer updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update customer');
    },
  });
}

/**
 * Hook to delete a customer
 */
export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customerApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customerStats });
      toast.success('Customer deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete customer');
    },
  });
}

/**
 * Hook to bulk delete customers
 */
export function useBulkDeleteCustomers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => customerApi.bulkDelete(ids),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customers });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.customerStats });
      toast.success(`${data.data.deleted} customers deleted successfully`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete customers');
    },
  });
}

/**
 * Hook to search customers (autocomplete)
 */
export function useCustomerSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: [...QUERY_KEYS.customers, 'search', query],
    queryFn: () => customerApi.search(query),
    enabled: enabled && query.length >= 2,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to export customers
 */
export function useExportCustomers() {
  return useMutation({
    mutationFn: ({ filters, format }: { filters?: CustomerFilters; format?: 'csv' | 'excel' }) =>
      customerApi.export(filters, format),
    onSuccess: (data, variables) => {
      // Create blob URL and trigger download
      const blob = new Blob([data], {
        type: variables.format === 'excel'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'text/csv',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customers-export-${new Date().toISOString().split('T')[0]}.${variables.format || 'csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Customers exported successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to export customers');
    },
  });
}
