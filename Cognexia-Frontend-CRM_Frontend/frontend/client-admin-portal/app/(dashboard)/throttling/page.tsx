'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { throttlingApi } from '@/services/throttling.api';
import { PageHeader } from '@/components/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const fetchThrottling = (path: string) => throttlingApi.request({ url: path, method: 'GET' });

const throttleTypes = ['IP', 'USER', 'ORGANIZATION', 'GLOBAL'] as const;

export default function ThrottlingPage() {
  const [identifier, setIdentifier] = useState('');
  const [type, setType] = useState<(typeof throttleTypes)[number]>('USER');

  const statusQuery = useQuery({
    queryKey: ['throttling', 'status'],
    queryFn: () => fetchThrottling('status'),
  });

  const limitsMutation = useMutation({
    mutationFn: () => fetchThrottling(`limits/${type}/${identifier}`),
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || 'Failed to fetch limits'),
  });

  const blockedMutation = useMutation({
    mutationFn: () => fetchThrottling(`blocked/${type}/${identifier}`),
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || 'Failed to check blocked status'),
  });

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
          title="Throttling & Rate Limits"
          subtitle="Inspect rate limiting rules and blocked identifiers."
          actions={
            <Button variant="outline" onClick={() => statusQuery.refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          }
        />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            {statusQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
              </div>
            ) : (
              renderKeyValueTable(statusQuery.data ?? {})
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lookup Limits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <FieldLabel label="Throttle Type" tooltip="Scope for throttling." />
            <Select value={type} onValueChange={(value) => setType(value as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {throttleTypes.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            </div>
            <div className="space-y-2">
              <FieldLabel label="Identifier" tooltip="User ID, org ID, or IP address." />
            <Input
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="Identifier (userId, orgId, IP)"
            />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => identifier && limitsMutation.mutate()} disabled={!identifier}>
                Check Limits
              </Button>
              <Button
                variant="secondary"
                onClick={() => identifier && blockedMutation.mutate()}
                disabled={!identifier}
              >
                Check Blocked
              </Button>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Limit Details</div>
              {limitsMutation.isPending ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-5/6" />
                </div>
              ) : (
                renderKeyValueTable(limitsMutation.data ?? {})
              )}
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Blocked Status</div>
              {blockedMutation.isPending ? (
                <div className="space-y-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-5/6" />
                </div>
              ) : (
                renderKeyValueTable(blockedMutation.data ?? {})
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </TooltipProvider>
  );
}
