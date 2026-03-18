'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Plus, Download, Trash2, Building, DollarSign, TrendingUp } from 'lucide-react';
import { Account, AccountType, AccountStatus } from '@/types/api.types';
import {
  useAccounts,
  useAccountStats,
  useDeleteAccount,
  useBulkDeleteAccounts,
  useExportAccounts,
} from '@/hooks/useAccounts';
import { DataTable } from '@/components/DataTable';
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

const typeStyles: Record<AccountType, string> = {
  [AccountType.PROSPECT]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  [AccountType.CUSTOMER]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [AccountType.PARTNER]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  [AccountType.COMPETITOR]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  [AccountType.VENDOR]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  [AccountType.RESELLER]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
};

const statusStyles: Record<AccountStatus, string> = {
  [AccountStatus.ACTIVE]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [AccountStatus.INACTIVE]: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  [AccountStatus.POTENTIAL]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  [AccountStatus.LOST]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  [AccountStatus.CHURNED]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
};

export default function AccountsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const resolvedType = typeFilter === 'all' ? undefined : (typeFilter as AccountType);
  const resolvedStatus = statusFilter === 'all' ? undefined : (statusFilter as AccountStatus);

  const { data, error } = useAccounts({
    page: 1,
    limit: 25,
    search: search || undefined,
    type: resolvedType,
    status: resolvedStatus,
  });

  const { data: stats } = useAccountStats();
  const deleteMutation = useDeleteAccount();
  const bulkDeleteMutation = useBulkDeleteAccounts();
  const exportMutation = useExportAccounts();

  const columns: ColumnDef<Account>[] = [
    {
      accessorKey: 'accountNumber',
      header: 'Client #',
      cell: ({ row }) => (
        <span className="font-medium text-blue-600 dark:text-blue-400">
          {row.original.accountNumber}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Client Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-muted-foreground">{row.original.industry}</div>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge className={typeStyles[row.original.type]} variant="secondary">
          {row.original.type}
        </Badge>
      ),
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
      accessorKey: 'revenue',
      header: 'Revenue',
      cell: ({ row }) => (
        <span className="font-semibold">
          ${(Number(row.original.revenue ?? 0) / 1000000).toFixed(1)}M
        </span>
      ),
    },
    {
      accessorKey: 'owner',
      header: 'Owner',
      cell: ({ row }) => row.original.owner,
    },
    {
      accessorKey: 'priorityScore',
      header: 'Priority',
      cell: ({ row }) => (
        <div className="flex items-center">
          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                Number(row.original.priorityScore ?? 0) >= 75
                  ? 'bg-green-500'
                  : Number(row.original.priorityScore ?? 0) >= 50
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${Number(row.original.priorityScore ?? 0)}%` }}
            />
          </div>
          <span className="ml-2 text-sm">{Number(row.original.priorityScore ?? 0)}</span>
        </div>
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
            <DropdownMenuItem onClick={() => router.push(`/accounts/${row.original.id}`)}>
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
      type: resolvedType,
      status: resolvedStatus,
      search: search || undefined,
    });
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-600">Error loading accounts: {(error as Error)?.message}</p>
      </div>
    );
  }

  const accounts = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your business clients
          </p>
        </div>
        <Button onClick={() => router.push('/accounts/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Stats Cards */}
      {stats?.data && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Number(stats.data.total ?? 0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(Number(stats.data.totalRevenue ?? 0) / 1000000).toFixed(1)}M
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(Number(stats.data.averageRevenue ?? 0) / 1000).toFixed(0)}K
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Number(stats.data.averagePriorityScore ?? 0).toFixed(0)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-2 flex-1">
              <Input
                placeholder="Search clients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.values(AccountType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.values(AccountStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(typeFilter !== 'all' || statusFilter !== 'all') && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setTypeFilter('all');
                    setStatusFilter('all');
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
            data={accounts}
            onRowClick={(row) => router.push(`/accounts/${row.id}`)}
            enableRowSelection
            onRowSelectionChange={(rows) => setSelectedRows(rows.map((row) => row.id))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
