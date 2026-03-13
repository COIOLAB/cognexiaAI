'use client';

import { useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { monitoringApi } from '@/services/monitoring.api';

const fetchMonitoring = (path: string) =>
  monitoringApi.request({ url: path, method: 'GET' });

export default function MonitoringPage() {
  const healthQuery = useQuery({
    queryKey: ['monitoring', 'health'],
    queryFn: () => fetchMonitoring('health'),
  });
  const systemQuery = useQuery({
    queryKey: ['monitoring', 'system'],
    queryFn: () => fetchMonitoring('system'),
  });
  const businessQuery = useQuery({
    queryKey: ['monitoring', 'business'],
    queryFn: () => fetchMonitoring('business'),
  });
  const organizationQuery = useQuery({
    queryKey: ['monitoring', 'organization'],
    queryFn: () => fetchMonitoring('organization'),
  });
  const featuresQuery = useQuery({
    queryKey: ['monitoring', 'features'],
    queryFn: () => fetchMonitoring('analytics/features'),
  });

  const refreshAll = () => {
    healthQuery.refetch();
    systemQuery.refetch();
    businessQuery.refetch();
    organizationQuery.refetch();
    featuresQuery.refetch();
  };

  const renderKeyValueTable = (data: Record<string, any>) => {
    const entries = Object.entries(data || {});
    if (entries.length === 0) {
      return <div className="text-sm text-muted-foreground">No data available.</div>;
    }
    return (
      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map(([key, value]) => (
              <TableRow key={key}>
                <TableCell className="font-medium">{key}</TableCell>
                <TableCell>
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monitoring"
        subtitle="Health checks, system diagnostics, and feature usage."
        actions={
          <Button variant="outline" onClick={refreshAll}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Health Status</CardTitle>
          </CardHeader>
          <CardContent>
            {healthQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
              </div>
            ) : (
              renderKeyValueTable(healthQuery.data ?? {})
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            {systemQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
              </div>
            ) : (
              renderKeyValueTable(systemQuery.data ?? {})
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            {businessQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
              </div>
            ) : (
              renderKeyValueTable(businessQuery.data ?? {})
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organization Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            {organizationQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
              </div>
            ) : (
              renderKeyValueTable(organizationQuery.data ?? {})
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Feature Usage</CardTitle>
          </CardHeader>
          <CardContent>
            {featuresQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
              </div>
            ) : (
              renderKeyValueTable(featuresQuery.data ?? {})
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
