'use client';

import { useState } from 'react';
import { useSalesForecast } from '@/hooks/useSalesAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';

export default function SalesForecastPage() {
  const [period, setPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('quarterly');
  const { data, isLoading } = useSalesForecast({ period, includeConfidenceInterval: true });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Sales Forecast" subtitle="AI-powered revenue predictions" />
        <Skeleton className="h-28 w-full" />
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  const forecast = data?.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Forecast"
        subtitle="AI-powered revenue predictions"
        actions={
          <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {forecast ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Forecast Confidence
                <Badge variant="secondary" className="text-lg">
                  {Number(forecast.confidence ?? 0).toFixed(0)}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Based on historical data, current pipeline, and market trends
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-sm text-red-600">Conservative Scenario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ${(Number(forecast.scenarios?.conservative ?? 0) / 1000000).toFixed(2)}M
                </div>
                <p className="text-sm text-muted-foreground mt-2">Worst case projection</p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
              <CardHeader>
                <CardTitle className="text-sm text-blue-600 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Realistic Scenario
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  ${(Number(forecast.scenarios?.realistic ?? 0) / 1000000).toFixed(2)}M
                </div>
                <p className="text-sm text-muted-foreground mt-2">Most likely outcome</p>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-sm text-green-600">Optimistic Scenario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  ${(Number(forecast.scenarios?.optimistic ?? 0) / 1000000).toFixed(2)}M
                </div>
                <p className="text-sm text-muted-foreground mt-2">Best case projection</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Influencing Factors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {forecast.factors.map((factor, index) => (
                  <div key={index} className="flex items-center p-3 bg-muted rounded-lg">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mr-3" />
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-sm text-muted-foreground">No forecast data yet.</div>
      )}
    </div>
  );
}
