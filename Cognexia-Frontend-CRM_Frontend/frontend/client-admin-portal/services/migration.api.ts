import apiClient from '../lib/api-client';

export interface MigrationJob {
  id: string;
  jobName: string;
  migrationType: 'CSV_IMPORT' | 'EXCEL_IMPORT' | 'ERP_SYNC' | 'SALESFORCE_SYNC' | 'HUBSPOT_SYNC' | 'SAP_SYNC' | 'ORACLE_SYNC';
  targetEntity: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'PAUSED';
  totalRecords?: number;
  processedRecords?: number;
  successfulRecords?: number;
  failedRecords?: number;
  errors?: any[];
  filePath?: string;
  createdAt: string;
  completedAt?: string;
}

export interface ImportOptions {
  skipDuplicates?: boolean;
  updateExisting?: boolean;
  validateOnly?: boolean;
}

export const migrationApi = {
  // CSV Import
  importCSV: async (file: File, targetEntity: string, fieldMapping?: Record<string, string>, options?: ImportOptions) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('targetEntity', targetEntity);
    if (fieldMapping) {
      formData.append('fieldMapping', JSON.stringify(fieldMapping));
    }
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }
    const response = await apiClient.post('/migration/import/csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Excel Import
  importExcel: async (file: File, targetEntity: string, fieldMapping?: Record<string, string>, options?: ImportOptions) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('targetEntity', targetEntity);
    if (fieldMapping) {
      formData.append('fieldMapping', JSON.stringify(fieldMapping));
    }
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }
    const response = await apiClient.post('/migration/import/excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // ERP Sync
  syncFromERP: async (connectionId: string, targetEntity: string, options?: ImportOptions) => {
    const response = await apiClient.post('/migration/sync/erp', {
      connectionId,
      targetEntity,
      options,
    });
    return response.data;
  },

  // Salesforce Sync
  syncFromSalesforce: async (connectionId: string, targetEntity: string, options?: ImportOptions) => {
    const response = await apiClient.post('/migration/sync/salesforce', {
      connectionId,
      targetEntity,
      options,
    });
    return response.data;
  },

  // HubSpot Sync
  syncFromHubSpot: async (connectionId: string, targetEntity: string, options?: ImportOptions) => {
    const response = await apiClient.post('/migration/sync/hubspot', {
      connectionId,
      targetEntity,
      options,
    });
    return response.data;
  },

  // SAP Sync
  syncFromSAP: async (connectionId: string, targetEntity: string, options?: ImportOptions) => {
    const response = await apiClient.post('/migration/sync/sap', {
      connectionId,
      targetEntity,
      options,
    });
    return response.data;
  },

  // Oracle Sync
  syncFromOracle: async (connectionId: string, targetEntity: string, options?: ImportOptions) => {
    const response = await apiClient.post('/migration/sync/oracle', {
      connectionId,
      targetEntity,
      options,
    });
    return response.data;
  },

  // Zoho Sync
  syncFromZoho: async (connectionId: string, targetEntity: string, options?: ImportOptions) => {
    const response = await apiClient.post('/migration/sync/zoho', {
      connectionId,
      targetEntity,
      options,
    });
    return response.data;
  },

  // Get Migration Job
  getMigrationJob: async (jobId: string): Promise<MigrationJob> => {
    const response = await apiClient.get(`/migration/jobs/${jobId}`);
    return response.data;
  },

  // List Migration Jobs
  listMigrationJobs: async (): Promise<MigrationJob[]> => {
    const response = await apiClient.get('/migration/jobs');
    return response.data;
  },

  // Cancel Migration Job
  cancelMigrationJob: async (jobId: string) => {
    const response = await apiClient.post(`/migration/jobs/${jobId}/cancel`);
    return response.data;
  },

  // Retry Failed Records
  retryFailedRecords: async (jobId: string) => {
    const response = await apiClient.post(`/migration/jobs/${jobId}/retry`);
    return response.data;
  },

  // Rollback Migration
  rollbackMigration: async (jobId: string) => {
    const response = await apiClient.post(`/migration/jobs/${jobId}/rollback`);
    return response.data;
  },

  // Get CSV Template
  getTemplate: async (entity: string) => {
    const response = await apiClient.get(`/migration/templates/${entity}`);
    return response.data;
  },

  // Get Supported Entities
  getSupportedEntities: async () => {
    const response = await apiClient.get('/migration/supported-entities');
    return response.data;
  },

  // Get Field Mappings
  getFieldMappings: async (entity: string) => {
    const response = await apiClient.get(`/migration/field-mappings/${entity}`);
    return response.data;
  },
};
