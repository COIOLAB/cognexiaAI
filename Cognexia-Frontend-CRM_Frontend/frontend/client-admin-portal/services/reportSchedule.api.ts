import apiClient from '@/lib/api-client';
import type {
  ReportSchedule,
  CreateReportScheduleDto,
  UpdateReportScheduleDto,
} from '@/types/api.types';

const BASE_URL = '/reporting';

export const reportScheduleApi = {
  // Get all schedules
  getSchedules: async (): Promise<{ data: ReportSchedule[]; total: number }> => {
    const response = await apiClient.get(`${BASE_URL}/schedules`);
    return response.data;
  },

  // Get schedule by ID
  getScheduleById: async (id: string): Promise<ReportSchedule> => {
    const response = await apiClient.get(`${BASE_URL}/schedules/${id}`);
    return response.data;
  },

  // Create new schedule
  createSchedule: async (data: CreateReportScheduleDto): Promise<ReportSchedule> => {
    const response = await apiClient.post(`${BASE_URL}/schedules`, data);
    return response.data;
  },

  // Update schedule
  updateSchedule: async (
    id: string,
    data: UpdateReportScheduleDto
  ): Promise<ReportSchedule> => {
    const response = await apiClient.put(`${BASE_URL}/schedules/${id}`, data);
    return response.data;
  },

  // Delete schedule
  deleteSchedule: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/schedules/${id}`);
  },

  // Run schedule immediately
  runScheduleNow: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.post(`${BASE_URL}/schedules/${id}/run`);
    return response.data;
  },
};
