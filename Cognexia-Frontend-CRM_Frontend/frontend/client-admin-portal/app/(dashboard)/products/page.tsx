'use client';

import { useState } from 'react';
import { Plus, Package } from 'lucide-react';
import { useGetProducts } from '@/hooks/useProducts';
import { useGetCategories } from '@/hooks/useCategories';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ProductStatus, ProductType } from '@/types/api.types';
import type { Product } from '@/types/api.types';
import type { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';

export default function ProductsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const { data: products, isLoading } = useGetProducts();
  const { data: categories } = useGetCategories();

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'sku',
      header: 'SKU',
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.original.sku}</div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Product Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          {row.original.shortDescription && (
            <div className="text-sm text-muted-foreground line-clamp-1">
              {row.original.shortDescription}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge
            variant={
              status === ProductStatus.ACTIVE
                ? 'default'
                : status === ProductStatus.OUT_OF_STOCK
                ? 'destructive'
                : 'secondary'
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'basePrice',
      header: 'Price',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">
            {row.original.currency} {Number(row.original.basePrice).toFixed(2)}
          </div>
          {row.original.isOnSale && row.original.salePrice && (
            <div className="text-sm text-green-600">
              Sale: {row.original.currency} {Number(row.original.salePrice).toFixed(2)}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'quantityInStock',
      header: 'Stock',
      cell: ({ row }) => {
        const available = row.original.quantityInStock - row.original.quantityReserved;
        const isLowStock = available <= row.original.lowStockThreshold;
        return (
          <div>
            <div className={isLowStock ? 'text-orange-600 font-medium' : ''}>
              {available} available
            </div>
            {row.original.quantityReserved > 0 && (
              <div className="text-sm text-muted-foreground">
                {row.original.quantityReserved} reserved
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" asChild>
          <a href={`/products/${row.original.id}`}>View</a>
        </Button>
      ),
    },
  ];

  const filteredProducts = products?.filter((product) => {
    if (statusFilter !== 'all' && product.status !== statusFilter) return false;
    if (typeFilter !== 'all' && product.type !== typeFilter) return false;
    if (search && !product.name.toLowerCase().includes(search.toLowerCase()) && !product.sku.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: products?.length || 0,
    active: products?.filter(p => p.status === ProductStatus.ACTIVE).length || 0,
    lowStock: products?.filter(p => (p.quantityInStock - p.quantityReserved) <= p.lowStockThreshold).length || 0,
    outOfStock: products?.filter(p => p.status === ProductStatus.OUT_OF_STOCK).length || 0,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        subtitle="Manage your product catalog"
        actions={
          <Button asChild>
            <Link href="/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.lowStock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="md:w-96"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={ProductStatus.ACTIVE}>Active</SelectItem>
                <SelectItem value={ProductStatus.INACTIVE}>Inactive</SelectItem>
                <SelectItem value={ProductStatus.OUT_OF_STOCK}>Out of Stock</SelectItem>
                <SelectItem value={ProductStatus.DISCONTINUED}>Discontinued</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="md:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value={ProductType.PHYSICAL}>Physical</SelectItem>
                <SelectItem value={ProductType.DIGITAL}>Digital</SelectItem>
                <SelectItem value={ProductType.SERVICE}>Service</SelectItem>
                <SelectItem value={ProductType.SUBSCRIPTION}>Subscription</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredProducts || []}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
