import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketApi } from '@/services/ticket.api';
import { toast } from 'sonner';
import type {
  SupportTicket,
  CreateTicketDto,
  UpdateTicketDto,
  AssignTicketDto,
  EscalateTicketDto,
  AddResponseDto,
  TicketFilters,
} from '@/types/api.types';

const QUERY_KEYS = {
  tickets: ['tickets'] as const,
  ticket: (id: string) => ['tickets', id] as const,
  statistics: ['tickets', 'statistics'] as const,
};

// Get tickets with filters
export const useGetTickets = (filters?: TicketFilters) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.tickets, filters],
    queryFn: () => ticketApi.getTickets(filters),
  });
};

// Get ticket by ID
export const useGetTicket = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.ticket(id),
    queryFn: () => ticketApi.getTicketById(id),
    enabled: !!id,
  });
};

// Create ticket
export const useCreateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTicketDto) => ticketApi.createTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tickets });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.statistics });
      toast.success('Ticket created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create ticket');
    },
  });
};

// Update ticket
export const useUpdateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTicketDto }) =>
      ticketApi.updateTicket(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticket(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tickets });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.statistics });
      toast.success('Ticket updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update ticket');
    },
  });
};

// Delete ticket
export const useDeleteTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ticketApi.deleteTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tickets });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.statistics });
      toast.success('Ticket deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete ticket');
    },
  });
};

// Assign ticket
export const useAssignTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignTicketDto }) =>
      ticketApi.assignTicket(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticket(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tickets });
      toast.success('Ticket assigned successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to assign ticket');
    },
  });
};

// Auto-assign ticket
export const useAutoAssignTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ticketApi.autoAssignTicket(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticket(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tickets });
      toast.success('Ticket auto-assigned successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to auto-assign ticket');
    },
  });
};

// Escalate ticket
export const useEscalateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EscalateTicketDto }) =>
      ticketApi.escalateTicket(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticket(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tickets });
      toast.success('Ticket escalated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to escalate ticket');
    },
  });
};

// Add response to ticket
export const useAddResponse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddResponseDto }) =>
      ticketApi.addResponse(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticket(variables.id) });
      toast.success('Response added successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to add response');
    },
  });
};

// Close ticket
export const useCloseTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, rating }: { id: string; rating?: number }) =>
      ticketApi.closeTicket(id, rating),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticket(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tickets });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.statistics });
      toast.success('Ticket closed successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to close ticket');
    },
  });
};

// Reopen ticket
export const useReopenTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      ticketApi.reopenTicket(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ticket(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tickets });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.statistics });
      toast.success('Ticket reopened successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to reopen ticket');
    },
  });
};

// Get ticket statistics
export const useGetTicketStatistics = (filters?: Partial<TicketFilters>) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.statistics, filters],
    queryFn: () => ticketApi.getStatistics(filters),
  });
};
