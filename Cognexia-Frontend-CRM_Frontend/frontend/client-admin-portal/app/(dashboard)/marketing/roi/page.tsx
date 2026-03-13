'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useROIMetrics } from '@/hooks/useMarketingAnalytics';
import { TrendingUp, Download } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { PageHeader } from '@/components/PageHeader';
import { KpiCard } from '@/components/KpiCard';
import { Skeleton } from '@/components/ui/skeleton';
import { marketingAnalyticsApi } from '@/services/marketingAnalytics.api';
import { toast } from 'sonner';

export default function ROIPage() {
  const [period, setPeriod] = useState('30d');
  const { data: roiData, isLoading } = useROIMetrics(period);

  const roi = roiData?.data || {};

  const handleExport = async () => {
    try {
      const blob = await marketingAnalyticsApi.exportAnalytics(period, 'csv');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `marketing-roi-${period}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Export downloaded');
    } catch (error) {
      toast.error('Failed to export ROI report');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marketing ROI"
        subtitle="Compare revenue and spend by channel."
        actions={
          <>
            {['30d', '90d', '1y'].map((p) => (
              <Button
                key={p}
                variant={period === p ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod(p)}
              >
                {p}
              </Button>
            ))}
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard
          title="Overall ROI"
          value={
            <span className="flex items-center gap-2">
              {roi.overallROI || 0}%
              <TrendingUp className="h-4 w-4 text-green-600" />
            </span>
          }
        />
        <KpiCard title="Revenue" value={formatCurrency(roi.revenue || 0)} />
        <KpiCard title="Cost per Acquisition" value={formatCurrency(roi.costPerAcquisition || 0)} />
        <KpiCard title="Lifetime Value" value={formatCurrency(roi.lifetimeValue || 0)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ROI by Channel</CardTitle>
        </CardHeader>
        <CardContent>
          {roi?.byChannel?.length ? (
            <div className="space-y-3">
              {roi.byChannel.map((channel: any) => (
                <div key={channel.channel} className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <div>
                    <div className="font-medium capitalize">{channel.channel}</div>
                    <div className="text-xs text-muted-foreground">
                      Spend {formatCurrency(channel.spend || 0)} • Revenue {formatCurrency(channel.revenue || 0)}
                    </div>
                  </div>
                  <div className="font-semibold">{channel.roi || 0}%</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No ROI breakdown yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
