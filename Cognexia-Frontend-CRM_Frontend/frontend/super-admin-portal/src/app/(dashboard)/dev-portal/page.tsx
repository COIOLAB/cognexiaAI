'use client';

import { useQuery } from '@tanstack/react-query';
import { devPortalAPI } from '@/lib/api/super-admin-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Code, Plus } from 'lucide-react';

export default function DevPortalPage() {
  const { data: sandboxes } = useQuery({
    queryKey: ['sandboxes'],
    queryFn: () => devPortalAPI.getSandboxes(),
  });

  const { data: stats } = useQuery({
    queryKey: ['sandboxes', 'stats'],
    queryFn: () => devPortalAPI.getStats(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="h-8 w-8 text-indigo-500" />
          <h1 className="text-3xl font-bold">Developer Portal</h1>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Create Sandbox</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Total Sandboxes</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.total || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Active</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{stats?.active || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Total API Calls</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.total_api_calls?.toLocaleString() || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Storage Used</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.total_storage_gb?.toFixed(2) || 0} GB</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sandbox Environments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sandboxes?.map((sandbox: any) => (
              <div key={sandbox.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{sandbox.name}</p>
                  <p className="text-sm text-muted-foreground">{sandbox.organization?.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={sandbox.status === 'active' ? 'default' : 'secondary'}>
                    {sandbox.status}
                  </Badge>
                  <Button size="sm" variant="outline">Manage</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

