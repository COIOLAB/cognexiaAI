import apiClient from '../lib/api-client';

export interface Sequence {
  id: string;
  name: string;
  description?: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  steps: SequenceStep[];
  enrollmentCount: number;
  completionRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface SequenceStep {
  id: string;
  order: number;
  type: 'EMAIL' | 'TASK' | 'CALL' | 'WAIT' | 'CONDITION';
  delayDays: number;
  delayHours: number;
  subject?: string;
  content?: string;
  taskType?: string;
}

export interface CreateSequenceDto {
  name: string;
  description?: string;
  steps: Omit<SequenceStep, 'id'>[];
}

export interface UpdateSequenceDto {
  name?: string;
  description?: string;
  steps?: Omit<SequenceStep, 'id'>[];
}

export interface EnrollLeadDto {
  leadId: string;
  sequenceId: string;
  metadata?: Record<string, any>;
}

export interface BulkEnrollLeadsDto {
  leadIds: string[];
  sequenceId: string;
  metadata?: Record<string, any>;
}

export interface UnenrollLeadDto {
  enrollmentId: string;
  reason?: string;
}

export interface PauseEnrollmentDto {
  reason?: string;
  pauseDurationHours?: number;
}

export interface SequenceAnalytics {
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
  averageTimeToComplete: number;
  stepPerformance: Array<{
    stepId: string;
    completionRate: number;
    averageTimeSpent: number;
  }>;
}

export const sequenceApi = {
  // Create Sequence
  createSequence: async (dto: CreateSequenceDto): Promise<Sequence> => {
    const response = await apiClient.post('/sequences', dto);
    return response.data;
  },

  // Get All Sequences
  getSequences: async (): Promise<Sequence[]> => {
    const response = await apiClient.get('/sequences');
    return response.data;
  },

  // Get Sequence by ID
  getSequence: async (id: string): Promise<Sequence> => {
    const response = await apiClient.get(`/sequences/${id}`);
    return response.data;
  },

  // Update Sequence
  updateSequence: async (id: string, dto: UpdateSequenceDto): Promise<Sequence> => {
    const response = await apiClient.put(`/sequences/${id}`, dto);
    return response.data;
  },

  // Delete Sequence
  deleteSequence: async (id: string): Promise<void> => {
    await apiClient.delete(`/sequences/${id}`);
  },

  // Activate Sequence
  activateSequence: async (id: string): Promise<Sequence> => {
    const response = await apiClient.post(`/sequences/${id}/activate`);
    return response.data;
  },

  // Pause Sequence
  pauseSequence: async (id: string): Promise<Sequence> => {
    const response = await apiClient.post(`/sequences/${id}/pause`);
    return response.data;
  },

  // Enroll Lead
  enrollLead: async (dto: EnrollLeadDto): Promise<any> => {
    const response = await apiClient.post('/sequences/enroll', dto);
    return response.data;
  },

  // Bulk Enroll Leads
  bulkEnrollLeads: async (dto: BulkEnrollLeadsDto): Promise<{ enrolled: number; failed: number; total: number }> => {
    const response = await apiClient.post('/sequences/enroll/bulk', dto);
    return response.data;
  },

  // Unenroll Lead
  unenrollLead: async (dto: UnenrollLeadDto): Promise<void> => {
    await apiClient.post('/sequences/unenroll', dto);
  },

  // Pause Enrollment
  pauseEnrollment: async (enrollmentId: string, dto: PauseEnrollmentDto): Promise<void> => {
    await apiClient.post(`/sequences/enrollment/${enrollmentId}/pause`, dto);
  },

  // Resume Enrollment
  resumeEnrollment: async (enrollmentId: string): Promise<void> => {
    await apiClient.post(`/sequences/enrollment/${enrollmentId}/resume`);
  },

  // Get Sequence Analytics
  getSequenceAnalytics: async (id: string, startDate?: string, endDate?: string): Promise<SequenceAnalytics> => {
    const response = await apiClient.get(`/sequences/${id}/analytics`, {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // Get Enrollment Timeline
  getEnrollmentTimeline: async (id: string, groupBy?: 'day' | 'week' | 'month'): Promise<any> => {
    const response = await apiClient.get(`/sequences/${id}/timeline`, {
      params: { groupBy },
    });
    return response.data;
  },

  // Get Overall Stats
  getOverallStats: async (): Promise<any> => {
    const response = await apiClient.get('/sequences/analytics/overall');
    return response.data;
  },

  // Compare Sequences
  compareSequences: async (sequenceIds: string[]): Promise<any> => {
    const response = await apiClient.post('/sequences/analytics/compare', { sequenceIds });
    return response.data;
  },
};
