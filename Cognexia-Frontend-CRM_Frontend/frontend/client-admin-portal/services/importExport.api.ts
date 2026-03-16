import apiClient from '../lib/api-client';

export interface ImportJob {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  importType: 'customer' | 'lead' | 'contact' | 'opportunity' | 'product';
  fileName: string;
  totalRows?: number;
  processedRows?: number;
  successfulRows?: number;
  failedRows?: number;
  errors?: any[];
  createdAt: string;
  completedAt?: string;
}

export interface ExportJob {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  exportType: 'customer' | 'lead' | 'contact' | 'opportunity' | 'product';
  format: 'CSV' | 'EXCEL' | 'PDF';
  fileName?: string;
  fileSize?: number;
  totalRecords?: number;
  createdAt: string;
  completedAt?: string;
  expiresAt?: string;
}

export interface CreateImportDto {
  importType: 'customer' | 'lead' | 'contact' | 'opportunity' | 'product';
  mapping?: Record<string, string>;
  skipDuplicates?: boolean;
  updateExisting?: boolean;
  validateOnly?: boolean;
}

export interface CreateExportDto {
  exportType: 'customer' | 'lead' | 'contact' | 'opportunity' | 'product';
  format: 'CSV' | 'EXCEL' | 'PDF';
  filters?: Record<string, any>;
  columns?: string[];
}

export const importExportApi = {
  // Import Data
  importData: async (file: File, dto: CreateImportDto) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('importType', dto.importType);
    if (dto.mapping) {
      formData.append('mapping', JSON.stringify(dto.mapping));
    }
    if (dto.skipDuplicates !== undefined) {
      formData.append('skipDuplicates', String(dto.skipDuplicates));
    }
    if (dto.updateExisting !== undefined) {
      formData.append('updateExisting', String(dto.updateExisting));
    }
    if (dto.validateOnly !== undefined) {
      formData.append('validateOnly', String(dto.validateOnly));
    }

    const response = await apiClient.post('/import-export/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Get Import Job Status
  getImportJob: async (jobId: string): Promise<ImportJob> => {
    const response = await apiClient.get(`/import-export/import/${jobId}`);
    return response.data;
  },

  // List Import Jobs
  listImportJobs: async (): Promise<ImportJob[]> => {
    const response = await apiClient.get('/import-export/import');
    return response.data;
  },

  // Download Import Template
  downloadTemplate: async (importType: string): Promise<Blob> => {
    const response = await apiClient.post(
      '/import-export/import/template',
      { importType },
      { responseType: 'blob' }
    );
    return response.data;
  },

  // Export Data
  exportData: async (dto: CreateExportDto) => {
    const response = await apiClient.post('/import-export/export', dto);
    return response.data;
  },

  // Get Export Job Status
  getExportJob: async (jobId: string): Promise<ExportJob> => {
    const response = await apiClient.get(`/import-export/export/${jobId}`);
    return response.data;
  },

  // List Export Jobs
  listExportJobs: async (): Promise<ExportJob[]> => {
    const response = await apiClient.get('/import-export/export');
    return response.data;
  },

  // Download Export File
  downloadExport: async (jobId: string): Promise<Blob> => {
    const response = await apiClient.get(`/import-export/export/${jobId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
