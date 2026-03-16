'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Plus, Download, Trash2, TrendingUp, DollarSign, Target } from 'lucide-react';
import { Opportunity, OpportunityStage, OpportunityStatus } from '@/types/api.types';
import {
  useOpportunities,
  useOpportunityStats,
  useDeleteOpportunity,
  useBulkDeleteOpportunities,
  useExportOpportunities,
} from '@/hooks/useOpportunities';
import { DataTable } from '@/components/DataTable';
import { EmptyStateOpportunities } from '@/components/EmptyStates';
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

const stageStyles: Record<OpportunityStage, string> = {
  [OpportunityStage.PROSPECTING]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  [OpportunityStage.QUALIFICATION]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  [OpportunityStage.PROPOSAL]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  [OpportunityStage.NEGOTIATION]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  [OpportunityStage.CLOSED_WON]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [OpportunityStage.CLOSED_LOST]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export default function OpportunitiesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<OpportunityStage | undefined>();
  const [statusFilter, setStatusFilter] = useState<OpportunityStatus | undefined>();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const { data, isLoading, error } = useOpportunities({
    page,
    limit: 25,
    search: search || undefined,
    stage: stageFilter,
    status: statusFilter,
  });

  const { data: stats } = useOpportunityStats();
  const deleteMutation = useDeleteOpportunity();
  const bulkDeleteMutation = useBulkDeleteOpportunities();
  const exportMutation = useExportOpportunities();

  const columns: ColumnDef<Opportunity>[] = [
    {
      accessorKey: 'opportunityCode',
      header: 'Opportunity Code',
      cell: ({ row }) => (
        <span className="font-medium text-blue-600 dark:text-blue-400">
          {row.original.opportunityNumber}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          {row.original.description && (
            <div className="text-sm text-muted-foreground truncate max-w-xs">
              {row.original.description}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <span className="font-semibold">
          ${(Number(row.original.amount ?? 0)).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'probability',
      header: 'Probability',
      cell: ({ row }) => <span>{row.original.probability}%</span>,
    },
    {
      accessorKey: 'weightedValue',
      header: 'Weighted Value',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          ${(Number(row.original.weightedValue ?? 0)).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'stage',
      header: 'Stage',
      cell: ({ row }) => (
        <Badge className={stageStyles[row.original.stage]} variant="secondary">
          {row.original.stage.replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      accessorKey: 'expectedCloseDate',
      header: 'Expected Close',
      cell: ({ row }) => new Date(row.original.expectedCloseDate).toLocaleDateString(),
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
            <DropdownMenuItem onClick={() => router.push(`/opportunities/${row.original.id}`)}>
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
    exportMutation.mutate({
      stage: stageFilter,
      status: statusFilter,
      search: search || undefined,
    });
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-600">Error loading opportunities: {(error as any)?.message}</p>
      </div>
    );
  }

  const opportunities = data?.data || [];
  const isEmpty = !isLoading && opportunities.length === 0 && !search && !stageFilter && !statusFilter;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Opportunities</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your sales opportunities
          </p>
        </div>
        <Button onClick={() => router.push('/opportunities/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Opportunity
        </Button>
      </div>

      {/* Stats Cards */}
      {stats?.data && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Opportunities</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.data.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(stats.data.totalValue / 1000000).toFixed(1)}M
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weighted Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(stats.data.totalWeightedValue / 1000000).toFixed(1)}M
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.data.winRate?.toFixed(1) || 0}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {isEmpty ? (
        <EmptyStateOpportunities />
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-2 flex-1">
                <Input
                  placeholder="Search opportunities..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="max-w-sm"
                />
                <Select
                  value={stageFilter}
                  onValueChange={(val) => setStageFilter(val as OpportunityStage)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    {Object.values(OpportunityStage).map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={statusFilter}
                  onValueChange={(val) => setStatusFilter(val as OpportunityStatus)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {Object.values(OpportunityStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(stageFilter || statusFilter) && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setStageFilter(undefined);
                      setStatusFilter(undefined);
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
              data={opportunities}
              onRowClick={(row) => router.push(`/opportunities/${row.id}`)}
              enableRowSelection
              onRowSelectionChange={(rows) => setSelectedRows(rows.map((row) => row.id))}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
