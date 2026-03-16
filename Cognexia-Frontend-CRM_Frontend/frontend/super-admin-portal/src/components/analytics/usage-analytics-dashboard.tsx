'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  HardDrive, 
  Zap, 
  Clock,
  TrendingUp,
  Database
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatDistanceToNow } from 'date-fns';

interface UsageAnalyticsDashboardProps {
  organizationId: string;
  organizationName: string;
}

interface UsageData {
  activeUsers: number;
  totalUsers: number;
  storageUsed: number;
  storageLimit: number;
  apiCallsToday: number;
  apiCallsLimit: number;
  averageSessionDuration: number;
  featuresUsed: {
    feature: string;
    usageCount: number;
    lastUsed: string;
  }[];
  usageTrend: {
    date: string;
    activeUsers: number;
    apiCalls: number;
    storageGB: number;
  }[];
}

export function UsageAnalyticsDashboard({ 
  organizationId, 
  organizationName 
}: UsageAnalyticsDashboardProps) {
  const { data: usage, refetch } = useQuery<UsageData>({
    queryKey: ['usage-analytics', organizationId],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api/v1'}/analytics/usage/${organizationId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );

      if (!response.ok) {
        // Return mock data for demo purposes
        return {
          activeUsers: 7,
          totalUsers: 10,
          storageUsed: 3.2 * 1024 * 1024 * 1024, // 3.2 GB
          storageLimit: 10 * 1024 * 1024 * 1024, // 10 GB
          apiCallsToday: 1247,
          apiCallsLimit: 10000,
          averageSessionDuration: 45 * 60 * 1000, // 45 minutes
          featuresUsed: [
            { feature: 'Advanced Reporting', usageCount: 23, lastUsed: new Date().toISOString() },
            { feature: 'Email Campaigns', usageCount: 15, lastUsed: new Date(Date.now() - 3600000).toISOString() },
            { feature: 'Calendar Sync', usageCount: 42, lastUsed: new Date(Date.now() - 7200000).toISOString() },
          ],
          usageTrend: [
            { date: '2026-01-20', activeUsers: 5, apiCalls: 856, storageGB: 2.8 },
            { date: '2026-01-21', activeUsers: 6, apiCalls: 923, storageGB: 2.9 },
            { date: '2026-01-22', activeUsers: 8, apiCalls: 1134, storageGB: 3.0 },
            { date: '2026-01-23', activeUsers: 7, apiCalls: 1089, storageGB: 3.1 },
            { date: '2026-01-24', activeUsers: 9, apiCalls: 1456, storageGB: 3.15 },
            { date: '2026-01-25', activeUsers: 6, apiCalls: 978, storageGB: 3.18 },
            { date: '2026-01-26', activeUsers: 8, apiCalls: 1312, storageGB: 3.2 },
            { date: '2026-01-27', activeUsers: 7, apiCalls: 1247, storageGB: 3.2 },
          ],
        };
      }

      return await response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const formatBytes = (bytes: number) => {
    const gb = bytes / 1024 / 1024 / 1024;
    return gb.toFixed(2);
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    return `${minutes} min`;
  };

  if (!usage) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const storagePercentage = (usage.storageUsed / usage.storageLimit) * 100;
  const apiCallsPercentage = (usage.apiCallsToday / usage.apiCallsLimit) * 100;
  const usersPercentage = (usage.activeUsers / usage.totalUsers) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Usage Analytics</h2>
          <p className="text-gray-500">{organizationName}</p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Refresh Data
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usage.activeUsers} / {usage.totalUsers}
            </div>
            <Progress value={usersPercentage} className="mt-2" />
            <p className="text-xs text-gray-500 mt-1">
              {usersPercentage.toFixed(0)}% of user limit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-green-600" />
              Storage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBytes(usage.storageUsed)} GB
            </div>
            <Progress value={storagePercentage} className="mt-2" />
            <p className="text-xs text-gray-500 mt-1">
              of {formatBytes(usage.storageLimit)} GB ({storagePercentage.toFixed(0)}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-600" />
              API Calls Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usage.apiCallsToday.toLocaleString()}
            </div>
            <Progress value={apiCallsPercentage} className="mt-2" />
            <p className="text-xs text-gray-500 mt-1">
              of {usage.apiCallsLimit.toLocaleString()} limit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" />
              Avg Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(usage.averageSessionDuration)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Average session duration
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Trends (Last 7 Days)</CardTitle>
          <CardDescription>Track activity patterns over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={usage.usageTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="activeUsers" 
                stroke="#3b82f6" 
                name="Active Users"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="apiCalls" 
                stroke="#10b981" 
                name="API Calls"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Feature Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Usage</CardTitle>
          <CardDescription>Most used features this month</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={usage.featuresUsed}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="feature" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="usageCount" fill="#8b5cf6" name="Usage Count" />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 space-y-2">
            {usage.featuresUsed.map((feature) => (
              <div key={feature.feature} className="flex items-center justify-between p-2 border-b">
                <span className="text-sm font-medium">{feature.feature}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    {feature.usageCount} uses
                  </span>
                  <span className="text-xs text-gray-400">
                    Last: {formatDistanceToNow(new Date(feature.lastUsed), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {(storagePercentage > 80 || apiCallsPercentage > 80 || usersPercentage > 80) && (
        <Card className="border-yellow-500 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Usage Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {storagePercentage > 80 && (
              <div className="flex items-center gap-2 text-sm text-yellow-800">
                <HardDrive className="h-4 w-4" />
                <span>Storage is at {storagePercentage.toFixed(0)}% capacity</span>
              </div>
            )}
            {apiCallsPercentage > 80 && (
              <div className="flex items-center gap-2 text-sm text-yellow-800">
                <Database className="h-4 w-4" />
                <span>API calls at {apiCallsPercentage.toFixed(0)}% of daily limit</span>
              </div>
            )}
            {usersPercentage > 80 && (
              <div className="flex items-center gap-2 text-sm text-yellow-800">
                <Users className="h-4 w-4" />
                <span>Using {usage.activeUsers} of {usage.totalUsers} user slots</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
