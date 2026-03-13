import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  qualifyLead,
  convertLead,
  getLeadScore,
  bulkDeleteLeads,
  exportLeads,
  importLeads,
  getLeadStats,
} from '@/services/lead.api';
import {
  Lead,
  CreateLeadDto,
  UpdateLeadDto,
  LeadFilters,
  QualifyLeadDto,
  ConvertLeadDto,
} from '@/types/api.types';

/**
 * Lead Hooks
 * React Query hooks for lead management
 */

// Query keys
export const leadKeys = {
  all: ['leads'] as const,
  lists: () => [...leadKeys.all, 'list'] as const,
  list: (filters?: LeadFilters) => [...leadKeys.lists(), filters] as const,
  details: () => [...leadKeys.all, 'detail'] as const,
  detail: (id: string) => [...leadKeys.details(), id] as const,
  stats: () => [...leadKeys.all, 'stats'] as const,
  score: (id: string) => [...leadKeys.all, 'score', id] as const,
};

// Get paginated leads with filters
export const useLeads = (filters?: LeadFilters) => {
  return useQuery({
    queryKey: leadKeys.list(filters),
    queryFn: () => getLeads(filters),
    staleTime: 30000,
  });
};

// Get single lead by ID
export const useLead = (id: string) => {
  return useQuery({
    queryKey: leadKeys.detail(id),
    queryFn: () => getLeadById(id),
    enabled: !!id,
  });
};

// Get lead statistics
export const useLeadStats = () => {
  return useQuery({
    queryKey: leadKeys.stats(),
    queryFn: getLeadStats,
    staleTime: 60000,
  });
};

// Get lead scoring breakdown
export const useLeadScore = (id: string) => {
  return useQuery({
    queryKey: leadKeys.score(id),
    queryFn: () => getLeadScore(id),
    enabled: !!id,
  });
};

// Create new lead
export const useCreateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeadDto) => createLead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.stats() });
      toast.success('Lead created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create lead');
    },
  });
};

// Update existing lead
export const useUpdateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadDto }) =>
      updateLead(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: leadKeys.stats() });
      toast.success('Lead updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update lead');
    },
  });
};

// Delete lead
export const useDeleteLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.stats() });
      toast.success('Lead deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete lead');
    },
  });
};

// Qualify lead
export const useQualifyLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: QualifyLeadDto }) =>
      qualifyLead(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: leadKeys.stats() });
      toast.success('Lead qualified successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to qualify lead');
    },
  });
};

// Convert lead to customer/opportunity
export const useConvertLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ConvertLeadDto }) =>
      convertLead(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: leadKeys.stats() });
      // Also invalidate customer and opportunity queries if they exist
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('Lead converted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to convert lead');
    },
  });
};

// Bulk delete leads
export const useBulkDeleteLeads = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteLeads(ids),
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.stats() });
      toast.success(`${ids.length} leads deleted successfully`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete leads');
    },
  });
};

// Export leads to CSV
export const useExportLeads = () => {
  return useMutation({
    mutationFn: (filters?: LeadFilters) => exportLeads(filters),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Leads exported successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to export leads');
    },
  });
};

// Import leads from CSV
export const useImportLeads = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => importLeads(file),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadKeys.stats() });
      
      if (response.data) {
        const { imported, failed } = response.data;
        if (failed > 0) {
          toast.warning(`${imported} leads imported, ${failed} failed`);
        } else {
          toast.success(`${imported} leads imported successfully`);
        }
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to import leads');
    },
  });
};
