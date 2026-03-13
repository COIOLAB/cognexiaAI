'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DataTable } from '@/components/data-table';
import {
  useImportData,
  useListImportJobs,
  useDownloadTemplate,
  useExportData,
  useListExportJobs,
  useDownloadExport,
} from '@/hooks/useImportExport';
import { Upload, Download, FileText, CheckCircle, XCircle, Clock, FileDown } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import type { ColumnDef } from '@tanstack/react-table';
import type { ImportJob, ExportJob } from '@/services/importExport.api';
import { PageHeader } from '@/components/PageHeader';

export default function ImportExportPage() {
  const [importType, setImportType] = useState<string>('customer');
  const [exportType, setExportType] = useState<string>('customer');
  const [exportFormat, setExportFormat] = useState<'CSV' | 'EXCEL' | 'PDF'>('CSV');
  const [importOptions, setImportOptions] = useState({
    skipDuplicates: true,
    updateExisting: false,
    validateOnly: false,
  });

  const importData = useImportData();
  const importJobsQuery = useListImportJobs();
  const importJobs = importJobsQuery.data || [];
  const downloadTemplate = useDownloadTemplate();
  const exportData = useExportData();
  const exportJobsQuery = useListExportJobs();
  const exportJobs = exportJobsQuery.data || [];
  const downloadExport = useDownloadExport();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        importData.mutate({
          file,
          dto: {
            importType: importType as any,
            ...importOptions,
          },
        });
      }
    },
    [importType, importOptions, importData]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
  });

  const handleExport = () => {
    exportData.mutate({
      exportType: exportType as any,
      format: exportFormat,
    });
  };

  const importColumns: ColumnDef<ImportJob>[] = [
    {
      accessorKey: 'fileName',
      header: 'File Name',
    },
    {
      accessorKey: 'importType',
      header: 'Type',
      cell: ({ row }) => <Badge variant="outline">{row.original.importType}</Badge>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const icons = {
          PENDING: <Clock className="h-4 w-4 text-yellow-500" />,
          PROCESSING: <Clock className="h-4 w-4 text-blue-500 animate-spin" />,
          COMPLETED: <CheckCircle className="h-4 w-4 text-green-500" />,
          FAILED: <XCircle className="h-4 w-4 text-red-500" />,
        };
        return (
          <div className="flex items-center gap-2">
            {icons[status]}
            <span>{status}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'progress',
      header: 'Progress',
      cell: ({ row }) => {
        const job = row.original;
        const progress = job.totalRows
          ? Math.round(((job.processedRows || 0) / job.totalRows) * 100)
          : 0;
        return (
          <div className="space-y-1 min-w-[120px]">
            <Progress value={progress} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {job.successfulRows || 0} / {job.totalRows || 0}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
    },
  ];

  const exportColumns: ColumnDef<ExportJob>[] = [
    {
      accessorKey: 'exportType',
      header: 'Type',
      cell: ({ row }) => <Badge variant="outline">{row.original.exportType}</Badge>,
    },
    {
      accessorKey: 'format',
      header: 'Format',
      cell: ({ row }) => <Badge>{row.original.format}</Badge>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const icons = {
          PENDING: <Clock className="h-4 w-4 text-yellow-500" />,
          PROCESSING: <Clock className="h-4 w-4 text-blue-500 animate-spin" />,
          COMPLETED: <CheckCircle className="h-4 w-4 text-green-500" />,
          FAILED: <XCircle className="h-4 w-4 text-red-500" />,
        };
        return (
          <div className="flex items-center gap-2">
            {icons[status]}
            <span>{status}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'totalRecords',
      header: 'Records',
      cell: ({ row }) =>
        row.original.totalRecords != null
          ? Number(row.original.totalRecords).toLocaleString()
          : '-',
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const job = row.original;
        return job.status === 'COMPLETED' ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => downloadExport.mutate({ jobId: job.id, fileName: job.fileName })}
          >
            <FileDown className="h-4 w-4 mr-2" />
            Download
          </Button>
        ) : null;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Import & Export"
        subtitle="Manage your data imports and exports"
        actions={
          <Button
            variant="outline"
            onClick={() => {
              importJobsQuery.refetch();
              exportJobsQuery.refetch();
            }}
          >
            Refresh Jobs
          </Button>
        }
      />

      <Tabs defaultValue="import" className="space-y-6">
        <TabsList>
          <TabsTrigger value="import">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </TabsTrigger>
          <TabsTrigger value="export">
            <Download className="h-4 w-4 mr-2" />
            Export
          </TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Import Data</CardTitle>
              <CardDescription>Upload CSV or Excel files to import data into the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Import Type</Label>
                  <Select value={importType} onValueChange={setImportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customers</SelectItem>
                      <SelectItem value="lead">Leads</SelectItem>
                      <SelectItem value="contact">Contacts</SelectItem>
                      <SelectItem value="opportunity">Opportunities</SelectItem>
                      <SelectItem value="product">Products</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Download Template</Label>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => downloadTemplate.mutate(importType)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Get Template
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Import Options</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="skipDuplicates"
                      checked={importOptions.skipDuplicates}
                      onCheckedChange={(checked) =>
                        setImportOptions({ ...importOptions, skipDuplicates: !!checked })
                      }
                    />
                    <label htmlFor="skipDuplicates" className="text-sm cursor-pointer">
                      Skip duplicate records
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="updateExisting"
                      checked={importOptions.updateExisting}
                      onCheckedChange={(checked) =>
                        setImportOptions({ ...importOptions, updateExisting: !!checked })
                      }
                    />
                    <label htmlFor="updateExisting" className="text-sm cursor-pointer">
                      Update existing records
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="validateOnly"
                      checked={importOptions.validateOnly}
                      onCheckedChange={(checked) =>
                        setImportOptions({ ...importOptions, validateOnly: !!checked })
                      }
                    />
                    <label htmlFor="validateOnly" className="text-sm cursor-pointer">
                      Validate only (don't import)
                    </label>
                  </div>
                </div>
              </div>

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                {isDragActive ? (
                  <p className="text-lg">Drop your file here...</p>
                ) : (
                  <div>
                    <p className="text-lg font-medium mb-2">Drag & drop your file here</p>
                    <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                    <p className="text-xs text-muted-foreground">Supports CSV, XLSX, XLS (max 10MB)</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Import History</CardTitle>
              <CardDescription>Track your import jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={importColumns} data={importJobs} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>Export your data in various formats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Export Type</Label>
                  <Select value={exportType} onValueChange={setExportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customers</SelectItem>
                      <SelectItem value="lead">Leads</SelectItem>
                      <SelectItem value="contact">Contacts</SelectItem>
                      <SelectItem value="opportunity">Opportunities</SelectItem>
                      <SelectItem value="product">Products</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Format</Label>
                  <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CSV">CSV</SelectItem>
                      <SelectItem value="EXCEL">Excel (XLSX)</SelectItem>
                      <SelectItem value="PDF">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleExport} disabled={exportData.isPending} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Start Export
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export History</CardTitle>
              <CardDescription>Download your previous exports</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={exportColumns} data={exportJobs} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
