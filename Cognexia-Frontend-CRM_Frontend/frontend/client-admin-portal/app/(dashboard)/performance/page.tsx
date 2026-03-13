'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { performanceApi } from '@/services/performance.api';
import { PageHeader } from '@/components/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const fetchPerformance = (path: string, params?: Record<string, any>) =>
  performanceApi.request({ url: path, method: 'GET', params });

export default function PerformancePage() {
  const [entity, setEntity] = useState('');
  const [slowContext, setSlowContext] = useState('');

  const metricsQuery = useQuery({
    queryKey: ['performance', 'metrics'],
    queryFn: () => fetchPerformance('metrics'),
  });

  const slowQuery = useQuery({
    queryKey: ['performance', 'slow-queries', slowContext],
    queryFn: () => fetchPerformance('slow-queries', slowContext ? { context: slowContext } : undefined),
  });

  const requestQuery = useQuery({
    queryKey: ['performance', 'requests'],
    queryFn: () => fetchPerformance('requests'),
  });

  const indexMutation = useMutation({
    mutationFn: () => performanceApi.request({ url: `index-recommendations/${entity}`, method: 'GET' }),
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || 'Failed to fetch recommendations'),
  });

  const refreshAll = () => {
    metricsQuery.refetch();
    slowQuery.refetch();
    requestQuery.refetch();
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
          title="Performance & Optimization"
          subtitle="Review database performance, slow queries, and request latency."
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
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            {metricsQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
              </div>
            ) : (
              renderKeyValueTable(metricsQuery.data ?? {})
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            {requestQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
              </div>
            ) : (
              renderKeyValueTable(requestQuery.data ?? {})
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Slow Queries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <FieldLabel label="Context Filter" tooltip="Optional filter for slow queries." />
              <Input
                value={slowContext}
                onChange={(event) => setSlowContext(event.target.value)}
                placeholder="Optional context filter"
              />
            </div>
            {slowQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
              </div>
            ) : (
              renderKeyValueTable(slowQuery.data ?? {})
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Index Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <FieldLabel label="Entity Name" tooltip="Entity for index recommendations." />
              <Input
                value={entity}
                onChange={(event) => setEntity(event.target.value)}
                placeholder="Entity name (e.g. Customer)"
              />
            </div>
            <Button onClick={() => entity && indexMutation.mutate()} disabled={!entity || indexMutation.isPending}>
              {indexMutation.isPending ? 'Loading...' : 'Fetch Recommendations'}
            </Button>
            {indexMutation.isPending ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
              </div>
            ) : (
              renderKeyValueTable(indexMutation.data ?? {})
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  </TooltipProvider>
  );
}
