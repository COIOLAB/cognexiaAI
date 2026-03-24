import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventApi } from '@/services/event.api';
import { toast } from 'sonner';
import type {
  CreateEventDto,
  UpdateEventDto,
  EventQueryDto,
} from '@/types/api.types';

const QUERY_KEYS = {
  events: ['events'] as const,
  event: (id: string) => ['events', id] as const,
  upcoming: ['events', 'upcoming'] as const,
};

// Get events with filters
export const useGetEvents = (query?: EventQueryDto) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.events, query],
    queryFn: () => eventApi.getEvents(query),
  });
};

// Get event by ID
export const useGetEvent = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.event(id),
    queryFn: () => eventApi.getEventById(id),
    enabled: !!id && id !== 'undefined',
  });
};

// Create event
export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEventDto) => eventApi.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.events });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.upcoming });
      toast.success('Event created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create event');
    },
  });
};

// Update event
export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventDto }) =>
      eventApi.updateEvent(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.event(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.events });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.upcoming });
      toast.success('Event updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update event');
    },
  });
};

// Delete event
export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => eventApi.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.events });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.upcoming });
      toast.success('Event deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete event');
    },
  });
};

// Get upcoming events
export const useGetUpcomingEvents = (limit?: number) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.upcoming, limit],
    queryFn: () => eventApi.getUpcomingEvents(limit),
  });
};

// Get events by date range
export const useGetEventsByDate = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.events, 'dateRange', startDate, endDate],
    queryFn: () => eventApi.getEventsByDate(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
};
