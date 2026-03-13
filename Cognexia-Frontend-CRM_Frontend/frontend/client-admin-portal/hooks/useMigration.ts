import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { migrationApi, type ImportOptions } from '@/services/migration.api';
import { useToast } from '@/hooks/use-toast';

export function useImportCSV() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ file, targetEntity, fieldMapping, options }: {
      file: File;
      targetEntity: string;
      fieldMapping?: Record<string, string>;
      options?: ImportOptions;
    }) => migrationApi.importCSV(file, targetEntity, fieldMapping, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['migration-jobs'] });
      toast({ title: 'Import started', description: 'Your CSV import job has been created' });
    },
    onError: (error: any) => {
      toast({ title: 'Import failed', description: error.message, variant: 'destructive' });
    },
  });
}

export function useImportExcel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ file, targetEntity, fieldMapping, options }: {
      file: File;
      targetEntity: string;
      fieldMapping?: Record<string, string>;
      options?: ImportOptions;
    }) => migrationApi.importExcel(file, targetEntity, fieldMapping, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['migration-jobs'] });
      toast({ title: 'Import started', description: 'Your Excel import job has been created' });
    },
  });
}

export function useSyncFromSalesforce() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ connectionId, targetEntity, options }: {
      connectionId: string;
      targetEntity: string;
      options?: ImportOptions;
    }) => migrationApi.syncFromSalesforce(connectionId, targetEntity, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['migration-jobs'] });
      toast({ title: 'Sync started', description: 'Salesforce sync has been initiated' });
    },
  });
}

export function useSyncFromHubSpot() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ connectionId, targetEntity, options }: {
      connectionId: string;
      targetEntity: string;
      options?: ImportOptions;
    }) => migrationApi.syncFromHubSpot(connectionId, targetEntity, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['migration-jobs'] });
      toast({ title: 'Sync started', description: 'HubSpot sync has been initiated' });
    },
  });
}

export function useSyncFromSAP() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ connectionId, targetEntity, options }: {
      connectionId: string;
      targetEntity: string;
      options?: ImportOptions;
    }) => migrationApi.syncFromSAP(connectionId, targetEntity, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['migration-jobs'] });
      toast({ title: 'Sync started', description: 'SAP sync has been initiated' });
    },
  });
}

export function useSyncFromOracle() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ connectionId, targetEntity, options }: {
      connectionId: string;
      targetEntity: string;
      options?: ImportOptions;
    }) => migrationApi.syncFromOracle(connectionId, targetEntity, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['migration-jobs'] });
      toast({ title: 'Sync started', description: 'Oracle sync has been initiated' });
    },
  });
}

export function useSyncFromZoho() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ connectionId, targetEntity, options }: {
      connectionId: string;
      targetEntity: string;
      options?: ImportOptions;
    }) => migrationApi.syncFromZoho(connectionId, targetEntity, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['migration-jobs'] });
      toast({ title: 'Sync started', description: 'Zoho sync has been initiated' });
    },
  });
}

export function useSyncFromERP() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ connectionId, targetEntity, options }: {
      connectionId: string;
      targetEntity: string;
      options?: ImportOptions;
    }) => migrationApi.syncFromERP(connectionId, targetEntity, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['migration-jobs'] });
      toast({ title: 'Sync started', description: 'ERP sync has been initiated' });
    },
  });
}

export function useGetMigrationJob(jobId: string) {
  return useQuery({
    queryKey: ['migration-job', jobId],
    queryFn: () => migrationApi.getMigrationJob(jobId),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'PROCESSING' || status === 'PENDING') {
        return 3000; // Poll every 3 seconds for active jobs
      }
      return false;
    },
  });
}

export function useListMigrationJobs() {
  return useQuery({
    queryKey: ['migration-jobs'],
    queryFn: migrationApi.listMigrationJobs,
  });
}

export function useCancelMigrationJob() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (jobId: string) => migrationApi.cancelMigrationJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['migration-jobs'] });
      toast({ title: 'Job cancelled', description: 'Migration job has been cancelled' });
    },
  });
}

export function useRetryFailedRecords() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (jobId: string) => migrationApi.retryFailedRecords(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['migration-jobs'] });
      toast({ title: 'Retry started', description: 'Retrying failed records' });
    },
  });
}

export function useRollbackMigration() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (jobId: string) => migrationApi.rollbackMigration(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['migration-jobs'] });
      toast({ title: 'Rollback completed', description: 'Migration has been rolled back' });
    },
    onError: (error: any) => {
      toast({ title: 'Rollback failed', description: error.message, variant: 'destructive' });
    },
  });
}

export function useGetTemplate(entity: string) {
  return useQuery({
    queryKey: ['migration-template', entity],
    queryFn: () => migrationApi.getTemplate(entity),
    enabled: !!entity,
  });
}

export function useGetSupportedEntities() {
  return useQuery({
    queryKey: ['migration-supported-entities'],
    queryFn: migrationApi.getSupportedEntities,
  });
}

export function useGetFieldMappings(entity: string) {
  return useQuery({
    queryKey: ['migration-field-mappings', entity],
    queryFn: () => migrationApi.getFieldMappings(entity),
    enabled: !!entity,
  });
}
