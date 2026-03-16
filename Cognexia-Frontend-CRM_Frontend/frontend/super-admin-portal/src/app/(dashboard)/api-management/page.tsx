'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiManagementAPI } from '@/lib/api/super-admin-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { Key, Ban } from 'lucide-react';

export default function APIManagementPage() {
  const queryClient = useQueryClient();

  const { data: apiKeys } = useQuery({
    queryKey: ['api-keys'],
    queryFn: () => apiManagementAPI.getAllAPIKeys(),
  });

  const { data: stats } = useQuery({
    queryKey: ['api-management', 'stats'],
    queryFn: () => apiManagementAPI.getUsageStats(),
  });

  const { data: analytics } = useQuery({
    queryKey: ['api-management', 'analytics'],
    queryFn: () => apiManagementAPI.getEndpointAnalytics(),
  });

  const revokeMutation = useMutation({
    mutationFn: apiManagementAPI.revokeAPIKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast.success('API key revoked');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">API Management</h1>
        <Button><Key className="h-4 w-4 mr-2" />Generate New Key</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Total Keys</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.totalKeys}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Active</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.activeKeys}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Total Requests</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.totalRequests?.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Avg Rate Limit</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.avgRateLimit?.toFixed(0)}/hr</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {apiKeys?.map((key: any) => (
              <div key={key.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{key.name}</p>
                  <p className="font-mono text-xs">{key.key}</p>
                  <p className="text-sm text-muted-foreground">Used {key.usageCount} times</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={key.isActive ? 'default' : 'secondary'}>
                    {key.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {key.isActive && (
                    <Button size="sm" variant="destructive" onClick={() => revokeMutation.mutate(key.id)}>
                      <Ban className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Endpoint Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics?.map((endpoint: any) => (
              <div key={endpoint.endpoint} className="flex items-center justify-between p-2 border-b">
                <span className="font-mono text-sm">{endpoint.endpoint}</span>
                <div className="flex gap-4 text-sm">
                  <span>{endpoint.calls.toLocaleString()} calls</span>
                  <span>{endpoint.avgResponseTime}ms</span>
                  <span className="text-red-500">{endpoint.errorRate}% errors</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

