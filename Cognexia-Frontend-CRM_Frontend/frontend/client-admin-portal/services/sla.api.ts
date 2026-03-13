import { api } from '@/lib/api';
import type {
  SLAPolicy,
  CreateSLADto,
  UpdateSLADto,
  SLACompliance,
  SLAMetrics,
  SLAViolation,
} from '@/types/api.types';

const SLA_BASE = '/crm/support/sla';

export const slaApi = {
  // Get all SLA policies
  getSLAPolicies: async () => {
    const { data } = await api.get<{ data: SLAPolicy[] }>(SLA_BASE);
    return data;
  },

  // Get SLA policy by ID
  getSLAById: async (id: string) => {
    const { data } = await api.get<SLAPolicy>(`${SLA_BASE}/${id}`);
    return data;
  },

  // Create SLA policy
  createSLA: async (slaData: CreateSLADto) => {
    const { data } = await api.post<SLAPolicy>(SLA_BASE, slaData);
    return data;
  },

  // Update SLA policy
  updateSLA: async (id: string, slaData: UpdateSLADto) => {
    const { data } = await api.put<SLAPolicy>(`${SLA_BASE}/${id}`, slaData);
    return data;
  },

  // Delete SLA policy
  deleteSLA: async (id: string) => {
    const { data } = await api.delete(`${SLA_BASE}/${id}`);
    return data;
  },

  // Check SLA compliance for a ticket
  checkCompliance: async (ticketId: string) => {
    const { data } = await api.post<SLACompliance>(`${SLA_BASE}/check-compliance`, {
      ticketId,
    });
    return data;
  },

  // Get SLA violations
  getSLAViolations: async (filters?: {
    startDate?: string;
    endDate?: string;
    priority?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const { data } = await api.get<{ data: SLAViolation[] }>(
      `${SLA_BASE}/violations?${params.toString()}`
    );
    return data;
  },

  // Get SLA metrics
  getSLAMetrics: async (filters?: { startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const { data } = await api.get<SLAMetrics>(
      `${SLA_BASE}/metrics?${params.toString()}`
    );
    return data;
  },

  // Calculate SLA for ticket
  calculateSLA: async (ticketId: string) => {
    const { data } = await api.post<{
      firstResponseTime: number;
      resolutionTime: number;
      isCompliant: boolean;
    }>(`${SLA_BASE}/calculate`, { ticketId });
    return data;
  },

  // Get SLA performance report
  getPerformanceReport: async (filters?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const { data } = await api.get(`${SLA_BASE}/report?${params.toString()}`);
    return data;
  },
};
