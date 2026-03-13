'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingUp, TrendingDown, Users, Target } from 'lucide-react';
import { useRevenueMetrics } from '@/hooks/useDashboards';
import { PageHeader } from '@/components/PageHeader';
import { KpiCard } from '@/components/KpiCard';

export default function RevenueDashboardPage() {
  const { data: revenueData, isLoading } = useRevenueMetrics();
  type RevenueMetrics = {
    mrr: number;
    arr: number;
    growth: number;
    churnRate: number;
    nrr: number;
    clv: number;
    cac: number;
    ltv_cac_ratio: number | null;
    trend: Array<Record<string, any>>;
    segments: Array<Record<string, any>>;
  };
  const metrics = (revenueData || {
    mrr: 0,
    arr: 0,
    growth: 0,
    churnRate: 0,
    nrr: 0,
    clv: 0,
    cac: 0,
    ltv_cac_ratio: null,
    trend: [],
    segments: [],
  }) as RevenueMetrics;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revenue Dashboard"
        subtitle="Monitor recurring revenue and growth metrics"
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="MRR"
          value={`$${(Number(metrics.mrr ?? 0) / 1000).toFixed(0)}k`}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          helper={`+${Number(metrics.growth ?? 0)}% MoM`}
        />
        <KpiCard
          title="ARR"
          value={`$${(Number(metrics.arr ?? 0) / 1000000).toFixed(2)}M`}
          icon={<Target className="h-4 w-4 text-muted-foreground" />}
          helper="Annual Run Rate"
        />
        <KpiCard
          title="Churn Rate"
          value={`${Number(metrics.churnRate ?? 0)}%`}
          icon={<TrendingDown className="h-4 w-4 text-muted-foreground" />}
          helper="Monthly churn"
        />
        <KpiCard
          title="NRR"
          value={<span className="text-green-600">{Number(metrics.nrr ?? 0)}%</span>}
          helper="Net Revenue Retention"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Lifetime Value</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">CLV</span>
                <span className="font-semibold">
                  ${Number(metrics.clv ?? 0).toLocaleString()}
                </span>
              </div>
              <Progress value={85} />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">CAC</span>
                <span className="font-semibold">
                  ${Number(metrics.cac ?? 0).toLocaleString()}
                </span>
              </div>
              <Progress value={25} />
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between">
                <span className="text-sm font-medium">LTV:CAC Ratio</span>
                <span className="text-lg font-bold text-green-600">
                  {metrics.ltv_cac_ratio !== null ? `${metrics.ltv_cac_ratio}:1` : 'N/A'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Growth Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.trend?.length ? (
                metrics.trend.map((entry) => (
                  <div key={entry.month}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">{entry.month} 2024</span>
                      <span className="font-semibold">
                        {Number(entry.growth ?? 0).toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={Number(entry.growth ?? 0) * 5} />
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  {isLoading ? 'Loading trend…' : 'No revenue trend data yet.'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue by Segment</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.segments?.length ? (
            <div className="space-y-4">
              {metrics.segments.map((segment) => (
                <div key={segment.name}>
                  <div className="flex justify-between mb-2">
                    <span>{segment.name}</span>
                    <span className="font-semibold">
                      ${(Number(segment.value ?? 0) / 1000000).toFixed(2)}M (
                      {Number(segment.percent ?? 0)}%)
                    </span>
                  </div>
                  <Progress value={Number(segment.percent ?? 0) * 2} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Loading segments…' : 'No revenue segment data yet.'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
