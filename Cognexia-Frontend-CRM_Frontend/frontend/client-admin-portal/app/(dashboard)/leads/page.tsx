'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Plus, Download, Trash2, CheckCircle, RefreshCw, Upload } from 'lucide-react';
import { Lead, LeadStatus, LeadSource } from '@/types/api.types';
import { useLeads, useLeadStats, useDeleteLead, useBulkDeleteLeads, useExportLeads } from '@/hooks/useLeads';
import { DataTable } from '@/components/DataTable';
import { EmptyStateLeads } from '@/components/EmptyStates';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  createImportedId,
  ensureCsvFile,
  normalizeCsvValue,
  parseCsvNumber,
  parseCsvText,
} from '@/lib/csv-import';

const statusStyles: Record<LeadStatus, string> = {
  [LeadStatus.NEW]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  [LeadStatus.CONTACTED]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  [LeadStatus.QUALIFIED]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [LeadStatus.UNQUALIFIED]: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  [LeadStatus.CONVERTED]: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  [LeadStatus.LOST]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600 dark:text-green-400 font-semibold';
  if (score >= 60) return 'text-yellow-600 dark:text-yellow-400 font-semibold';
  if (score >= 40) return 'text-orange-600 dark:text-orange-400 font-semibold';
  return 'text-red-600 dark:text-red-400 font-semibold';
};

type LeadRow = Lead & {
  isClientImported?: boolean;
};

const leadStatusValues = new Set<LeadStatus>([
  'new',
  'contacted',
  'qualified',
  'unqualified',
  'converted',
  'lost',
]);

const leadSourceValues = new Set<LeadSource>([
  'website',
  'referral',
  'social_media',
  'email_campaign',
  'cold_call',
  'trade_show',
  'partner',
  'other',
]);

const isImportedLead = (lead: LeadRow) => lead.isClientImported === true;

const leadTemplateHeaders = [
  'first name',
  'last name',
  'email',
  'phone',
  'company',
  'title',
  'source',
  'status',
  'score',
  'assigned to',
  'budget',
  'timeline',
  'notes',
];

const leadTemplateSampleRow = [
  'John',
  'Doe',
  'john.doe@example.com',
  '+1 555 123 4567',
  'Acme Corporation',
  'Marketing Director',
  'website',
  'new',
  '72',
  'user_123',
  '25000',
  '30 days',
  'Interested in a product demo',
];

