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
const LOCAL_STORAGE_KEY = 'crm-sla-policies';
const MIGRATION_FLAG_KEY = 'crm-sla-migrated';
const MIGRATION_IDS_KEY = 'crm-sla-migrated-ids';

const isBrowser = () => typeof window !== 'undefined';

const readLocalPolicies = (): SLAPolicy[] => {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const markMigrated = () => {
  if (!isBrowser()) return;
  window.localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
};

const readMigratedIds = (): string[] => {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(MIGRATION_IDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeMigratedIds = (ids: string[]) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(MIGRATION_IDS_KEY, JSON.stringify(ids));
};

const shouldMigrate = () =>
  isBrowser() && window.localStorage.getItem(MIGRATION_FLAG_KEY) !== 'true';

const migrateLocalPolicies = async () => {
  if (!shouldMigrate()) return;
  const localPolicies = readLocalPolicies();
  if (!localPolicies.length) {
    markMigrated();
    return;
  }

  const migratedIds = readMigratedIds();

  for (const policy of localPolicies) {
    if (policy.id && migratedIds.includes(policy.id)) continue;
    await api.post<SLAPolicy>(SLA_BASE, {
      name: policy.name,
      description: policy.description,
      priority: policy.priority,
      firstResponseTime: policy.firstResponseTime,
      resolutionTime: policy.resolutionTime,
      businessHoursOnly: policy.businessHoursOnly,
      isActive: policy.isActive,
    });
    if (policy.id) {
      migratedIds.push(policy.id);
      writeMigratedIds(migratedIds);
    }
  }

  if (isBrowser()) {
    window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    window.localStorage.removeItem(MIGRATION_IDS_KEY);
  }
  markMigrated();
};

export const slaApi = {
  // Get all SLA policies
  getSLAPolicies: async () => {
    await migrateLocalPolicies();
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
