import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { onboardingApi, type StartOnboardingDto, type CompleteStepDto, type SkipStepDto, type UpdateProgressDto, type UpdateOnboardingSettingsDto, type CompleteChecklistItemDto, type RequestHelpDto, type AbandonOnboardingDto, type SubmitFeedbackDto, type ClaimRewardDto } from '@/services/onboarding.api';
import { useToast } from '@/hooks/use-toast';

// Start Onboarding
export function useStartOnboarding() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (dto: StartOnboardingDto) => onboardingApi.startOnboarding(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-current'] });
      toast({ title: 'Onboarding started', description: 'Welcome! Let\'s get you set up.' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to start onboarding', description: error.message, variant: 'destructive' });
    },
  });
}

// Get Current Session
export function useGetCurrentSession(type?: 'ORGANIZATION' | 'USER') {
  return useQuery({
    queryKey: ['onboarding-current', type],
    queryFn: () => onboardingApi.getCurrentSession(type),
  });
}

// Complete Step
export function useCompleteStep() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ sessionId, dto }: { sessionId: string; dto: CompleteStepDto }) =>
      onboardingApi.completeStep(sessionId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-current'] });
      toast({ title: 'Step completed', description: 'Great progress! Keep going.' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to complete step', description: error.message, variant: 'destructive' });
    },
  });
}

// Skip Step
export function useSkipStep() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ sessionId, dto }: { sessionId: string; dto: SkipStepDto }) =>
      onboardingApi.skipStep(sessionId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-current'] });
      toast({ title: 'Step skipped', description: 'You can always come back to this later.' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to skip step', description: error.message, variant: 'destructive' });
    },
  });
}

// Update Progress
export function useUpdateProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, dto }: { sessionId: string; dto: UpdateProgressDto }) =>
      onboardingApi.updateProgress(sessionId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-current'] });
    },
  });
}

// Update Settings
export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ sessionId, dto }: { sessionId: string; dto: UpdateOnboardingSettingsDto }) =>
      onboardingApi.updateSettings(sessionId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-current'] });
      toast({ title: 'Settings updated', description: 'Your preferences have been saved.' });
    },
  });
}

// Complete Checklist Item
export function useCompleteChecklistItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ sessionId, dto }: { sessionId: string; dto: CompleteChecklistItemDto }) =>
      onboardingApi.completeChecklistItem(sessionId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-current'] });
      toast({ title: 'Item completed', description: 'Nice work!' });
    },
  });
}

// Request Help
export function useRequestHelp() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ sessionId, dto }: { sessionId: string; dto: RequestHelpDto }) =>
      onboardingApi.requestHelp(sessionId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-current'] });
      toast({ title: 'Help request sent', description: 'Our team will reach out soon!' });
    },
  });
}

// Abandon Onboarding
export function useAbandonOnboarding() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ sessionId, dto }: { sessionId: string; dto: AbandonOnboardingDto }) =>
      onboardingApi.abandonOnboarding(sessionId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-current'] });
      toast({ title: 'Onboarding paused', description: 'You can resume anytime.' });
    },
  });
}

// Submit Feedback
export function useSubmitFeedback() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ sessionId, dto }: { sessionId: string; dto: SubmitFeedbackDto }) =>
      onboardingApi.submitFeedback(sessionId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-current'] });
      toast({ title: 'Thank you!', description: 'Your feedback helps us improve.' });
    },
  });
}

// Claim Reward
export function useClaimReward() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ sessionId, dto }: { sessionId: string; dto: ClaimRewardDto }) =>
      onboardingApi.claimReward(sessionId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-current'] });
      toast({ title: 'Reward claimed!', description: 'Congratulations on completing onboarding!' });
    },
  });
}

// Get Analytics
export function useGetOnboardingAnalytics(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['onboarding-analytics', startDate, endDate],
    queryFn: () => onboardingApi.getAnalytics(startDate, endDate),
  });
}
