'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { anomalyAPI } from '@/lib/api/super-admin-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export default function AnomalyDetectionPage() {
  const queryClient = useQueryClient();

  const { data: dashboard } = useQuery({
    queryKey: ['anomalies', 'dashboard'],
    queryFn: () => anomalyAPI.getDashboard(),
    refetchInterval: 10000,
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, resolution, userId }: any) => anomalyAPI.resolve(id, resolution, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anomalies'] });
      toast.success('Anomaly resolved');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-8 w-8 text-orange-500" />
          <h1 className="text-3xl font-bold">Anomaly Detection</h1>
        </div>
        <Button onClick={() => anomalyAPI.detect()}>Run Detection</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader><CardTitle className="text-sm">Total</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{dashboard?.total || 0}</div></CardContent>
        </Card>
        <Card className="border-red-200">
          <CardHeader><CardTitle className="text-sm">Critical</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">{dashboard?.by_severity?.critical || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">High</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{dashboard?.by_severity?.high || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Medium</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{dashboard?.by_severity?.medium || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Unresolved</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{dashboard?.unresolved || 0}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Anomalies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dashboard?.recent?.map((anomaly: any) => (
              <div key={anomaly.id} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={anomaly.severity === 'critical' || anomaly.severity === 'high' ? 'error' : 'secondary'}>
                      {anomaly.severity}
                    </Badge>
                    <Badge variant="outline">{anomaly.anomaly_type}</Badge>
                  </div>
                  <h3 className="font-semibold">{anomaly.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{anomaly.description}</p>
                  <div className="mt-2 text-xs">
                    <span className="font-medium">Expected:</span> {anomaly.expected_value} | 
                    <span className="font-medium ml-2">Actual:</span> {anomaly.actual_value} | 
                    <span className="font-medium ml-2">Deviation:</span> {anomaly.deviation_percentage}%
                  </div>
                </div>
                {anomaly.status === 'detected' && (
                  <Button
                    size="sm"
                    onClick={() => resolveMutation.mutate({ id: anomaly.id, resolution: 'Investigated and resolved', userId: 'admin' })}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Resolve
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

