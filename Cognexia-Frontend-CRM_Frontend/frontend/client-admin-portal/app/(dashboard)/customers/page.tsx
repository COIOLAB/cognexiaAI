'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import {
  Building2,
  Download,
  Filter,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DataTable,
  DataTableColumnHeader,
  DataTableRowActions,
} from '@/components/DataTable';
import {
  useCustomers,
  useCustomerStats,
  useDeleteCustomer,
  useBulkDeleteCustomers,
  useExportCustomers,
} from '@/hooks/useCustomers';
import type { Customer, CustomerFilters } from '@/types/api.types';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function CustomersPage() {
  const router = useRouter();
  const [selectedCustomers, setSelectedCustomers] = React.useState<Customer[]>([]);
  const [filters, setFilters] = React.useState<CustomerFilters>({
    page: 1,
    limit: 20,
  });

  const { data: customersData, isLoading } = useCustomers(filters);
  const { data: statsData } = useCustomerStats();
  const deleteMutation = useDeleteCustomer();
  const bulkDelete = useBulkDeleteCustomers();
  const exportMutation = useExportCustomers();

  const customers = customersData?.data?.customers || [];
  const stats = statsData?.data;

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: 'customerCode',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.original.customerCode}</div>
      ),
    },
    {
      accessorKey: 'companyName',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Company Name" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.companyName}</span>
        </div>
      ),
    },
    {
      accessorKey: 'customerType',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.customerType}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const status = row.original.status;
        const variant =
          status === 'active'
            ? 'default'
            : status === 'inactive'
            ? 'secondary'
            : status === 'prospect'
            ? 'outline'
            : 'destructive';

        return (
          <Badge variant={variant} className="capitalize">
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'industry',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Industry" />,
      cell: ({ row }) => <div className="capitalize">{row.original.industry}</div>,
    },
    {
      accessorKey: 'segmentation.tier',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tier" />,
      cell: ({ row }) => {
        const tier = row.original.segmentation.tier;
        return (
          <Badge
            variant="outline"
            className={`capitalize ${
              tier === 'platinum' || tier === 'diamond'
                ? 'border-yellow-600 text-yellow-600'
                : tier === 'gold'
                ? 'border-orange-600 text-orange-600'
                : ''
            }`}
          >
            {tier}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'salesMetrics.totalRevenue',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Revenue" />,
      cell: ({ row }) => {
        const revenue = row.original.salesMetrics.totalRevenue;
        return (
          <div className="font-medium">
            ${Number(revenue ?? 0).toLocaleString()}
          </div>
        );
      },
    },
    {
      accessorKey: 'relationshipMetrics.lastInteractionDate',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Last Contact" />,
      cell: ({ row }) => {
        const date = row.original.relationshipMetrics.lastInteractionDate;
        if (!date) return <span className="text-muted-foreground">Never</span>;
        return (
          <div className="text-sm">
            {format(new Date(date), 'MMM d, yyyy')}
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DataTableRowActions
          onView={() => router.push(`/customers/${row.original.id}`)}
          onEdit={() => router.push(`/customers/${row.original.id}/edit`)}
          onDelete={() => handleDeleteCustomer(row.original.id)}
        />
      ),
    },
  ];

  const handleDeleteCustomer = (id: string) => {
    const customer = customers.find((c) => c.id === id);
    if (confirm(`Are you sure you want to delete ${customer?.companyName || 'this customer'}? This action cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleBulkDelete = () => {
    if (selectedCustomers.length === 0) {
      toast.error('No customers selected');
      return;
    }

    if (
      confirm(
        `Are you sure you want to delete ${selectedCustomers.length} customer(s)? This action cannot be undone.`
      )
    ) {
      const ids = selectedCustomers.map((c) => c.id);
      bulkDelete.mutate(ids, {
        onSuccess: () => {
          setSelectedCustomers([]);
        },
      });
    }
  };

  const handleExport = (format: 'csv' | 'excel' = 'csv') => {
    exportMutation.mutate({ filters, format });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customer relationships and track interactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => router.push('/customers/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Number(stats.totalCustomers ?? 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {Number(stats.activeCustomers ?? 0).toLocaleString()} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New This Month</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Number(stats.newThisMonth ?? 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {Number(stats.churnRate ?? 0).toFixed(1)}% churn rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Revenue</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${Number(stats.averageRevenue ?? 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">per customer</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Tier</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Number(stats.tierDistribution?.platinum ?? 0)}
              </div>
              <p className="text-xs text-muted-foreground">platinum customers</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedCustomers.length > 0 && (
        <Card className="border-primary">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {selectedCustomers.length} customer(s) selected
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={bulkDelete.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCustomers([])}
            >
              Clear Selection
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
          <CardDescription>
            A list of all customers with their key metrics and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={customers}
            searchKey="companyName"
            searchPlaceholder="Search customers..."
            onRowClick={(customer) => router.push(`/customers/${customer.id}`)}
            enableRowSelection
            onRowSelectionChange={setSelectedCustomers}
            pageSize={filters.limit}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
