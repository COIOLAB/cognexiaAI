'use client';

import { useState } from 'react';
import { Plus, Star, Eye } from 'lucide-react';
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
import { useGetReports, useGetReportTemplates, useDeleteReport } from '@/hooks/useReports';
import { ReportType, type Report } from '@/types/api.types';
import type { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { format } from 'date-fns';
import { PageHeader } from '@/components/PageHeader';
import { KpiCard } from '@/components/KpiCard';

const reportTypeColors: Record<ReportType, string> = {
  [ReportType.SALES]: 'bg-blue-500',
  [ReportType.MARKETING]: 'bg-purple-500',
  [ReportType.SUPPORT]: 'bg-green-500',
  [ReportType.PIPELINE]: 'bg-orange-500',
  [ReportType.CUSTOM]: 'bg-gray-500',
};

export default function ReportsPage() {
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const { data: reportsData, isLoading } = useGetReports();
  const { data: templatesData } = useGetReportTemplates();
  const deleteReport = useDeleteReport();

  const reports = reportsData?.data || [];
  const templates = templatesData?.data || [];
  const favoriteCount = reports.filter((report) => report.isFavorite).length;
  const latestReport = reports[0];

  const filteredReports =
    typeFilter === 'all'
      ? reports
      : reports.filter((r) => r.reportType === typeFilter);

  const columns: ColumnDef<Report>[] = [
    {
      accessorKey: 'name',
      header: 'Report Name',
      cell: ({ row }) => (
        <Link
          href={`/reports/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: 'reportType',
      header: 'Type',
      cell: ({ row }) => (
        <Badge className={reportTypeColors[row.original.reportType]}>
          {row.original.reportType}
        </Badge>
      ),
    },
    {
      accessorKey: 'chartType',
      header: 'Chart Type',
      cell: ({ row }) => (
        <span className="capitalize">{row.original.chartType}</span>
      ),
    },
    {
      accessorKey: 'viewCount',
      header: 'Views',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Eye className="h-4 w-4 text-muted-foreground" />
          {row.original.viewCount}
        </div>
      ),
    },
    {
      accessorKey: 'isFavorite',
      header: 'Favorite',
      cell: ({ row }) =>
        row.original.isFavorite ? (
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ) : null,
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
            <Link href={`/reports/${row.original.id}`}>View</Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('Delete this report?')) {
                deleteReport.mutate(row.original.id);
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
      <PageHeader
        title="Reports"
        subtitle="Create and manage custom reports"
        actions={
          <Button asChild>
            <Link href="/reports/builder">
              <Plus className="mr-2 h-4 w-4" />
              New Report
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard title="Total Reports" value={reports.length} />
        <KpiCard title="Favorites" value={favoriteCount} />
        <KpiCard title="Templates" value={templates.length} />
        <KpiCard
          title="Latest Report"
          value={latestReport ? format(new Date(latestReport.createdAt), 'MMM dd') : '—'}
          helper={latestReport?.name}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="md:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Reports</CardTitle>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value={ReportType.SALES}>Sales</SelectItem>
                  <SelectItem value={ReportType.MARKETING}>Marketing</SelectItem>
                  <SelectItem value={ReportType.SUPPORT}>Support</SelectItem>
                  <SelectItem value={ReportType.PIPELINE}>Pipeline</SelectItem>
                  <SelectItem value={ReportType.CUSTOM}>Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={filteredReports || []}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        {/* Templates Sidebar */}
        <Card>
          <CardHeader>
            <CardTitle>Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {templates.length === 0 ? (
                <div className="text-sm text-muted-foreground">No templates yet.</div>
              ) : (
                templates.slice(0, 5).map((template) => (
                  <Link
                    key={template.id}
                    href={`/reports/${template.id}`}
                    className="block rounded-lg border p-3 hover:bg-accent"
                  >
                    <p className="text-sm font-medium">{template.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {template.reportType}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
