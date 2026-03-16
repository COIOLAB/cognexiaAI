'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Plus, Package, XCircle } from 'lucide-react';
import { useOrders, useOrderStats } from '@/hooks/useOrders';
import { SalesOrder, OrderStatus } from '@/types/api.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/ui/data-table';
import { PageHeader } from '@/components/PageHeader';
import { KpiCard } from '@/components/KpiCard';

const statusStyles: Record<OrderStatus, string> = {
  [OrderStatus.DRAFT]: 'bg-gray-100 text-gray-800',
  [OrderStatus.CONFIRMED]: 'bg-blue-100 text-blue-800',
  [OrderStatus.PROCESSING]: 'bg-purple-100 text-purple-800',
  [OrderStatus.SHIPPED]: 'bg-green-100 text-green-800',
  [OrderStatus.DELIVERED]: 'bg-emerald-100 text-emerald-800',
  [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800',
};

export default function OrdersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  
  const filters = {
    page,
    limit: 20,
    ...(status !== 'all' && { status }),
    ...(search && { search }),
  };

  const { data: ordersData, isLoading } = useOrders(filters);
  const { data: statsData } = useOrderStats();

  const columns: ColumnDef<SalesOrder>[] = [
    {
      accessorKey: 'orderNumber',
      header: 'Order #',
      cell: ({ row }) => <div className="font-medium">{row.getValue('orderNumber')}</div>,
    },
    {
      accessorKey: 'customerName',
      header: 'Customer',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as OrderStatus;
        return <Badge className={statusStyles[status]} variant="secondary">{status}</Badge>;
      },
    },
    {
      accessorKey: 'orderDate',
      header: 'Order Date',
      cell: ({ row }) => new Date(row.getValue('orderDate')).toLocaleDateString(),
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total',
      cell: ({ row }) => (
        <div className="font-semibold">
          ${Number(row.getValue('totalAmount') ?? 0).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: 'salesRep',
      header: 'Sales Rep',
      cell: ({ row }) => (row.getValue('salesRep') as any).name,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => router.push(`/sales/orders/${row.original.id}`)}>
              <Package className="mr-2 h-4 w-4" />View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const stats = statsData?.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Orders"
        subtitle="Track and manage sales orders"
        actions={
          <Button onClick={() => router.push('/sales/orders/new')}>
            <Plus className="mr-2 h-4 w-4" />New Order
          </Button>
        }
      />

      {stats && (
        <div className="grid gap-6 md:grid-cols-4">
          <KpiCard title="Total Orders" value={Number(stats.totalOrders ?? 0)} />
          <KpiCard
            title="Total Value"
            value={`$${(Number(stats.totalValue ?? 0) / 1000000).toFixed(2)}M`}
          />
          <KpiCard
            title="Avg Order Value"
            value={`$${Number(stats.avgOrderValue ?? 0).toLocaleString()}`}
          />
          <KpiCard
            title="Processing"
            value={
              <span className="text-purple-600">
                {Number(stats.statusBreakdown?.[OrderStatus.PROCESSING] ?? 0)}
              </span>
            }
          />
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 mb-4">
            <Input placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
            <Select value={status} onValueChange={(value) => setStatus(value as OrderStatus | 'all')}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={OrderStatus.CONFIRMED}>Confirmed</SelectItem>
                <SelectItem value={OrderStatus.PROCESSING}>Processing</SelectItem>
                <SelectItem value={OrderStatus.SHIPPED}>Shipped</SelectItem>
                <SelectItem value={OrderStatus.DELIVERED}>Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DataTable columns={columns} data={ordersData?.data || []} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
