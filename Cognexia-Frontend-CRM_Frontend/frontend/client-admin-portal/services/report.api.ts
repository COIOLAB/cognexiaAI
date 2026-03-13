import apiClient from '@/lib/api-client';
import type {
  Report,
  CreateReportDto,
  UpdateReportDto,
  RunReportDto,
  ReportResult,
} from '@/types/api.types';

const BASE_URL = '/reporting';

export const reportApi = {
  // Get all reports
  getReports: async (): Promise<{ data: Report[]; total: number }> => {
    const response = await apiClient.get(`${BASE_URL}/reports`);
    return response.data;
  },

  // Get report by ID
  getReportById: async (id: string): Promise<Report> => {
    const response = await apiClient.get(`${BASE_URL}/reports/${id}`);
    return response.data;
  },

  // Get pre-built report templates
  getReportTemplates: async (): Promise<{ data: Report[]; total: number }> => {
    const response = await apiClient.get(`${BASE_URL}/reports/templates`);
    return response.data;
  },

  // Create new report
  createReport: async (data: CreateReportDto): Promise<Report> => {
    const response = await apiClient.post(`${BASE_URL}/reports`, data);
    return response.data;
  },

  // Update report
  updateReport: async (id: string, data: UpdateReportDto): Promise<Report> => {
    const response = await apiClient.put(`${BASE_URL}/reports/${id}`, data);
    return response.data;
  },

  // Delete report
  deleteReport: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/reports/${id}`);
  },

  // Run report and get results
  runReport: async (id: string, params?: RunReportDto): Promise<ReportResult> => {
    const response = await apiClient.post(`${BASE_URL}/reports/${id}/run`, params);
    return response.data;
  },
};
