'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { integrationApi } from '@/services/integration.api';
import { PageHeader } from '@/components/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const integrationTypes = ['ERP', 'EMAIL', 'CALENDAR', 'MESSAGING', 'DATA_WAREHOUSE'] as const;

export default function IntegrationPage() {
  const [name, setName] = useState('');
  const [type, setType] = useState<(typeof integrationTypes)[number]>('ERP');
  const [endpoint, setEndpoint] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [oauthToken, setOauthToken] = useState('');
  const [credentialKey, setCredentialKey] = useState('');
  const [credentialValue, setCredentialValue] = useState('');
  const [extraCredentials, setExtraCredentials] = useState<Array<{ key: string; value: string }>>([]);

  const statusQuery = useQuery({
    queryKey: ['integrations'],
    queryFn: () => integrationApi.listStatuses(),
  });

  const registerMutation = useMutation({
    mutationFn: (payload: any) => integrationApi.register(payload),
    onSuccess: () => {
      toast.success('Integration registered');
      statusQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to register integration');
    },
  });

  const statuses = statusQuery.data?.data || {};
  const statusEntries = Object.entries(statuses || {});

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

  return (
    <TooltipProvider>
      <div className="space-y-6">
      <PageHeader
        title="Integration Hub"
        subtitle="Configure external system integrations."
        actions={
          <Button variant="outline" onClick={() => statusQuery.refetch()}>
            Refresh Status
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Register Integration</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div>
              <FieldLabel label="Integration Name" tooltip="Unique name for this integration." />
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="sap-erp" />
            </div>
            <div>
              <FieldLabel label="Type" tooltip="Integration category." />
              <Select value={type} onValueChange={(value) => setType(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {integrationTypes.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <FieldLabel label="Endpoint" tooltip="Base API endpoint for the integration." />
              <Input value={endpoint} onChange={(e) => setEndpoint(e.target.value)} placeholder="https://api.vendor.com" />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <FieldLabel label="API Key" tooltip="Optional API key provided by vendor." />
              <Input value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="api-key" />
            </div>
            <div>
              <FieldLabel label="OAuth Token" tooltip="Optional OAuth token." />
              <Input value={oauthToken} onChange={(e) => setOauthToken(e.target.value)} placeholder="oauth-token" />
            </div>
            <div>
              <FieldLabel label="Extra Credentials" tooltip="Add extra key/value pairs." />
              <div className="grid gap-2 md:grid-cols-2">
                <Input
                  placeholder="key"
                  value={credentialKey}
                  onChange={(e) => setCredentialKey(e.target.value)}
                />
                <Input
                  placeholder="value"
                  value={credentialValue}
                  onChange={(e) => setCredentialValue(e.target.value)}
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!credentialKey) return;
                    setExtraCredentials((prev) => {
                      const next = prev.filter((item) => item.key !== credentialKey);
                      next.push({ key: credentialKey, value: credentialValue });
                      return next;
                    });
                    setCredentialKey('');
                    setCredentialValue('');
                  }}
                >
                  Add Credential
                </Button>
              </div>
              {extraCredentials.length > 0 && (
                <div className="mt-2 space-y-2 text-xs">
                  {extraCredentials.map((item) => (
                    <div key={item.key} className="flex items-center justify-between rounded border px-2 py-1">
                      <span>
                        {item.key}: {item.value}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setExtraCredentials((prev) => prev.filter((entry) => entry.key !== item.key))
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <Button
              onClick={() => {
                const credentials = extraCredentials.reduce<Record<string, string>>((acc, item) => {
                  acc[item.key] = item.value;
                  return acc;
                }, {});
                registerMutation.mutate({
                  name,
                  config: {
                    name,
                    type,
                    credentials,
                    endpoint: endpoint || undefined,
                    api_key: apiKey || undefined,
                    oauth_token: oauthToken || undefined,
                  },
                });
              }}
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? 'Registering...' : 'Register'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integration Status</CardTitle>
        </CardHeader>
        <CardContent>
          {statusQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-5/6" />
            </div>
          ) : statusEntries.length === 0 ? (
            <div className="text-sm text-muted-foreground">No integrations registered yet.</div>
          ) : (
            <div className="rounded-md border bg-background">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Integration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statusEntries.map(([key, value]: any) => (
                    <TableRow key={key}>
                      <TableCell className="font-medium">{key}</TableCell>
                      <TableCell>{value?.status || value?.state || 'Unknown'}</TableCell>
                      <TableCell>{value?.updatedAt || value?.lastCheckedAt || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  </TooltipProvider>
  );
}
