import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activityApi } from '@/services/activity.api';
import { toast } from 'sonner';
import type {
  CreateActivityDto,
  CreateNoteDto,
} from '@/types/api.types';

const QUERY_KEYS = {
  timeline: (entityType: string, entityId: string) => ['activities', 'timeline', entityType, entityId] as const,
  notes: (entityType: string, entityId: string) => ['activities', 'notes', entityType, entityId] as const,
};

// Get activity timeline
export const useGetTimeline = (entityType: string, entityId: string, limit?: number) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.timeline(entityType, entityId), limit],
    queryFn: () => activityApi.getTimeline(entityType, entityId, limit),
    enabled: !!entityType && !!entityId,
  });
};

// Log activity
export const useLogActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateActivityDto) => activityApi.logActivity(data),
    onSuccess: (_, variables) => {
      if (variables.relatedToType && variables.relatedToId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.timeline(variables.relatedToType, variables.relatedToId),
        });
      }
      toast.success('Activity logged successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to log activity');
    },
  });
};

// Get notes
export const useGetNotes = (entityType: string, entityId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.notes(entityType, entityId),
    queryFn: () => activityApi.getNotes(entityType, entityId),
    enabled: !!entityType && !!entityId,
  });
};

// Create note
export const useCreateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNoteDto) => activityApi.createNote(data),
    onSuccess: (_, variables) => {
      if (variables.relatedToType && variables.relatedToId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.notes(variables.relatedToType, variables.relatedToId),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.timeline(variables.relatedToType, variables.relatedToId),
        });
      }
      toast.success('Note created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create note');
    },
  });
};

// Update note
export const useUpdateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      activityApi.updateNote(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', 'notes'] });
      toast.success('Note updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update note');
    },
  });
};

// Delete note
export const useDeleteNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => activityApi.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', 'notes'] });
      toast.success('Note deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete note');
    },
  });
};

// Toggle pin note
export const useTogglePinNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => activityApi.togglePinNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', 'notes'] });
      toast.success('Note pin toggled successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to toggle note pin');
    },
  });
};
