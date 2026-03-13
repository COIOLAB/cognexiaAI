'use client';

import { useQuery } from '@tanstack/react-query';
import { releasesAPI } from '@/lib/api/super-admin-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Rocket, Plus } from 'lucide-react';

export default function ReleasesPage() {
  const { data: deployments } = useQuery({
    queryKey: ['releases'],
    queryFn: () => releasesAPI.getAll(),
  });

  const { data: stats } = useQuery({
    queryKey: ['releases', 'stats'],
    queryFn: () => releasesAPI.getStats(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Rocket className="h-8 w-8 text-purple-500" />
          <h1 className="text-3xl font-bold">Release Management</h1>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />New Deployment</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Total Deployments</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.total || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Success Rate</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{stats?.success_rate?.toFixed(0) || 0}%</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Avg Duration</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.avg_duration || 0}s</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">In Progress</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.by_status?.in_progress || 0}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Deployments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {deployments?.map((deployment: any) => (
              <div key={deployment.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">{deployment.environment}</Badge>
                    <span className="font-medium">{deployment.version_tag}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {deployment.deployment_strategy} • {new Date(deployment.deployed_at).toLocaleString()}
                  </p>
                </div>
                <Badge variant={deployment.status === 'completed' ? 'success' : deployment.status === 'failed' ? 'error' : 'secondary'}>
                  {deployment.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

