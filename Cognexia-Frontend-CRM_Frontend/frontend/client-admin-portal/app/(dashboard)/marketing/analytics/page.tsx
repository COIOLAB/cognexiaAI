'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMarketingAnalytics } from '@/hooks/useMarketingAnalytics';
import { TrendingUp, TrendingDown, Download } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { PageHeader } from '@/components/PageHeader';
import { KpiCard } from '@/components/KpiCard';
import { Skeleton } from '@/components/ui/skeleton';
import { marketingAnalyticsApi } from '@/services/marketingAnalytics.api';
import { toast } from 'sonner';

export default function MarketingAnalyticsPage() {
  const [period, setPeriod] = useState('30d');
  const { data: analyticsData, isLoading } = useMarketingAnalytics(period);

  const analytics = analyticsData?.data || null;
  const kpis = analytics?.kpis || {
    totalCampaigns: 0,
    totalSpent: 0,
    totalRevenue: 0,
    avgROI: 0,
    emailsSent: 0,
    conversionRate: 0,
  };

  const periods = [
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: '90 Days', value: '90d' },
    { label: '1 Year', value: '1y' },
  ];

  const handleExport = async () => {
    try {
      const blob = await marketingAnalyticsApi.exportAnalytics(period, 'csv');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `marketing-analytics-${period}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Export downloaded');
    } catch (error) {
      toast.error('Failed to export analytics');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marketing Analytics"
        subtitle="Track performance across all marketing channels"
        actions={
          <>
            {periods.map((p) => (
              <Button
                key={p.value}
                variant={period === p.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod(p.value)}
              >
                {p.label}
              </Button>
            ))}
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </>
        }
      />

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <KpiCard title="Total Campaigns" value={formatNumber(kpis.totalCampaigns)} />
        <KpiCard title="Total Spent" value={formatCurrency(kpis.totalSpent)} />
        <KpiCard title="Total Revenue" value={formatCurrency(kpis.totalRevenue)} />
        <KpiCard
          title="Average ROI"
          value={
            <span className="flex items-center gap-2">
              {kpis.avgROI}%
              {kpis.avgROI > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </span>
          }
        />
        <KpiCard title="Emails Sent" value={formatNumber(kpis.emailsSent)} />
        <KpiCard title="Conversion Rate" value={`${kpis.conversionRate}%`} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.topCampaigns?.length > 0 ? (
              <div className="space-y-4">
                {analytics.topCampaigns.slice(0, 5).map((campaign: any, index: number) => (
                  <div key={campaign.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">
                        {index + 1}. {campaign.name}
                      </p>
                      <p className="text-sm text-muted-foreground">{campaign.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{campaign.roi}%</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(campaign.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No campaign data available</p>
            )}
          </CardContent>
        </Card>

        {/* Channel Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Channel Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.channelPerformance?.length > 0 ? (
              <div className="space-y-4">
                {analytics.channelPerformance.map((channel: any) => (
                  <div key={channel.channel} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize">{channel.channel}</span>
                      <span className="font-medium">{channel.roi}% ROI</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${Math.min(channel.roi, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No channel data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Engagement Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics?.conversionFunnel?.length > 0 ? (
            <div className="space-y-4">
              {analytics.conversionFunnel.map((stage: any, index: number) => (
                <div key={stage.stage} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{stage.stage}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatNumber(stage.count)} ({stage.rate}%)
                    </span>
                  </div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-end pr-4"
                      style={{
                        width: `${100 - index * 15}%`,
                      }}
                    >
                      <span className="text-white text-sm font-medium">
                        {formatNumber(stage.count)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No funnel data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
