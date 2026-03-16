'use client';

import { useQuery } from '@tanstack/react-query';
import { whiteLabelAPI } from '@/lib/api/super-admin-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';

export default function WhiteLabelPage() {
  const { data: configs } = useQuery({
    queryKey: ['white-label', 'configs'],
    queryFn: () => whiteLabelAPI.getAllConfigs(),
  });

  const { data: stats } = useQuery({
    queryKey: ['white-label', 'stats'],
    queryFn: () => whiteLabelAPI.getStats(),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">White-Label Management</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-sm">Total Configs</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.totalConfigs}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Custom Domains</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.withCustomDomain}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">SSO Enabled</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.withSSO}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Branding</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {configs?.map((config: any) => (
              <div key={config.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded border flex items-center justify-center" style={{ backgroundColor: config.colorScheme?.primary || '#ccc' }}>
                    <Palette className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{config.companyName || 'Unnamed'}</p>
                    <p className="text-sm text-muted-foreground">{config.customDomain || 'No custom domain'}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">Edit</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

