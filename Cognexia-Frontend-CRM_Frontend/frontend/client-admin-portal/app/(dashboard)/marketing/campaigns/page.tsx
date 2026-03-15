'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/data-table';
import { PageHeader } from '@/components/PageHeader';
import { KpiCard } from '@/components/KpiCard';
import { useGetCampaigns, useCampaignStats, useDeleteCampaign, useActivateCampaign, usePauseCampaign } from '@/hooks/useCampaigns';
import { Plus, Download, MoreHorizontal, Play, Pause, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { CampaignStatus, CampaignType } from '@/types/api.types';
import type { ColumnDef } from '@tanstack/react-table';
import { campaignApi } from '@/services/campaign.api';
import { toast } from 'sonner';

export default function CampaignsPage() {
  const [filters, setFilters] = useState({});
  const { data: campaignsData, isLoading } = useGetCampaigns(filters);
  const { data: statsData } = useCampaignStats();
  const deleteCampaign = useDeleteCampaign();
  const activateCampaign = useActivateCampaign();
  const pauseCampaign = usePauseCampaign();

  const campaigns = Array.isArray(campaignsData?.data) ? campaignsData.data : (campaignsData?.data?.campaigns || []);
  const stats = statsData?.data || {
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalBudget: 0,
    avgROI: 0,
  };

  const getStatusColor = (status: CampaignStatus): "default" | "destructive" | "outline" | "secondary" => {
    const colors: Record<CampaignStatus, "default" | "destructive" | "outline" | "secondary"> = {
      draft: 'secondary',
      scheduled: 'default',
      active: 'default',
      paused: 'secondary',
      completed: 'secondary',
      cancelled: 'destructive',
    };
    return colors[status] || 'secondary';
  };

  const handleExport = async () => {
    try {
      const blob = await campaignApi.exportCampaigns(filters as any, 'csv');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'marketing-campaigns.csv';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Export downloaded');
    } catch (error) {
      toast.error('Failed to export campaigns');
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'name',
      header: 'Campaign Name',
      cell: ({ row }) => (
        <Link
          href={`/marketing/campaigns/${row.original.id}`}
          className="font-medium hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <span className="capitalize">{row.original.type.replace('_', ' ')}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={getStatusColor(row.original.status)}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'startDate',
      header: 'Start Date',
      cell: ({ row }) => new Date(row.original.startDate).toLocaleDateString(),
    },
    {
      accessorKey: 'endDate',
      header: 'End Date',
      cell: ({ row }) => new Date(row.original.endDate).toLocaleDateString(),
    },
    {
      accessorKey: 'budget',
      header: 'Budget',
      cell: ({ row }) => formatCurrency(row.original.budget),
    },
    {
      accessorKey: 'spent',
      header: 'Spent',
      cell: ({ row }) => formatCurrency(row.original.spent),
    },
    {
      accessorKey: 'performance',
      header: 'ROI',
      cell: ({ row }) => `${row.original.performance?.roi || 0}%`,
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
            <DropdownMenuItem asChild>
              <Link href={`/marketing/campaigns/${row.original.id}`}>View Details</Link>
            </DropdownMenuItem>
            {row.original.status === 'draft' && (
              <DropdownMenuItem onClick={() => activateCampaign.mutate(row.original.id)}>
                <Play className="mr-2 h-4 w-4" />
                Activate
              </DropdownMenuItem>
            )}
            {row.original.status === 'active' && (
              <DropdownMenuItem onClick={() => pauseCampaign.mutate(row.original.id)}>
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => deleteCampaign.mutate(row.original.id)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaigns"
        subtitle="Manage your marketing campaigns"
        actions={
          <>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button asChild>
              <Link href="/marketing/campaigns/new">
                <Plus className="mr-2 h-4 w-4" />
                New Campaign
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard title="Total Campaigns" value={formatNumber(stats.totalCampaigns)} />
        <KpiCard title="Active Campaigns" value={formatNumber(stats.activeCampaigns)} />
        <KpiCard title="Total Budget" value={formatCurrency(stats.totalBudget)} />
        <KpiCard title="Average ROI" value={`${stats.avgROI}%`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 && !isLoading ? (
            <div className="text-sm text-muted-foreground">No campaigns yet.</div>
          ) : (
            <DataTable columns={columns} data={campaigns} isLoading={isLoading} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
