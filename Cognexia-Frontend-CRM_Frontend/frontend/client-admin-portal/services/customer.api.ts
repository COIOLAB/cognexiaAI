import apiClient from '@/lib/api-client';
import type {
  Customer,
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerFilters,
  ApiResponse,
  PaginationMeta,
} from '@/types/api.types';

export const customerApi = {
  /**
   * Get all customers with filtering and pagination
   */
  getAll: async (filters?: CustomerFilters) => {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.segment) params.append('segment', filters.segment);
    if (filters?.region) params.append('region', filters.region);
    if (filters?.industry) params.append('industry', filters.industry);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.customerType) params.append('customerType', filters.customerType);
    if (filters?.tier) params.append('tier', filters.tier);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    const { data } = await apiClient.get<ApiResponse<{
      customers: Customer[];
      pagination: PaginationMeta;
      summary?: {
        totalCustomers: number;
        b2bCustomers: number;
        b2cCustomers: number;
        activeCustomers: number;
        inactiveCustomers: number;
        prospectCustomers: number;
        churnedCustomers: number;
      };
    }>>(`/crm/customers?${params.toString()}`);
    
    return data;
  },

  /**
   * Get a single customer by ID
   */
  getById: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<Customer>>(`/crm/customers/${id}`);
    return data;
  },

  /**
   * Create a new customer
   */
  create: async (customerData: CreateCustomerDto) => {
    const { data } = await apiClient.post<ApiResponse<Customer>>('/crm/customers', customerData);
    return data;
  },

  /**
   * Update an existing customer
   */
  update: async (id: string, customerData: UpdateCustomerDto) => {
    const { data } = await apiClient.put<ApiResponse<Customer>>(`/crm/customers/${id}`, customerData);
    return data;
  },

  /**
   * Delete a customer
   */
  delete: async (id: string) => {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/crm/customers/${id}`);
    return data;
  },

  /**
   * Bulk delete customers
   */
  bulkDelete: async (ids: string[]) => {
    const { data } = await apiClient.post<ApiResponse<{ deleted: number }>>('/crm/customers/bulk-delete', { ids });
    return data;
  },

  /**
   * Export customers to CSV/Excel
   */
  export: async (filters?: CustomerFilters, format: 'csv' | 'excel' = 'csv') => {
    const params = new URLSearchParams();
    
    if (filters?.segment) params.append('segment', filters.segment);
    if (filters?.region) params.append('region', filters.region);
    if (filters?.industry) params.append('industry', filters.industry);
    if (filters?.status) params.append('status', filters.status);
    params.append('format', format);

    const { data } = await apiClient.get<Blob>(`/crm/customers/export?${params.toString()}`, {
      responseType: 'blob',
    });
    
    return data;
  },

  /**
   * Get customer statistics
   */
  getStats: async () => {
    const { data } = await apiClient.get<ApiResponse<{
      totalCustomers: number;
      activeCustomers: number;
      newThisMonth: number;
      churnRate: number;
      averageRevenue: number;
      tierDistribution: Record<string, number>;
      regionalDistribution: Record<string, number>;
    }>>('/crm/customers/stats');
    
    return data;
  },

  /**
   * Get customer segmentation data
   */
  getSegmentation: async () => {
    const { data } = await apiClient.get<ApiResponse<{
      segments: Array<{
        name: string;
        count: number;
        revenue: number;
        growthRate: number;
      }>;
      tiers: Record<string, number>;
      riskLevels: Record<string, number>;
      growthPotentials: Record<string, number>;
    }>>('/crm/customers/segmentation');
    
    return data;
  },

  /**
   * Search customers (autocomplete)
   */
  search: async (query: string, limit = 10) => {
    const { data } = await apiClient.get<ApiResponse<Customer[]>>(
      `/crm/customers/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    return data;
  },
};
