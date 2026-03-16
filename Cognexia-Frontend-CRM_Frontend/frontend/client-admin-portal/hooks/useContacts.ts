import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contactApi } from '@/services/contact.api';
import type {
  Contact,
  CreateContactDto,
  UpdateContactDto,
  ContactFilters,
} from '@/types/api.types';
import { toast } from 'sonner';

const QUERY_KEYS = {
  contacts: ['contacts'] as const,
  contact: (id: string) => ['contacts', id] as const,
  customerContacts: (customerId: string) => ['contacts', 'customer', customerId] as const,
  relationshipMap: (id: string) => ['contacts', id, 'relationships'] as const,
  orgChart: (customerId: string) => ['contacts', 'org-chart', customerId] as const,
};

/**
 * Hook to fetch paginated contacts with filters
 */
export function useContacts(filters?: ContactFilters) {
  return useQuery({
    queryKey: [...QUERY_KEYS.contacts, filters],
    queryFn: () => contactApi.getAll(filters),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to fetch a single contact by ID
 */
export function useContact(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.contact(id),
    queryFn: () => contactApi.getById(id),
    enabled: !!id,
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to fetch contacts by customer ID
 */
export function useCustomerContacts(customerId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.customerContacts(customerId),
    queryFn: () => contactApi.getByCustomerId(customerId),
    enabled: !!customerId,
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to fetch contact relationship map
 */
export function useContactRelationshipMap(contactId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.relationshipMap(contactId),
    queryFn: () => contactApi.getRelationshipMap(contactId),
    enabled: !!contactId,
    staleTime: 120000, // 2 minutes
  });
}

/**
 * Hook to fetch organization chart for a customer
 */
export function useOrgChart(customerId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.orgChart(customerId),
    queryFn: () => contactApi.getOrgChart(customerId),
    enabled: !!customerId,
    staleTime: 120000, // 2 minutes
  });
}

/**
 * Hook to create a new contact
 */
export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContactDto) => contactApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contacts });
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.customerContacts(variables.customerId) 
      });
      toast.success('Contact created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create contact');
    },
  });
}

/**
 * Hook to update an existing contact
 */
export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateContactDto }) =>
      contactApi.update(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contacts });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contact(variables.id) });
      if (response.data.customerId) {
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.customerContacts(response.data.customerId) 
        });
      }
      toast.success('Contact updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update contact');
    },
  });
}

/**
 * Hook to delete a contact
 */
export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contactApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contacts });
      toast.success('Contact deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete contact');
    },
  });
}

/**
 * Hook to bulk delete contacts
 */
export function useBulkDeleteContacts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => contactApi.bulkDelete(ids),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contacts });
      toast.success(`${data.data.deleted} contacts deleted successfully`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete contacts');
    },
  });
}

/**
 * Hook to search contacts (autocomplete)
 */
export function useContactSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: [...QUERY_KEYS.contacts, 'search', query],
    queryFn: () => contactApi.search(query),
    enabled: enabled && query.length >= 2,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to import contacts from CSV/Excel
 */
export function useImportContacts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, mapping }: { file: File; mapping: Record<string, string> }) =>
      contactApi.import(file, mapping),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contacts });
      const { imported, failed } = data.data;
      if (failed > 0) {
        toast.warning(`Imported ${imported} contacts, ${failed} failed`);
      } else {
        toast.success(`${imported} contacts imported successfully`);
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to import contacts');
    },
  });
}

/**
 * Hook to export contacts
 */
export function useExportContacts() {
  return useMutation({
    mutationFn: ({ filters, format }: { filters?: ContactFilters; format?: 'csv' | 'excel' }) =>
      contactApi.export(filters, format),
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
      a.download = `contacts-export-${new Date().toISOString().split('T')[0]}.${variables.format || 'csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Contacts exported successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to export contacts');
    },
  });
}
