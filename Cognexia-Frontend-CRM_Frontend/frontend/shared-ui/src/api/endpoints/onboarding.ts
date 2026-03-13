import { apiClient } from '../client';
import type {
  OnboardingSession,
  StartOnboardingRequest,
  CompleteStepRequest,
  SkipStepRequest,
  UpdateProgressRequest,
  CompleteChecklistItemRequest,
  RequestHelpRequest,
  SubmitFeedbackRequest,
  ClaimRewardRequest,
  OnboardingType,
} from '../types';

export const onboardingApi = {
  // Start onboarding session
  start: async (data: StartOnboardingRequest) => {
    const response = await apiClient.post<{ success: boolean; message: string; data: OnboardingSession }>(
      '/onboarding/start',
      data
    );
    return response.data.data;
  },

  // Get current onboarding session
  getCurrent: async (type?: OnboardingType) => {
    const params = type ? { type } : {};
    const response = await apiClient.get<{ success: boolean; message: string; data: OnboardingSession | null }>(
      '/onboarding/current',
      { params }
    );
    return response.data.data;
  },

  // Get onboarding session by ID
  getById: async (sessionId: string) => {
    const response = await apiClient.get<{ success: boolean; message: string; data: OnboardingSession }>(
      `/onboarding/${sessionId}`
    );
    return response.data.data;
  },

  // Complete a step
  completeStep: async (sessionId: string, data: CompleteStepRequest) => {
    const response = await apiClient.post<{ success: boolean; message: string; data: OnboardingSession }>(
      `/onboarding/${sessionId}/steps/complete`,
      data
    );
    return response.data.data;
  },

  // Skip a step
  skipStep: async (sessionId: string, data: SkipStepRequest) => {
    const response = await apiClient.post<{ success: boolean; message: string; data: OnboardingSession }>(
      `/onboarding/${sessionId}/steps/skip`,
      data
    );
    return response.data.data;
  },

  // Update progress
  updateProgress: async (sessionId: string, data: UpdateProgressRequest) => {
    const response = await apiClient.put<{ success: boolean; message: string; data: OnboardingSession }>(
      `/onboarding/${sessionId}/progress`,
      data
    );
    return response.data.data;
  },

  // Complete onboarding
  complete: async (sessionId: string) => {
    const response = await apiClient.post<{ success: boolean; message: string; data: OnboardingSession }>(
      `/onboarding/${sessionId}/complete`
    );
    return response.data.data;
  },

  // Complete checklist item
  completeChecklistItem: async (sessionId: string, data: CompleteChecklistItemRequest) => {
    const response = await apiClient.post<{ success: boolean; message: string; data: OnboardingSession }>(
      `/onboarding/${sessionId}/checklist/complete`,
      data
    );
    return response.data.data;
  },

  // Request help
  requestHelp: async (sessionId: string, data: RequestHelpRequest) => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      `/onboarding/${sessionId}/help`,
      data
    );
    return response.data;
  },

  // Submit feedback
  submitFeedback: async (sessionId: string, data: SubmitFeedbackRequest) => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      `/onboarding/${sessionId}/feedback`,
      data
    );
    return response.data;
  },

  // Claim reward
  claimReward: async (sessionId: string, data: ClaimRewardRequest) => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      `/onboarding/${sessionId}/rewards/claim`,
      data
    );
    return response.data;
  },

  // Abandon onboarding
  abandon: async (sessionId: string, reason?: string, feedbackNotes?: string) => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      `/onboarding/${sessionId}/abandon`,
      { reason, feedbackNotes }
    );
    return response.data;
  },

  // Update settings
  updateSettings: async (sessionId: string, settings: { showTips?: boolean; sendReminders?: boolean; autoAdvance?: boolean }) => {
    const response = await apiClient.put<{ success: boolean; message: string; data: OnboardingSession }>(
      `/onboarding/${sessionId}/settings`,
      settings
    );
    return response.data.data;
  },
};
