import { api } from '@/lib/api';
import type {
  SupportTicket,
  CreateTicketDto,
  UpdateTicketDto,
  AssignTicketDto,
  EscalateTicketDto,
  AddResponseDto,
  TicketResponse,
  TicketFilters,
  TicketStatistics,
} from '@/types/api.types';

const TICKET_BASE = '/crm/support/tickets';

// Backend expects snake_case fields; map camelCase DTOs from the UI to API shape
const mapCreateDto = (dto: CreateTicketDto) => ({
  subject: dto.subject,
  description: dto.description,
  priority: dto.priority,
  category: dto.category,
  channel: dto.channel,
  customer_id: dto.customerId, // backend looks up customer by email in primaryContact
  tags: dto.tags,
  attachments: dto.attachments,
});

const mapUpdateDto = (dto: UpdateTicketDto) => ({
  ...dto,
  assigned_to: (dto as any).assignedTo ?? dto.assignedTo,
});

const mapAssignDto = (dto: AssignTicketDto) => ({
  agent_id: dto.agentId,
});

const mapEscalateDto = (dto: EscalateTicketDto) => ({
  reason: dto.reason,
  escalate_to: dto.escalateTo,
});

const mapResponseDto = (dto: AddResponseDto) => ({
  response: dto.message,
  user_id: (dto as any).userId, // optional; backend parameter name
  is_internal: dto.isInternal,
});

export const ticketApi = {
  // Get tickets with filters
  getTickets: async (filters?: TicketFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Align camelCase query params to backend expectations
          if (key === 'customerId') {
            params.append('customer_id', value.toString());
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    const { data } = await api.get<{ data: SupportTicket[]; total: number }>(
      `${TICKET_BASE}?${params.toString()}`
    );
    return data;
  },

  // Get ticket by ID
  getTicketById: async (id: string) => {
    const { data } = await api.get<SupportTicket>(`${TICKET_BASE}/${id}`);
    return data;
  },

  // Create ticket
  createTicket: async (ticketData: CreateTicketDto) => {
    const { data } = await api.post<SupportTicket>(TICKET_BASE, mapCreateDto(ticketData));
    return data;
  },

  // Update ticket
  updateTicket: async (id: string, ticketData: UpdateTicketDto) => {
    const { data } = await api.put<SupportTicket>(`${TICKET_BASE}/${id}`, mapUpdateDto(ticketData));
    return data;
  },

  // Delete ticket
  deleteTicket: async (id: string) => {
    const { data } = await api.delete(`${TICKET_BASE}/${id}`);
    return data;
  },

  // Assign ticket to agent
  assignTicket: async (id: string, assignData: AssignTicketDto) => {
    const { data } = await api.post<SupportTicket>(
      `${TICKET_BASE}/${id}/assign`,
      mapAssignDto(assignData)
    );
    return data;
  },

  // Auto-assign ticket using AI
  autoAssignTicket: async (id: string) => {
    const { data } = await api.post<SupportTicket>(`${TICKET_BASE}/${id}/auto-assign`);
    return data;
  },

  // Escalate ticket
  escalateTicket: async (id: string, escalateData: EscalateTicketDto) => {
    const { data } = await api.post<SupportTicket>(
      `${TICKET_BASE}/${id}/escalate`,
      mapEscalateDto(escalateData)
    );
    return data;
  },

  // Add response to ticket
  addResponse: async (id: string, responseData: AddResponseDto) => {
    const { data } = await api.post<TicketResponse>(
      `${TICKET_BASE}/${id}/response`,
      mapResponseDto(responseData)
    );
    return data;
  },

  // Close ticket
  closeTicket: async (id: string, satisfactionRating?: number) => {
    const { data } = await api.post<SupportTicket>(`${TICKET_BASE}/${id}/close`, {
      satisfactionRating,
    });
    return data;
  },

  // Reopen ticket
  reopenTicket: async (id: string, reason: string) => {
    const { data } = await api.post<SupportTicket>(`${TICKET_BASE}/${id}/reopen`, {
      reason,
    });
    return data;
  },

  // Get ticket statistics
  getStatistics: async (filters?: Partial<TicketFilters>) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const { data } = await api.get<TicketStatistics>(
      `/crm/support/statistics?${params.toString()}`
    );
    return data;
  },

  // Export tickets
  exportTickets: async (filters?: TicketFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const { data } = await api.get(`${TICKET_BASE}/export?${params.toString()}`, {
      responseType: 'blob',
    });
    return data;
  },
};
