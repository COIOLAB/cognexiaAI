'use client';

import { useSystemHealth } from '@/hooks/use-dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Database, Server, Zap } from 'lucide-react';

export default function SystemHealthPage() {
  const { data: health } = useSystemHealth();

  const getStatusBadge = (status: string) => {
    return status === 'UP' ? (
      <Badge variant="success">UP</Badge>
    ) : (
      <Badge variant="error">DOWN</Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Health</h1>
        <p className="text-gray-500">Monitor platform infrastructure and performance</p>
      </div>

      {health && (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Status</CardTitle>
                <Server className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                {getStatusBadge(health.apiStatus)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Database</CardTitle>
                <Database className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                {getStatusBadge(health.databaseStatus)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Redis</CardTitle>
                <Zap className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                {getStatusBadge(health.redisStatus)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Email Service</CardTitle>
                <Activity className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                {getStatusBadge(health.emailServiceStatus)}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Average Response Time</span>
                <span className="font-semibold">{health.avgResponseTime}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Error Rate</span>
                <span className="font-semibold">{health.errorRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Requests/Min</span>
                <span className="font-semibold">{health.requestsPerMinute.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Uptime</span>
                <span className="font-semibold">{(health.uptime / 3600).toFixed(2)} hours</span>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

