import apiClient from '@/lib/api-client';
import type {
  Contact,
  CreateContactDto,
  UpdateContactDto,
  ContactFilters,
  ApiResponse,
  PaginationMeta,
} from '@/types/api.types';

export const contactApi = {
  /**
   * Get all contacts with filtering and pagination
   */
  getAll: async (filters?: ContactFilters) => {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.role) params.append('role', filters.role);
    if (filters?.customerId) params.append('customerId', filters.customerId);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    const { data } = await apiClient.get<ApiResponse<{
      contacts: Contact[];
      pagination: PaginationMeta;
    }>>(`/crm/contacts?${params.toString()}`);
    
    return data;
  },

  /**
   * Get a single contact by ID
   */
  getById: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<Contact>>(`/crm/contacts/${id}`);
    return data;
  },

  /**
   * Get contacts by customer ID
   */
  getByCustomerId: async (customerId: string) => {
    const { data} = await apiClient.get<ApiResponse<Contact[]>>(`/crm/customers/${customerId}/contacts`);
    return data;
  },

  /**
   * Create a new contact
   */
  create: async (contactData: CreateContactDto) => {
    const { data } = await apiClient.post<ApiResponse<Contact>>('/crm/contacts', contactData);
    return data;
  },

  /**
   * Update an existing contact
   */
  update: async (id: string, contactData: UpdateContactDto) => {
    const { data } = await apiClient.put<ApiResponse<Contact>>(`/crm/contacts/${id}`, contactData);
    return data;
  },

  /**
   * Delete a contact
   */
  delete: async (id: string) => {
    const { data } = await apiClient.delete<ApiResponse<void>>(`/crm/contacts/${id}`);
    return data;
  },

  /**
   * Bulk delete contacts
   */
  bulkDelete: async (ids: string[]) => {
    const { data } = await apiClient.post<ApiResponse<{ deleted: number }>>('/crm/contacts/bulk-delete', { ids });
    return data;
  },

  /**
   * Import contacts from CSV/Excel
   */
  import: async (file: File, fieldMapping: Record<string, string>) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mapping', JSON.stringify(fieldMapping));

    const { data } = await apiClient.post<ApiResponse<{
      imported: number;
      failed: number;
      errors: Array<{ row: number; error: string }>;
    }>>('/crm/contacts/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return data;
  },

  /**
   * Export contacts to CSV/Excel
   */
  export: async (filters?: ContactFilters, format: 'csv' | 'excel' = 'csv') => {
    const params = new URLSearchParams();
    
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.role) params.append('role', filters.role);
    if (filters?.customerId) params.append('customerId', filters.customerId);
    params.append('format', format);

    const { data } = await apiClient.get<Blob>(`/crm/contacts/export?${params.toString()}`, {
      responseType: 'blob',
    });
    
    return data;
  },

  /**
   * Search contacts (autocomplete)
   */
  search: async (query: string, limit = 10) => {
    const { data } = await apiClient.get<ApiResponse<Contact[]>>(
      `/crm/contacts/search?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    return data;
  },

  /**
   * Get contact relationship map
   */
  getRelationshipMap: async (contactId: string) => {
    const { data } = await apiClient.get<ApiResponse<{
      contact: Contact;
      relationships: Array<{
        id: string;
        type: string;
        strength: number;
        contacts: Contact[];
      }>;
    }>>(`/crm/contacts/${contactId}/relationships`);
    
    return data;
  },

  /**
   * Get organization chart for a customer
   */
  getOrgChart: async (customerId: string) => {
    const { data } = await apiClient.get<ApiResponse<{
      nodes: Array<{
        id: string;
        contact: Contact;
        parentId?: string;
        children: string[];
      }>;
    }>>(`/crm/customers/${customerId}/org-chart`);
    
    return data;
  },
};
