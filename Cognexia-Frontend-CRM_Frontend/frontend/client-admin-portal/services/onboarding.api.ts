import apiClient from '../lib/api-client';

export interface OnboardingSession {
  id: string;
  organizationId: string;
  userId: string;
  type: 'ORGANIZATION' | 'USER';
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  skippedSteps: string[];
  progress: number;
  startedAt?: string;
  completedAt?: string;
  settings?: any;
  checklistItems?: any[];
  rewards?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface StartOnboardingDto {
  type: 'ORGANIZATION' | 'USER';
  metadata?: Record<string, any>;
}

export interface CompleteStepDto {
  stepId: string;
  stepData?: Record<string, any>;
}

export interface SkipStepDto {
  stepId: string;
  reason?: string;
}

export interface UpdateProgressDto {
  currentStep: number;
  progress?: number;
}

export interface UpdateOnboardingSettingsDto {
  settings: Record<string, any>;
}

export interface CompleteChecklistItemDto {
  itemId: string;
}

export interface RequestHelpDto {
  stepId: string;
  message: string;
}

export interface AbandonOnboardingDto {
  reason?: string;
}

export interface SubmitFeedbackDto {
  rating: number;
  feedback?: string;
}

export interface ClaimRewardDto {
  rewardId: string;
}

export interface OnboardingAnalytics {
  totalSessions: number;
  completedSessions: number;
  averageCompletionTime: number;
  abandonmentRate: number;
  stepCompletionRates: Record<string, number>;
}

export const onboardingApi = {
  // Start Onboarding
  startOnboarding: async (dto: StartOnboardingDto): Promise<OnboardingSession> => {
    const response = await apiClient.post('/onboarding/start', {
      ...dto,
      type: dto.type?.toLowerCase(),
    });
    return response.data.data;
  },

  // Get Current Session
  getCurrentSession: async (type?: 'ORGANIZATION' | 'USER'): Promise<OnboardingSession | null> => {
    const response = await apiClient.get('/onboarding/current', {
      params: { type: type ? type.toLowerCase() : undefined },
    });
    return response.data.data;
  },

  // Complete Step
  completeStep: async (sessionId: string, dto: CompleteStepDto): Promise<OnboardingSession> => {
    const response = await apiClient.post(`/onboarding/${sessionId}/steps/complete`, dto);
    return response.data.data;
  },

  // Skip Step
  skipStep: async (sessionId: string, dto: SkipStepDto): Promise<OnboardingSession> => {
    const response = await apiClient.post(`/onboarding/${sessionId}/steps/skip`, dto);
    return response.data.data;
  },

  // Update Progress
  updateProgress: async (sessionId: string, dto: UpdateProgressDto): Promise<OnboardingSession> => {
    const response = await apiClient.put(`/onboarding/${sessionId}/progress`, dto);
    return response.data.data;
  },

  // Update Settings
  updateSettings: async (sessionId: string, dto: UpdateOnboardingSettingsDto): Promise<OnboardingSession> => {
    const response = await apiClient.put(`/onboarding/${sessionId}/settings`, dto);
    return response.data.data;
  },

  // Complete Checklist Item
  completeChecklistItem: async (sessionId: string, dto: CompleteChecklistItemDto): Promise<OnboardingSession> => {
    const response = await apiClient.post(`/onboarding/${sessionId}/checklist/complete`, dto);
    return response.data.data;
  },

  // Request Help
  requestHelp: async (sessionId: string, dto: RequestHelpDto): Promise<OnboardingSession> => {
    const response = await apiClient.post(`/onboarding/${sessionId}/help`, dto);
    return response.data.data;
  },

  // Abandon Onboarding
  abandonOnboarding: async (sessionId: string, dto: AbandonOnboardingDto): Promise<OnboardingSession> => {
    const response = await apiClient.post(`/onboarding/${sessionId}/abandon`, dto);
    return response.data.data;
  },

  // Submit Feedback
  submitFeedback: async (sessionId: string, dto: SubmitFeedbackDto): Promise<OnboardingSession> => {
    const response = await apiClient.post(`/onboarding/${sessionId}/feedback`, dto);
    return response.data.data;
  },

  // Claim Reward
  claimReward: async (sessionId: string, dto: ClaimRewardDto): Promise<OnboardingSession> => {
    const response = await apiClient.post(`/onboarding/${sessionId}/reward/claim`, dto);
    return response.data.data;
  },

  // Get Analytics
  getAnalytics: async (startDate?: string, endDate?: string): Promise<OnboardingAnalytics> => {
    const response = await apiClient.get('/onboarding/analytics', {
      params: { startDate, endDate },
    });
    return response.data.data;
  },
};
