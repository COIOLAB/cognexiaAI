'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usageApi } from '@/services/usage.api';
import { useAuthStore } from '@/stores/auth-store';
import { PageHeader } from '@/components/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const fetchUsage = (path: string, params?: Record<string, any>) =>
  usageApi.request({ url: path, method: 'GET', params });

const metricTypes = ['api_calls', 'user_count', 'storage', 'storage_used', 'email_sent', 'sms_sent'] as const;

export default function UsagePage() {
  const { user } = useAuthStore();
  const [orgId, setOrgId] = useState('');
  const [metricType, setMetricType] = useState<(typeof metricTypes)[number]>('api_calls');

  useEffect(() => {
    if (user?.organizationId) {
      setOrgId(user.organizationId);
    }
  }, [user?.organizationId]);

  const overviewQuery = useQuery({
    queryKey: ['usage', 'overview'],
    queryFn: () => usageApi.list(),
  });

  const summaryQuery = useQuery({
    queryKey: ['usage', 'summary', orgId],
    queryFn: () => fetchUsage(`summary/${orgId}`),
    enabled: !!orgId,
  });

  const topEndpointsQuery = useQuery({
    queryKey: ['usage', 'top-endpoints', orgId],
    queryFn: () => fetchUsage(`top-endpoints/${orgId}`),
    enabled: !!orgId,
  });

  const activeUsersQuery = useQuery({
    queryKey: ['usage', 'active-users', orgId],
    queryFn: () => fetchUsage(`active-users/${orgId}`),
    enabled: !!orgId,
  });

  const trendsQuery = useQuery({
    queryKey: ['usage', 'trends', orgId, metricType],
    queryFn: () => fetchUsage(`trends/${orgId}`, { metricType }),
    enabled: !!orgId,
  });

  const refreshAll = () => {
    overviewQuery.refetch();
    summaryQuery.refetch();
    topEndpointsQuery.refetch();
    activeUsersQuery.refetch();
    trendsQuery.refetch();
  };

  const FieldLabel = ({ label, tooltip }: { label: string; tooltip?: string }) => (
    <div className="flex items-center gap-2 text-sm font-medium">
      <span>{label}</span>
      {tooltip && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-help rounded-full border px-1 text-[10px] text-muted-foreground">?</span>
          </TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      )}
    </div>
  );

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
    <TooltipProvider>
      <div className="space-y-6">
        <PageHeader
          title="Usage Tracking"
          subtitle="Track API usage, quotas, and feature adoption for your organization."
          actions={
            <Button variant="outline" onClick={refreshAll}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          }
        />

      <Card>
        <CardHeader>
          <CardTitle>Organization Context</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3 md:items-center">
          <div className="space-y-2">
            <FieldLabel label="Organization ID" tooltip="Defaults to your organization." />
            <Input
              value={orgId}
              onChange={(event) => setOrgId(event.target.value)}
              placeholder="Organization ID"
            />
          </div>
          <Select value={metricType} onValueChange={(value) => setMetricType(value as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {metricTypes.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="secondary" onClick={refreshAll} disabled={!orgId}>
            Load Usage
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Usage Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {overviewQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
              </div>
            ) : (
              renderKeyValueTable(overviewQuery.data ?? {})
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organization Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {summaryQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
              </div>
            ) : (
              renderKeyValueTable(summaryQuery.data ?? {})
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            {topEndpointsQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
              </div>
            ) : (
              renderKeyValueTable(topEndpointsQuery.data ?? {})
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            {activeUsersQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
              </div>
            ) : (
              renderKeyValueTable(activeUsersQuery.data ?? {})
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Usage Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {trendsQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
              </div>
            ) : (
              renderKeyValueTable(trendsQuery.data ?? {})
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  </TooltipProvider>
  );
}
