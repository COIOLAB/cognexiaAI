import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sequenceApi, type CreateSequenceDto, type UpdateSequenceDto, type EnrollLeadDto, type BulkEnrollLeadsDto, type UnenrollLeadDto, type PauseEnrollmentDto } from '@/services/sequence.api';
import { useToast } from '@/hooks/use-toast';

// Get All Sequences
export function useGetSequences() {
  return useQuery({
    queryKey: ['sequences'],
    queryFn: sequenceApi.getSequences,
  });
}

// Get Sequence by ID
export function useGetSequence(id: string) {
  return useQuery({
    queryKey: ['sequence', id],
    queryFn: () => sequenceApi.getSequence(id),
    enabled: !!id,
  });
}

// Create Sequence
export function useCreateSequence() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (dto: CreateSequenceDto) => sequenceApi.createSequence(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sequences'] });
      toast({ title: 'Sequence created', description: 'Sales sequence has been created successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to create sequence', description: error.message, variant: 'destructive' });
    },
  });
}

// Update Sequence
export function useUpdateSequence() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateSequenceDto }) => sequenceApi.updateSequence(id, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sequences'] });
      queryClient.invalidateQueries({ queryKey: ['sequence', variables.id] });
      toast({ title: 'Sequence updated', description: 'Changes have been saved' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to update sequence', description: error.message, variant: 'destructive' });
    },
  });
}

// Delete Sequence
export function useDeleteSequence() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => sequenceApi.deleteSequence(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sequences'] });
      toast({ title: 'Sequence deleted', description: 'Sequence has been permanently deleted' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to delete sequence', description: error.message, variant: 'destructive' });
    },
  });
}

// Activate Sequence
export function useActivateSequence() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => sequenceApi.activateSequence(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['sequences'] });
      queryClient.invalidateQueries({ queryKey: ['sequence', id] });
      toast({ title: 'Sequence activated', description: 'Sequence is now active and can enroll leads' });
    },
  });
}

// Pause Sequence
export function usePauseSequence() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => sequenceApi.pauseSequence(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['sequences'] });
      queryClient.invalidateQueries({ queryKey: ['sequence', id] });
      toast({ title: 'Sequence paused', description: 'No new enrollments will be accepted' });
    },
  });
}

// Enroll Lead
export function useEnrollLead() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (dto: EnrollLeadDto) => sequenceApi.enrollLead(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sequences'] });
      toast({ title: 'Lead enrolled', description: 'Lead has been enrolled in the sequence' });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to enroll lead', description: error.message, variant: 'destructive' });
    },
  });
}

// Bulk Enroll Leads
export function useBulkEnrollLeads() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (dto: BulkEnrollLeadsDto) => sequenceApi.bulkEnrollLeads(dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sequences'] });
      toast({
        title: 'Bulk enrollment complete',
        description: `${data.enrolled} leads enrolled successfully, ${data.failed} failed`,
      });
    },
    onError: (error: any) => {
      toast({ title: 'Failed to enroll leads', description: error.message, variant: 'destructive' });
    },
  });
}

// Unenroll Lead
export function useUnenrollLead() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (dto: UnenrollLeadDto) => sequenceApi.unenrollLead(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sequences'] });
      toast({ title: 'Lead unenrolled', description: 'Lead has been removed from the sequence' });
    },
  });
}

// Pause Enrollment
export function usePauseEnrollment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ enrollmentId, dto }: { enrollmentId: string; dto: PauseEnrollmentDto }) =>
      sequenceApi.pauseEnrollment(enrollmentId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sequences'] });
      toast({ title: 'Enrollment paused', description: 'Sequence progression has been paused for this lead' });
    },
  });
}

// Resume Enrollment
export function useResumeEnrollment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (enrollmentId: string) => sequenceApi.resumeEnrollment(enrollmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sequences'] });
      toast({ title: 'Enrollment resumed', description: 'Sequence progression has been resumed' });
    },
  });
}

// Get Sequence Analytics
export function useGetSequenceAnalytics(id: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['sequence-analytics', id, startDate, endDate],
    queryFn: () => sequenceApi.getSequenceAnalytics(id, startDate, endDate),
    enabled: !!id,
  });
}

// Get Enrollment Timeline
export function useGetEnrollmentTimeline(id: string, groupBy?: 'day' | 'week' | 'month') {
  return useQuery({
    queryKey: ['enrollment-timeline', id, groupBy],
    queryFn: () => sequenceApi.getEnrollmentTimeline(id, groupBy),
    enabled: !!id,
  });
}

// Get Overall Stats
export function useGetOverallStats() {
  return useQuery({
    queryKey: ['sequences-overall-stats'],
    queryFn: sequenceApi.getOverallStats,
  });
}

// Compare Sequences
export function useCompareSequences(sequenceIds: string[]) {
  return useQuery({
    queryKey: ['sequences-comparison', sequenceIds],
    queryFn: () => sequenceApi.compareSequences(sequenceIds),
    enabled: sequenceIds.length > 0,
  });
}