export default function LeadsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [page] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | undefined>();
  const [sourceFilter, setSourceFilter] = useState<LeadSource | undefined>();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [importedLeads, setImportedLeads] = useState<LeadRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const { data, isLoading, error } = useLeads({
    page,
    limit: 25,
    search: search || undefined,
    status: statusFilter,
    source: sourceFilter,
  });

  const { data: stats } = useLeadStats();
  const deleteMutation = useDeleteLead();
  const bulkDeleteMutation = useBulkDeleteLeads();
  const exportMutation = useExportLeads();
  const importedLeadIds = useMemo(
    () => new Set(importedLeads.map((lead) => lead.id)),
    [importedLeads]
  );
  const filteredImportedLeads = useMemo(
    () =>
      importedLeads.filter((lead) => {
        if (statusFilter && lead.status !== statusFilter) {
          return false;
        }

        if (sourceFilter && lead.source !== sourceFilter) {
          return false;
        }

        if (!search.trim()) {
          return true;
        }

        const searchValue = normalizeCsvValue(search);
        return [
          lead.fullName,
          lead.email,
          lead.company,
          lead.phone,
          lead.leadCode,
        ].some((value) => normalizeCsvValue(value).includes(searchValue));
      }),
    [importedLeads, search, sourceFilter, statusFilter]
  );
  const importedStatusCounts = importedLeads.reduce<Record<string, number>>((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {});
  const importedScoreTotal = importedLeads.reduce(
    (sum, lead) => sum + Number(lead.score ?? 0),
    0
  );
  const combinedTotalLeads = Number(stats?.data?.total ?? 0) + importedLeads.length;
  const combinedQualifiedLeads =
    Number(stats?.data?.byStatus?.qualified ?? 0) + Number(importedStatusCounts.qualified ?? 0);
  const combinedAverageScore =
    combinedTotalLeads > 0
      ? (Number(stats?.data?.averageScore ?? 0) * Number(stats?.data?.total ?? 0) +
          importedScoreTotal) /
        combinedTotalLeads
      : 0;
  const combinedConversionRate =
    combinedTotalLeads > 0
      ? ((Number(stats?.data?.byStatus?.converted ?? 0) + Number(importedStatusCounts.converted ?? 0)) /
          combinedTotalLeads) *
        100
      : 0;

  const columns: ColumnDef<LeadRow>[] = [
    {
      accessorKey: 'leadCode',
      header: 'Lead Code',
      cell: ({ row }) => (
        <div>
          <span className="font-medium text-blue-600 dark:text-blue-400">
            {row.original.leadCode}
          </span>
          {isImportedLead(row.original) && (
            <div className="text-xs text-muted-foreground">Imported from CSV</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'fullName',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.fullName}</div>
          <div className="text-sm text-muted-foreground">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: 'company',
      header: 'Company',
      cell: ({ row }) => row.original.company || '-',
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => row.original.phone || '-',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={statusStyles[row.original.status]} variant="secondary">
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'source',
      header: 'Source',
      cell: ({ row }) => (
        <span className="capitalize">{row.original.source.replace(/_/g, ' ')}</span>
      ),
    },
    {
      accessorKey: 'score',
      header: 'Score',
      cell: ({ row }) => (
        <span className={getScoreColor(Number(row.original.score ?? 0))}>
          {Number(row.original.score ?? 0)}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/leads/${row.original.id}`)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => {
                if (importedLeadIds.has(row.original.id)) {
                  setImportedLeads((currentLeads) =>
                    currentLeads.filter((lead) => lead.id !== row.original.id)
                  );
                  setSelectedRows((currentRows) =>
                    currentRows.filter((id) => id !== row.original.id)
                  );
                  toast.success('Imported lead removed');
                  return;
                }

                deleteMutation.mutate(row.original.id);
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const handleBulkDelete = () => {
    if (selectedRows.length > 0) {
      const localIds = selectedRows.filter((id) => importedLeadIds.has(id));
      const serverIds = selectedRows.filter((id) => !importedLeadIds.has(id));

      if (localIds.length > 0) {
        setImportedLeads((currentLeads) =>
          currentLeads.filter((lead) => !localIds.includes(lead.id))
        );
      }

      if (serverIds.length > 0) {
        bulkDeleteMutation.mutate(serverIds);
      } else {
        toast.success(`${localIds.length} imported lead(s) removed`);
      }

      setSelectedRows([]);
    }
  };

  const handleExport = () => {
    exportMutation.mutate({ status: statusFilter, source: sourceFilter, search: search || undefined });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadTemplate = () => {
    const escapeCsvValue = (value: string) =>
      /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

    const csv = [leadTemplateHeaders, leadTemplateSampleRow]
      .map((row) => row.map(escapeCsvValue).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = downloadUrl;
    link.download = 'leads_import_template.csv';
    link.click();
    URL.revokeObjectURL(downloadUrl);
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    try {
      ensureCsvFile(file);
      setIsImporting(true);

      const parsedRows = parseCsvText(await file.text());
      const existingEmails = new Set(importedLeads.map((lead) => normalizeCsvValue(lead.email)));
      const fetchedLeads = (data?.data || []) as LeadRow[];
      fetchedLeads.forEach((lead) => existingEmails.add(normalizeCsvValue(lead.email)));

      const duplicateRows: number[] = [];
      const newLeads: LeadRow[] = [];

      parsedRows.forEach((row, index) => {
        const firstName = row.firstname || row.first;
        const lastName = row.lastname || row.last;
        const email = row.email;

        if (!firstName || !lastName || !email) {
          throw new Error(
            `Row ${index + 2} is missing required fields. Required columns: firstName, lastName, email.`
          );
        }

        const emailKey = normalizeCsvValue(email);
        if (existingEmails.has(emailKey)) {
          duplicateRows.push(index + 2);
          return;
        }

        const source = normalizeCsvValue(row.source) as LeadSource;
        const status = normalizeCsvValue(row.status) as LeadStatus;

        existingEmails.add(emailKey);
        newLeads.push({
          id: createImportedId('lead', index),
          leadCode: row.leadcode || `LEAD-IMP-${Date.now()}-${index + 1}`,
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`.trim(),
          email,
          phone: row.phone || undefined,
          company: row.company || undefined,
          title: row.title || undefined,
          status: leadStatusValues.has(status) ? status : 'new',
          source: leadSourceValues.has(source) ? source : 'other',
          score: parseCsvNumber(row.score) ?? 0,
          qualificationStatus: row.qualificationstatus as LeadRow['qualificationStatus'],
          assignedTo: row.assignedto || undefined,
          customerId: row.customerid || undefined,
          opportunityId: row.opportunityid || undefined,
          notes: row.notes || undefined,
          budget: parseCsvNumber(row.budget),
          timeline: row.timeline || undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isClientImported: true,
        });
      });

      if (newLeads.length === 0) {
        toast.error(
          duplicateRows.length > 0
            ? `All CSV rows were duplicates. Duplicate row numbers: ${duplicateRows.join(', ')}.`
            : 'No valid leads were found in the CSV file.'
        );
        return;
      }

      setImportedLeads((currentLeads) => [...newLeads, ...currentLeads]);
      toast.success(
        `${newLeads.length} lead${newLeads.length > 1 ? 's' : ''} imported.${duplicateRows.length > 0 ? ` ${duplicateRows.length} duplicate row${duplicateRows.length > 1 ? 's were' : ' was'} skipped.` : ''}`
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to import leads.');
    } finally {
      setIsImporting(false);
    }
  };

  const leads = useMemo<LeadRow[]>(
    () => [...filteredImportedLeads, ...((data?.data || []) as LeadRow[])],
    [data?.data, filteredImportedLeads]
  );
  const isEmpty = !isLoading && leads.length === 0 && !search && !statusFilter && !sourceFilter;

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-600">
          Error loading leads: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your sales leads
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleImportFile}
          />
          <Button variant="outline" onClick={handleImportClick} disabled={isImporting}>
            <Upload className="h-4 w-4 mr-2" />
            {isImporting ? 'Importing...' : 'Import CSV'}
          </Button>
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <Button onClick={() => router.push('/leads/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats?.data && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{combinedTotalLeads}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Qualified</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {combinedQualifiedLeads}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {combinedAverageScore.toFixed(0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <RefreshCw className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {combinedConversionRate.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isEmpty ? (
        <EmptyStateLeads />
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-2 flex-1">
                <Input
                  placeholder="Search leads..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="max-w-sm"
                />
                <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as LeadStatus)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {Object.values(LeadStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sourceFilter} onValueChange={(val) => setSourceFilter(val as LeadSource)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    {Object.values(LeadSource).map((source) => (
                      <SelectItem key={source} value={source}>
                        {source.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(statusFilter || sourceFilter) && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setStatusFilter(undefined);
                      setSourceFilter(undefined);
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {selectedRows.length > 0 && (
                  <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete ({selectedRows.length})
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={leads}
              onRowClick={(row) => {
                if (!isImportedLead(row)) {
                  router.push(`/leads/${row.id}`);
                }
              }}
              enableRowSelection
              onRowSelectionChange={(rows) => setSelectedRows(rows.map((row) => row.id))}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
