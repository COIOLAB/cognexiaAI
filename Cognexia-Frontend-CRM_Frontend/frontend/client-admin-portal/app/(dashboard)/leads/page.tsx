'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Plus, Download, Trash2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
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

export default function LeadsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | undefined>();
  const [sourceFilter, setSourceFilter] = useState<LeadSource | undefined>();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

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

  const columns: ColumnDef<Lead>[] = [
    {
      accessorKey: 'leadCode',
      header: 'Lead Code',
      cell: ({ row }) => (
        <span className="font-medium text-blue-600 dark:text-blue-400">
          {row.original.leadCode}
        </span>
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
              onClick={() => deleteMutation.mutate(row.original.id)}
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
      bulkDeleteMutation.mutate(selectedRows);
      setSelectedRows([]);
    }
  };

  const handleExport = () => {
    exportMutation.mutate({ status: statusFilter, source: sourceFilter, search: search || undefined });
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-600">Error loading leads: {(error as any)?.message}</p>
      </div>
    );
  }

  const leads = data?.data || [];
  const isEmpty = !isLoading && leads.length === 0 && !search && !statusFilter && !sourceFilter;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your sales leads
          </p>
        </div>
        <Button onClick={() => router.push('/leads/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Lead
        </Button>
      </div>

      {/* Stats Cards */}
      {stats?.data && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Number(stats.data.total ?? 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Qualified</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Number(stats.data.byStatus?.qualified ?? 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Number(stats.data.averageScore ?? 0).toFixed(0)}
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
                {Number(stats.data.conversionRate ?? 0).toFixed(1)}%
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
                <Select
                  value={statusFilter ?? 'all'}
                  onValueChange={(val) =>
                    setStatusFilter(val === 'all' ? undefined : (val as LeadStatus))
                  }
                >
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
                <Select
                  value={sourceFilter ?? 'all'}
                  onValueChange={(val) =>
                    setSourceFilter(val === 'all' ? undefined : (val as LeadSource))
                  }
                >
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
              onRowClick={(row) => router.push(`/leads/${row.id}`)}
              enableRowSelection
              onRowSelectionChange={(rows) => setSelectedRows(rows.map((row) => row.id))}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
