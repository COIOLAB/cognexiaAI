'use client';

import { useState } from 'react';
import { useSalesAnalytics } from '@/hooks/useSalesAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, ShoppingCart, TrendingUp, Users, Clock, Target } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { KpiCard } from '@/components/KpiCard';

export default function SalesAnalyticsPage() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly');
  const { data, isLoading } = useSalesAnalytics({ period });

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Loading analytics...</div>;
  }

  const analytics = data?.data;
  const topProducts = Array.isArray(analytics?.topProducts) ? analytics.topProducts : [];
  const topCustomers = Array.isArray(analytics?.topCustomers) ? analytics.topCustomers : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Analytics"
        subtitle="Comprehensive sales performance metrics"
        actions={
          <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {analytics && (
        <>
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-6">
            <KpiCard
              title="Revenue"
              value={`$${(Number(analytics.kpis?.totalRevenue ?? 0) / 1000000).toFixed(2)}M`}
              helper={`+${Number(analytics.trends?.revenueGrowth ?? 0).toFixed(1)}%`}
              icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
            />
            <KpiCard
              title="Orders"
              value={Number(analytics.kpis?.totalOrders ?? 0)}
              helper={`+${Number(analytics.trends?.orderGrowth ?? 0).toFixed(1)}%`}
              icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
            />
            <KpiCard
              title="Avg Order"
              value={`$${Number(analytics.kpis?.avgOrderValue ?? 0).toLocaleString()}`}
            />
            <KpiCard
              title="Conv. Rate"
              value={`${Number(analytics.kpis?.conversionRate ?? 0).toFixed(1)}%`}
              icon={<Target className="h-4 w-4 text-muted-foreground" />}
            />
            <KpiCard
              title="Sales Cycle"
              value={`${Number(analytics.kpis?.salesCycleLength ?? 0)}d`}
              icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            />
            <KpiCard
              title="Retention"
              value={`${Number(analytics.kpis?.customerRetentionRate ?? 0).toFixed(1)}%`}
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {Number(product.orders ?? 0)} orders
                        </div>
                      </div>
                      <div className="text-right font-semibold">
                        ${(Number(product.revenue ?? 0) / 1000).toFixed(0)}k
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCustomers.map((customer, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {Number(customer.orders ?? 0)} orders
                        </div>
                      </div>
                      <div className="text-right font-semibold">
                        ${(Number(customer.revenue ?? 0) / 1000).toFixed(0)}k
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
