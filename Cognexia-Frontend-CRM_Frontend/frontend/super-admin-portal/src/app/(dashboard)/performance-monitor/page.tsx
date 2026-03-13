'use client';

import { useQuery } from '@tanstack/react-query';
import { performanceMonitorAPI } from '@/lib/api/super-admin-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Cpu, Database } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PerformanceMonitorPage() {
  const { data: dashboard } = useQuery({
    queryKey: ['performance', 'dashboard'],
    queryFn: () => performanceMonitorAPI.getDashboard(),
    refetchInterval: 5000,
  });

  const { data: endpoints } = useQuery({
    queryKey: ['performance', 'endpoints'],
    queryFn: () => performanceMonitorAPI.getEndpoints(),
  });

  const { data: systemHealth } = useQuery({
    queryKey: ['performance', 'system-health'],
    queryFn: () => performanceMonitorAPI.getSystemHealth(),
    refetchInterval: 5000,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Activity className="h-8 w-8 text-green-500" />
        <h1 className="text-3xl font-bold">Performance Monitoring</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">API Response Time</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.api_response_time?.avg?.toFixed(0) || 0}ms</div>
            <p className="text-xs text-muted-foreground">P95: {dashboard?.api_response_time?.p95?.toFixed(0)}ms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(systemHealth?.cpu?.usage || 0).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Status: {systemHealth?.cpu?.status}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Memory Usage</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(systemHealth?.memory?.usage || 0).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Status: {systemHealth?.memory?.status}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Endpoint Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {endpoints?.map((endpoint: any) => (
              <div key={endpoint.endpoint} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-mono text-sm">{endpoint.endpoint}</span>
                <div className="flex gap-4 text-sm">
                  <span>{endpoint.calls} calls</span>
                  <span>{endpoint.avg_response_time?.toFixed(0)}ms avg</span>
                  <span className={endpoint.error_rate > 5 ? 'text-red-500' : 'text-green-500'}>
                    {endpoint.error_rate}% errors
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

