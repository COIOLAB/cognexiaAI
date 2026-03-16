import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { importExportApi, type CreateImportDto, type CreateExportDto } from '@/services/importExport.api';
import { useToast } from '@/hooks/use-toast';

// Import Data
export function useImportData() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ file, dto }: { file: File; dto: CreateImportDto }) =>
      importExportApi.importData(file, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import-jobs'] });
      toast({ title: 'Import started', description: 'Your data import has been queued for processing' });
    },
    onError: (error: any) => {
      toast({ title: 'Import failed', description: error.message, variant: 'destructive' });
    },
  });
}

// Get Import Job Status
export function useGetImportJob(jobId: string) {
  return useQuery({
    queryKey: ['import-job', jobId],
    queryFn: () => importExportApi.getImportJob(jobId),
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

// List Import Jobs
export function useListImportJobs() {
  return useQuery({
    queryKey: ['import-jobs'],
    queryFn: importExportApi.listImportJobs,
  });
}

// Download Import Template
export function useDownloadTemplate() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (importType: string) => importExportApi.downloadTemplate(importType),
    onSuccess: (blob, importType) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${importType}_template.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({ title: 'Template downloaded', description: 'Import template has been downloaded' });
    },
    onError: (error: any) => {
      toast({ title: 'Download failed', description: error.message, variant: 'destructive' });
    },
  });
}

// Export Data
export function useExportData() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (dto: CreateExportDto) => importExportApi.exportData(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['export-jobs'] });
      toast({ title: 'Export started', description: 'Your data export has been queued for processing' });
    },
    onError: (error: any) => {
      toast({ title: 'Export failed', description: error.message, variant: 'destructive' });
    },
  });
}

// Get Export Job Status
export function useGetExportJob(jobId: string) {
  return useQuery({
    queryKey: ['export-job', jobId],
    queryFn: () => importExportApi.getExportJob(jobId),
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

// List Export Jobs
export function useListExportJobs() {
  return useQuery({
    queryKey: ['export-jobs'],
    queryFn: importExportApi.listExportJobs,
  });
}

// Download Export File
export function useDownloadExport() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ jobId, fileName }: { jobId: string; fileName?: string }) =>
      importExportApi.downloadExport(jobId),
    onSuccess: (blob, variables) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = variables.fileName || 'export.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({ title: 'Export downloaded', description: 'Your export file has been downloaded' });
    },
    onError: (error: any) => {
      toast({ title: 'Download failed', description: error.message, variant: 'destructive' });
    },
  });
}
