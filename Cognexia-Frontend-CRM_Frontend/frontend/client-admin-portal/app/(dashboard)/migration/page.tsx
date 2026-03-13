'use client';

import { useState } from 'react';
import { Plus, Upload, RefreshCw, Database, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  useCancelMigrationJob,
  useGetSupportedEntities,
  useListMigrationJobs,
  useSyncFromERP,
  useSyncFromHubSpot,
  useSyncFromOracle,
  useSyncFromSAP,
  useSyncFromSalesforce,
  useSyncFromZoho,
} from '@/hooks/useMigration';
import { DataTable } from '@/components/ui/data-table';
import Link from 'next/link';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500',
  PROCESSING: 'bg-blue-500',
  COMPLETED: 'bg-green-500',
  FAILED: 'bg-red-500',
  PAUSED: 'bg-gray-500',
};

export default function MigrationPage() {
  const { data: jobs, isLoading } = useListMigrationJobs();
  const cancelJob = useCancelMigrationJob();
  const { data: supportedEntities } = useGetSupportedEntities();
  const syncSalesforce = useSyncFromSalesforce();
  const syncHubSpot = useSyncFromHubSpot();
  const syncZoho = useSyncFromZoho();
  const syncERP = useSyncFromERP();
  const syncSAP = useSyncFromSAP();
  const syncOracle = useSyncFromOracle();

  const [syncOpen, setSyncOpen] = useState(false);
  const [syncCategory, setSyncCategory] = useState<'CRM' | 'ERP'>('CRM');
  const [syncProvider, setSyncProvider] = useState('salesforce');
  const [connectionId, setConnectionId] = useState('');
  const [targetEntity, setTargetEntity] = useState('');
  const [syncOptions, setSyncOptions] = useState({
    skipDuplicates: true,
    updateExisting: false,
    validateOnly: false,
  });

  const columns = [
    {
      accessorKey: 'jobName',
      header: 'Job Name',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.original.jobName}</div>
          <div className="text-sm text-muted-foreground">{row.original.targetEntity}</div>
        </div>
      ),
    },
    {
      accessorKey: 'migrationType',
      header: 'Type',
      cell: ({ row }: any) => (
        <Badge variant="outline">{row.original.migrationType.replace('_', ' ')}</Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => (
        <Badge className={statusColors[row.original.status]}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'progress',
      header: 'Progress',
      cell: ({ row }: any) => {
        const processed = row.original.processedRecords || 0;
        const total = row.original.totalRecords || 0;
        const percent = total > 0 ? Math.round((processed / total) * 100) : 0;
        return (
          <div className="space-y-1">
            <div className="text-sm">{processed} / {total}</div>
            <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }: any) => format(new Date(row.original.createdAt), 'MMM dd, HH:mm'),
    },
    {
      id: 'actions',
      cell: ({ row }: any) => (
        <div className="flex gap-2">
          {(row.original.status === 'PROCESSING' || row.original.status === 'PENDING') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => cancelJob.mutate(row.original.id)}
            >
              Cancel
            </Button>
          )}
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/migration/jobs/${row.original.id}`}>View</Link>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Migration</h1>
          <p className="text-muted-foreground">
            Import data from files or sync from external systems
          </p>
        </div>
        <Button asChild>
          <Link href="/migration/import">
            <Plus className="mr-2 h-4 w-4" />
            New Migration
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {jobs?.filter(j => j.status === 'PROCESSING' || j.status === 'PENDING').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {jobs?.filter(j => j.status === 'COMPLETED').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {jobs?.filter(j => j.status === 'FAILED').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/migration/import" className="block">
          <Card className="cursor-pointer hover:bg-accent">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Upload className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Import from File</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload CSV or Excel files
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Card
          className="cursor-pointer hover:bg-accent"
          onClick={() => {
            setSyncCategory('CRM');
            setSyncProvider('salesforce');
            setSyncOpen(true);
          }}
        >
          <CardHeader>
            <div className="flex items-center gap-4">
              <Cloud className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Sync from CRM</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Salesforce, HubSpot, etc.
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card
          className="cursor-pointer hover:bg-accent"
          onClick={() => {
            setSyncCategory('ERP');
            setSyncProvider('erp');
            setSyncOpen(true);
          }}
        >
          <CardHeader>
            <div className="flex items-center gap-4">
              <Database className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Sync from ERP</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  SAP, Oracle, custom systems
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Migration Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={jobs || []} isLoading={isLoading} />
        </CardContent>
      </Card>

      <Dialog open={syncOpen} onOpenChange={setSyncOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {syncCategory === 'CRM' ? 'Sync from CRM' : 'Sync from ERP'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Provider</label>
              <Select value={syncProvider} onValueChange={setSyncProvider}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {syncCategory === 'CRM' ? (
                    <>
                      <SelectItem value="salesforce">Salesforce</SelectItem>
                      <SelectItem value="hubspot">HubSpot</SelectItem>
                      <SelectItem value="zoho">Zoho</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="erp">ERP (Generic)</SelectItem>
                      <SelectItem value="sap">SAP</SelectItem>
                      <SelectItem value="oracle">Oracle</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Connection ID</label>
              <Input
                value={connectionId}
                onChange={(event) => setConnectionId(event.target.value)}
                placeholder="connection-id"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Target Entity</label>
              <Select value={targetEntity} onValueChange={setTargetEntity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select entity" />
                </SelectTrigger>
                <SelectContent>
                  {(supportedEntities || ['customer', 'lead', 'contact', 'opportunity', 'product']).map(
                    (entity: string) => (
                      <SelectItem key={entity} value={entity}>
                        {entity}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Options</div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="sync-skip-duplicates"
                  checked={syncOptions.skipDuplicates}
                  onCheckedChange={(checked) =>
                    setSyncOptions((prev) => ({ ...prev, skipDuplicates: !!checked }))
                  }
                />
                <label htmlFor="sync-skip-duplicates" className="text-sm">
                  Skip duplicates
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="sync-update-existing"
                  checked={syncOptions.updateExisting}
                  onCheckedChange={(checked) =>
                    setSyncOptions((prev) => ({ ...prev, updateExisting: !!checked }))
                  }
                />
                <label htmlFor="sync-update-existing" className="text-sm">
                  Update existing records
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="sync-validate-only"
                  checked={syncOptions.validateOnly}
                  onCheckedChange={(checked) =>
                    setSyncOptions((prev) => ({ ...prev, validateOnly: !!checked }))
                  }
                />
                <label htmlFor="sync-validate-only" className="text-sm">
                  Validate only
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSyncOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!connectionId || !targetEntity) return;
                const payload = { connectionId, targetEntity, options: syncOptions };
                const onDone = () => setSyncOpen(false);
                if (syncProvider === 'salesforce') {
                  syncSalesforce.mutate(payload, { onSuccess: onDone });
                } else if (syncProvider === 'hubspot') {
                  syncHubSpot.mutate(payload, { onSuccess: onDone });
                } else if (syncProvider === 'zoho') {
                  syncZoho.mutate(payload, { onSuccess: onDone });
                } else if (syncProvider === 'sap') {
                  syncSAP.mutate(payload, { onSuccess: onDone });
                } else if (syncProvider === 'oracle') {
                  syncOracle.mutate(payload, { onSuccess: onDone });
                } else {
                  syncERP.mutate(payload, { onSuccess: onDone });
                }
              }}
              disabled={
                !connectionId ||
                !targetEntity ||
                syncSalesforce.isPending ||
                syncHubSpot.isPending ||
                syncZoho.isPending ||
                syncERP.isPending ||
                syncSAP.isPending ||
                syncOracle.isPending
              }
            >
              Start Sync
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
