import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportScheduleApi } from '@/services/reportSchedule.api';
import { toast } from 'sonner';
import type {
  CreateReportScheduleDto,
  UpdateReportScheduleDto,
} from '@/types/api.types';

const QUERY_KEYS = {
  schedules: ['report-schedules'] as const,
  schedule: (id: string) => ['report-schedules', id] as const,
};

// Get all schedules
export const useGetSchedules = () => {
  return useQuery({
    queryKey: QUERY_KEYS.schedules,
    queryFn: () => reportScheduleApi.getSchedules(),
  });
};

// Get schedule by ID
export const useGetSchedule = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.schedule(id),
    queryFn: () => reportScheduleApi.getScheduleById(id),
    enabled: !!id,
  });
};

// Create schedule
export const useCreateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReportScheduleDto) =>
      reportScheduleApi.createSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schedules });
      toast.success('Schedule created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create schedule');
    },
  });
};

// Update schedule
export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReportScheduleDto }) =>
      reportScheduleApi.updateSchedule(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schedule(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schedules });
      toast.success('Schedule updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update schedule');
    },
  });
};

// Delete schedule
export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reportScheduleApi.deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schedules });
      toast.success('Schedule deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete schedule');
    },
  });
};

// Run schedule now
export const useRunScheduleNow = () => {
  return useMutation({
    mutationFn: (id: string) => reportScheduleApi.runScheduleNow(id),
    onSuccess: () => {
      toast.success('Schedule executed successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to run schedule');
    },
  });
};
