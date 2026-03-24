'use client';

import { Building2, Users, DollarSign, TrendingUp } from 'lucide-react';
import { usePlatformMetrics } from '@/hooks/use-dashboard';
import { MetricCard } from '@/components/dashboard/metric-card';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { data: metrics, isLoading } = usePlatformMetrics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500">Platform overview and key metrics</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900">Failed to load metrics</p>
          <p className="text-sm text-gray-500">Please refresh the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Platform overview and key metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Organizations"
          value={metrics.totalOrganizations}
          icon={Building2}
          format="number"
          trend={{
            value: metrics.growthRate,
            isPositive: metrics.growthRate > 0,
          }}
          description={`${metrics.activeOrganizations} active`}
        />
        
        <MetricCard
          title="Total Users"
          value={metrics.totalUsers}
          icon={Users}
          format="number"
          description={`${metrics.activeUsers} active users`}
        />
        
        <MetricCard
          title="Monthly Recurring Revenue"
          value={metrics.monthlyRecurringRevenue}
          icon={DollarSign}
          format="currency"
          description="MRR"
        />
        
        <MetricCard
          title="Annual Recurring Revenue"
          value={metrics.annualRecurringRevenue}
          icon={TrendingUp}
          format="currency"
          description="ARR"
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active Organizations"
          value={metrics.activeOrganizations}
          icon={Building2}
          format="number"
        />
        
        <MetricCard
          title="Trial Organizations"
          value={metrics.trialOrganizations}
          icon={Building2}
          format="number"
        />
        
        <MetricCard
          title="ARPU"
          value={metrics.averageRevenuePerUser}
          icon={DollarSign}
          format="currency"
          description="Average Revenue Per User"
        />
        
        <MetricCard
          title="Churn Rate"
          value={metrics.churnRate}
          icon={TrendingUp}
          format="percentage"
          trend={{
            value: -metrics.churnRate,
            isPositive: false,
          }}
        />
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-gray-900">New Users This Month</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {metrics.newUsersThisMonth.toLocaleString()}
          </p>
        </div>
        
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-gray-900">Revenue This Month</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            ${metrics.revenueThisMonth.toLocaleString()}
          </p>
        </div>
        
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-gray-900">Suspended Organizations</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {metrics.suspendedOrganizations.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

