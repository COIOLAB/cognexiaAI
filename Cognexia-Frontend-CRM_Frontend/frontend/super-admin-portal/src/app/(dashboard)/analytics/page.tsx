'use client';

import { useQuery } from '@tanstack/react-query';
import { platformAnalyticsAPI } from '@/lib/api/super-admin-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUpIcon, ArrowDownIcon, Users, Building2, DollarSign, TrendingUp } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function PlatformAnalyticsPage() {
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['platform-analytics', 'overview'],
    queryFn: () => platformAnalyticsAPI.getOverview(),
  });

  const { data: growthTrends } = useQuery({
    queryKey: ['platform-analytics', 'growth-trends'],
    queryFn: () => platformAnalyticsAPI.getGrowthTrends({ period: 'daily' }),
  });

  const { data: usageMetrics } = useQuery({
    queryKey: ['platform-analytics', 'usage-metrics'],
    queryFn: () => platformAnalyticsAPI.getUsageMetrics(),
  });

  const { data: revenueBreakdown } = useQuery({
    queryKey: ['platform-analytics', 'revenue-breakdown'],
    queryFn: () => platformAnalyticsAPI.getRevenueBreakdown(),
  });

  if (overviewLoading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  const tierColors: Record<string, string> = { basic: '#94a3b8', premium: '#a855f7', advanced: '#3b82f6' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Platform Analytics</h1>
        <p className="text-muted-foreground">Real-time insights into platform performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.totalActiveUsers?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              {overview?.userGrowthPercentage > 0 ? (
                <><ArrowUpIcon className="h-3 w-3 text-green-500 mr-1" /> {overview?.userGrowthPercentage}%</>
              ) : (
                <><ArrowDownIcon className="h-3 w-3 text-red-500 mr-1" /> {Math.abs(overview?.userGrowthPercentage)}%</>
              )}
              <span className="ml-1">from last period</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.totalOrganizations?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              {overview?.organizationGrowthPercentage > 0 ? (
                <><ArrowUpIcon className="h-3 w-3 text-green-500 mr-1" /> {overview?.organizationGrowthPercentage}%</>
              ) : (
                <><ArrowDownIcon className="h-3 w-3 text-red-500 mr-1" /> {Math.abs(overview?.organizationGrowthPercentage)}%</>
              )}
              <span className="ml-1">from last period</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overview?.mrr?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              ARR: ${overview?.arr?.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.churnRate}%</div>
            <p className="text-xs text-muted-foreground">
              {overview?.churnRate < 3 ? 'Healthy' : 'Needs attention'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for detailed views */}
      <Tabs defaultValue="growth" className="space-y-4">
        <TabsList>
          <TabsTrigger value="growth">Growth Trends</TabsTrigger>
          <TabsTrigger value="usage">Usage Metrics</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User & Organization Growth</CardTitle>
              <CardDescription>Track growth trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={growthTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#3b82f6" name="Users" strokeWidth={2} />
                  <Line type="monotone" dataKey="organizations" stroke="#8b5cf6" name="Organizations" strokeWidth={2} />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" name="Revenue" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Patterns</CardTitle>
              <CardDescription>Peak hours: {usageMetrics?.peakUsageHour}:00</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={usageMetrics?.hourlyDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Organizations by Tier</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(overview?.organizationsByTier || {}).map(([name, value]) => ({ name, value }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.keys(overview?.organizationsByTier || {}).map((tier, index) => (
                        <Cell key={`cell-${index}`} fill={tierColors[tier]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Tier</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(revenueBreakdown || {}).map(([tier, data]: [string, any]) => (
                    <div key={tier}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium capitalize">{tier}</span>
                        <span className="text-sm font-bold">${data.revenue}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">{data.count} organizations</div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${(data.revenue / Math.max(...Object.values(revenueBreakdown).map((d: any) => d.revenue))) * 100}%`,
                            backgroundColor: tierColors[tier],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.activeSessions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">API Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.apiCallsCount?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Avg response: {overview?.avgApiResponseTime}ms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Storage Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.totalStorageUsageGB?.toFixed(2)} GB</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

