'use client';

import { useState } from 'react';
import { Plus, Star, Eye, Users, Lock } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetDashboards, useDeleteDashboard } from '@/hooks/useDashboards';
import { DashboardType, type Dashboard } from '@/types/api.types';
import type { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { format } from 'date-fns';

const dashboardTypeColors: Record<DashboardType, string> = {
  [DashboardType.PERSONAL]: 'bg-blue-500',
  [DashboardType.TEAM]: 'bg-green-500',
  [DashboardType.ORGANIZATIONAL]: 'bg-purple-500',
  [DashboardType.EXECUTIVE]: 'bg-red-500',
};

const dashboardTypeLabels: Record<DashboardType, string> = {
  [DashboardType.PERSONAL]: 'Personal',
  [DashboardType.TEAM]: 'Team',
  [DashboardType.ORGANIZATIONAL]: 'Organizational',
  [DashboardType.EXECUTIVE]: 'Executive',
};

export default function DashboardsPage() {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all');

  const { data: dashboardsData, isLoading } = useGetDashboards();
  const deleteDashboard = useDeleteDashboard();

  const filteredDashboards = dashboardsData?.data?.filter((d) => {
    const matchesType = typeFilter === 'all' || d.type === typeFilter;
    const matchesVisibility =
      visibilityFilter === 'all' ||
      (visibilityFilter === 'public' && d.isPublic) ||
      (visibilityFilter === 'private' && !d.isPublic);
    return matchesType && matchesVisibility;
  });

  const columns: ColumnDef<Dashboard>[] = [
    {
      accessorKey: 'name',
      header: 'Dashboard Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboards/${row.original.id}`}
            className="font-medium hover:underline"
          >
            {row.original.name}
          </Link>
          {row.original.isDefault && (
            <Badge variant="outline" className="text-xs">
              Default
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge className={dashboardTypeColors[row.original.type]}>
          {dashboardTypeLabels[row.original.type]}
        </Badge>
      ),
    },
    {
      accessorKey: 'widgets',
      header: 'Widgets',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Eye className="h-4 w-4 text-muted-foreground" />
          {row.original.widgets.length}
        </div>
      ),
    },
    {
      accessorKey: 'isPublic',
      header: 'Visibility',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {row.original.isPublic ? (
            <>
              <Users className="h-4 w-4 text-green-500" />
              <span className="text-sm">Public</span>
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Private</span>
            </>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'tags',
      header: 'Tags',
      cell: ({ row }) =>
        row.original.tags && row.original.tags.length > 0 ? (
          <div className="flex gap-1">
            {row.original.tags.slice(0, 2).map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {row.original.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{row.original.tags.length - 2}
              </Badge>
            )}
          </div>
        ) : (
          '-'
        ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) =>
        format(new Date(row.original.createdAt), 'MMM dd, yyyy'),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboards/${row.original.id}`}>View</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboards/builder?id=${row.original.id}`}>Edit</Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('Delete this dashboard?')) {
                deleteDashboard.mutate(row.original.id);
              }
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboards</h1>
          <p className="text-muted-foreground">
            Create and manage custom dashboards
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboards/builder">
            <Plus className="mr-2 h-4 w-4" />
            New Dashboard
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Dashboards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardsData?.data?.length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Personal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardsData?.data?.filter(
                (d) => d.type === DashboardType.PERSONAL
              ).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardsData?.data?.filter((d) => d.type === DashboardType.TEAM)
                .length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Public
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardsData?.data?.filter((d) => d.isPublic).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dashboards Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Dashboards</CardTitle>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value={DashboardType.PERSONAL}>Personal</SelectItem>
                  <SelectItem value={DashboardType.TEAM}>Team</SelectItem>
                  <SelectItem value={DashboardType.ORGANIZATIONAL}>
                    Organizational
                  </SelectItem>
                  <SelectItem value={DashboardType.EXECUTIVE}>
                    Executive
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={visibilityFilter}
                onValueChange={setVisibilityFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredDashboards || []}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
