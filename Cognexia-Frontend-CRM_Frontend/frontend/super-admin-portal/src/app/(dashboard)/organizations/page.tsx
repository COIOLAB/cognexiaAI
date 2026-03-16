'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useOrganizations, useSuspendOrganization, useActivateOrganization, useDeleteOrganization } from '@/hooks/use-organizations';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Eye, Ban, CheckCircle, Trash2, Plus, Download } from 'lucide-react';
import { getStatusColor } from '@/lib/utils';
import { OrganizationStatus } from '@/types/organization';

export default function OrganizationsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  const { data, isLoading } = useOrganizations({
    page,
    limit: 200,
    search,
    status: statusFilter,
  });

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);
  
  const suspendOrg = useSuspendOrganization();
  const activateOrg = useActivateOrganization();
  const deleteOrg = useDeleteOrganization();

  const handleSuspend = async (id: string) => {
    if (confirm('Are you sure you want to suspend this organization?')) {
      await suspendOrg.mutateAsync(id);
    }
  };

  const handleActivate = async (id: string) => {
    await activateOrg.mutateAsync(id);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      await deleteOrg.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Organizations</h1>
          <p className="text-gray-500">Manage all organizations in the platform</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken');
              const params = new URLSearchParams();
              if (statusFilter) params.set('status', statusFilter);
              if (search) params.set('search', search);
              const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1'}/organizations/export?${params}`;
              const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
              const blob = await res.blob();
              const a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = `organizations-${new Date().toISOString().slice(0, 10)}.csv`;
              a.click();
              URL.revokeObjectURL(a.href);
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Link href="/organizations/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Organization
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search organizations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">All Status</option>
          <option value={OrganizationStatus.ACTIVE}>Active</option>
          <option value={OrganizationStatus.TRIAL}>Trial</option>
          <option value={OrganizationStatus.SUSPENDED}>Suspended</option>
          <option value={OrganizationStatus.CANCELLED}>Canceled</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((org) => (
              <TableRow key={org.id} className="cursor-pointer hover:bg-gray-50">
                <TableCell className="font-medium">
                  <Link href={`/organizations/${org.id}`} className="hover:underline">
                    {org.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p>{org.owner?.name}</p>
                    <p className="text-gray-500">{org.owner?.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(org.status)}>
                    {org.status}
                  </Badge>
                </TableCell>
                <TableCell>{org.subscriptionPlan?.name || 'N/A'}</TableCell>
                <TableCell>
                  {org.userCount || 0} / {org.maxUsers || '∞'}
                </TableCell>
                <TableCell>
                  {new Date(org.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/organizations/${org.id}`}>
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    
                    {org.status === OrganizationStatus.ACTIVE ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSuspend(org.id)}
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleActivate(org.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(org.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {data.data.length} of {data.total} organizations
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={!data.hasPrevious}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={!data.hasNext}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

