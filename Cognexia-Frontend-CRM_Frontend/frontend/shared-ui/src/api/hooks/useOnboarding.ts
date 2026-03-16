import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { onboardingApi } from '../endpoints/onboarding';
import type {
  OnboardingType,
  StartOnboardingRequest,
  CompleteStepRequest,
  SkipStepRequest,
  UpdateProgressRequest,
  CompleteChecklistItemRequest,
  RequestHelpRequest,
  SubmitFeedbackRequest,
  ClaimRewardRequest,
} from '../types';

const ONBOARDING_KEYS = {
  all: ['onboarding'] as const,
  current: (type?: OnboardingType) => [...ONBOARDING_KEYS.all, 'current', type] as const,
  detail: (id: string) => [...ONBOARDING_KEYS.all, 'detail', id] as const,
};

// Get current onboarding session
export function useCurrentOnboarding(type?: OnboardingType) {
  return useQuery({
    queryKey: ONBOARDING_KEYS.current(type),
    queryFn: () => onboardingApi.getCurrent(type),
  });
}

// Get onboarding session by ID
export function useOnboardingSession(sessionId: string, enabled = true) {
  return useQuery({
    queryKey: ONBOARDING_KEYS.detail(sessionId),
    queryFn: () => onboardingApi.getById(sessionId),
    enabled: enabled && !!sessionId,
  });
}

// Start onboarding
export function useStartOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StartOnboardingRequest) => onboardingApi.start(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_KEYS.all });
      queryClient.setQueryData(ONBOARDING_KEYS.detail(data.id), data);
    },
  });
}

// Complete step
export function useCompleteStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: CompleteStepRequest }) =>
      onboardingApi.completeStep(sessionId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_KEYS.all });
      queryClient.setQueryData(ONBOARDING_KEYS.detail(variables.sessionId), data);
    },
  });
}

// Skip step
export function useSkipStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: SkipStepRequest }) =>
      onboardingApi.skipStep(sessionId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_KEYS.all });
      queryClient.setQueryData(ONBOARDING_KEYS.detail(variables.sessionId), data);
    },
  });
}

// Update progress
export function useUpdateProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: UpdateProgressRequest }) =>
      onboardingApi.updateProgress(sessionId, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(ONBOARDING_KEYS.detail(variables.sessionId), data);
    },
  });
}

// Complete onboarding
export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => onboardingApi.complete(sessionId),
    onSuccess: (data, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_KEYS.all });
      queryClient.setQueryData(ONBOARDING_KEYS.detail(sessionId), data);
    },
  });
}

// Complete checklist item
export function useCompleteChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: CompleteChecklistItemRequest }) =>
      onboardingApi.completeChecklistItem(sessionId, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(ONBOARDING_KEYS.detail(variables.sessionId), data);
    },
  });
}

// Request help
export function useRequestHelp() {
  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: RequestHelpRequest }) =>
      onboardingApi.requestHelp(sessionId, data),
  });
}

// Submit feedback
export function useSubmitFeedback() {
  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: SubmitFeedbackRequest }) =>
      onboardingApi.submitFeedback(sessionId, data),
  });
}

// Claim reward
export function useClaimReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: ClaimRewardRequest }) =>
      onboardingApi.claimReward(sessionId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_KEYS.detail(variables.sessionId) });
    },
  });
}

// Abandon onboarding
export function useAbandonOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, reason, feedbackNotes }: { sessionId: string; reason?: string; feedbackNotes?: string }) =>
      onboardingApi.abandon(sessionId, reason, feedbackNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ONBOARDING_KEYS.all });
    },
  });
}

// Update settings
export function useUpdateOnboardingSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, settings }: { sessionId: string; settings: { showTips?: boolean; sendReminders?: boolean; autoAdvance?: boolean } }) =>
      onboardingApi.updateSettings(sessionId, settings),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(ONBOARDING_KEYS.detail(variables.sessionId), data);
    },
  });
}
