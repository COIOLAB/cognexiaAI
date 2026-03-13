'use client';

import { TrendingUp, TrendingDown, Activity, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useConversionMetrics,
  useBottlenecks,
  usePipelineForecast,
  useFunnelAnalysis,
  useCohortAnalysis,
  useRevenueForecast,
} from '@/hooks/useAnalytics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/PageHeader';
import { KpiCard } from '@/components/KpiCard';

export default function AnalyticsPage() {
  const { data: conversionMetrics } = useConversionMetrics();
  const { data: bottlenecks } = useBottlenecks();
  const { data: pipelineForecast } = usePipelineForecast();
  const funnelAnalysis = useFunnelAnalysis();
  const cohortAnalysis = useCohortAnalysis();
  const revenueForecast = useRevenueForecast();
  const [funnelStages, setFunnelStages] = useState('lead, opportunity, deal');
  const [cohortMetric, setCohortMetric] = useState('revenue');
  const [cohortPeriod, setCohortPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [forecastHorizon, setForecastHorizon] = useState('90');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics & Insights"
        subtitle="Advanced analytics, forecasting, and business intelligence"
      />

      {/* Key Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard
          title="Conversion Rate"
          value={`${Number(conversionMetrics?.overallConversionRate ?? 0).toFixed(1)}%`}
          helper="+2.5% from last month"
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
        />
        <KpiCard
          title="Pipeline Value"
          value={`$${Number(pipelineForecast?.totalValue ?? 0).toLocaleString()}`}
          helper="+15.3% from last quarter"
          icon={<Target className="h-4 w-4 text-muted-foreground" />}
        />
        <KpiCard
          title="Average Deal Size"
          value={`$${Number(pipelineForecast?.avgDealSize ?? 0).toLocaleString()}`}
          helper="-3.2% from last month"
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
        />
        <KpiCard
          title="Win Rate"
          value={`${Number(pipelineForecast?.winRate ?? 0).toFixed(1)}%`}
          helper="+5.1% from last quarter"
          icon={<Target className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="conversion" className="space-y-4">
        <TabsList>
          <TabsTrigger value="conversion">Conversion Metrics</TabsTrigger>
          <TabsTrigger value="funnel">Funnel Analysis</TabsTrigger>
          <TabsTrigger value="cohort">Cohort Analysis</TabsTrigger>
          <TabsTrigger value="forecast">Revenue Forecast</TabsTrigger>
          <TabsTrigger value="bottlenecks">Bottlenecks</TabsTrigger>
        </TabsList>

        <TabsContent value="conversion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Lead to Opportunity</span>
                  <span className="text-sm">
                    {Number(conversionMetrics?.leadToOpportunity ?? 0).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Opportunity to Deal</span>
                  <span className="text-sm">
                    {Number(conversionMetrics?.opportunityToDeal ?? 0).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Conversion</span>
                  <span className="text-sm font-bold">
                    {Number(conversionMetrics?.overallConversionRate ?? 0).toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Input
                  value={funnelStages}
                  onChange={(event) => setFunnelStages(event.target.value)}
                  placeholder="Stages (comma separated)"
                />
                <Button
                  onClick={() => {
                    const stages = funnelStages
                      .split(',')
                      .map((stage) => stage.trim())
                      .filter(Boolean);
                    if (!stages.length) {
                      toast.error('Add at least one stage');
                      return;
                    }
                    funnelAnalysis.mutate({ stages });
                  }}
                  disabled={funnelAnalysis.isPending}
                >
                  {funnelAnalysis.isPending ? 'Analyzing...' : 'Run Funnel Analysis'}
                </Button>
                <pre className="rounded-lg border bg-muted p-3 text-xs overflow-auto max-h-64">
                  {funnelAnalysis.isPending
                    ? 'Loading...'
                    : JSON.stringify(funnelAnalysis.data ?? {}, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Funnel Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="rounded-lg border bg-muted p-3 text-xs overflow-auto max-h-80">
                {funnelAnalysis.isPending
                  ? 'Loading...'
                  : JSON.stringify(funnelAnalysis.data ?? {}, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cohort" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cohort Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <Input
                    value={cohortMetric}
                    onChange={(event) => setCohortMetric(event.target.value)}
                    placeholder="Metric (revenue)"
                  />
                  <select
                    value={cohortPeriod}
                    onChange={(event) => setCohortPeriod(event.target.value as 'week' | 'month' | 'quarter')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                    <option value="quarter">Quarter</option>
                  </select>
                </div>
                <Button
                  onClick={() => {
                    const now = new Date();
                    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
                    cohortAnalysis.mutate({
                      cohortPeriod,
                      metric: cohortMetric,
                      startDate: sixMonthsAgo.toISOString(),
                      endDate: now.toISOString(),
                    });
                  }}
                  disabled={cohortAnalysis.isPending}
                >
                  {cohortAnalysis.isPending ? 'Analyzing...' : 'Run Cohort Analysis'}
                </Button>
                <pre className="rounded-lg border bg-muted p-3 text-xs overflow-auto max-h-80">
                  {cohortAnalysis.isPending
                    ? 'Loading...'
                    : JSON.stringify(cohortAnalysis.data ?? {}, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Next Month</p>
                    <p className="text-2xl font-bold">
                      ${Number(pipelineForecast?.nextMonth ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Next Quarter</p>
                    <p className="text-2xl font-bold">
                      ${Number(pipelineForecast?.nextQuarter ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Next Year</p>
                    <p className="text-2xl font-bold">
                      ${Number(pipelineForecast?.nextYear ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Input
                    value={forecastHorizon}
                    onChange={(event) => setForecastHorizon(event.target.value)}
                    placeholder="Forecast months (e.g., 6)"
                  />
                  <Button
                    onClick={() => {
                      const months = Number(forecastHorizon);
                      if (!Number.isFinite(months) || months <= 0) {
                        toast.error('Enter a valid number of months');
                        return;
                      }
                      revenueForecast.mutate({ months, includeSeasonal: true, confidenceInterval: 0.95 });
                    }}
                    disabled={revenueForecast.isPending}
                  >
                    {revenueForecast.isPending ? 'Forecasting...' : 'Run Forecast'}
                  </Button>
                  <pre className="rounded-lg border bg-muted p-3 text-xs overflow-auto max-h-64">
                    {revenueForecast.isPending
                      ? 'Loading...'
                      : JSON.stringify(revenueForecast.data ?? {}, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bottlenecks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Bottlenecks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bottlenecks && bottlenecks.length > 0 ? (
                  bottlenecks.map((bottleneck: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{bottleneck.stage}</p>
                        <p className="text-sm text-muted-foreground">
                          {bottleneck.avgDays} days average
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {bottleneck.dealsStuck} deals stuck
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ${Number(bottleneck.value ?? 0).toLocaleString()} value
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No bottlenecks detected
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
