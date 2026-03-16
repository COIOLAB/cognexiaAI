'use client';

import { useQuery } from '@tanstack/react-query';
import { customerSuccessAPI } from '@/lib/api/super-admin-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users, CheckCircle } from 'lucide-react';

export default function CustomerSuccessPage() {
  const { data: milestones } = useQuery({
    queryKey: ['customer-success', 'milestones'],
    queryFn: () => customerSuccessAPI.getMilestones(),
  });

  const { data: progress } = useQuery({
    queryKey: ['customer-success', 'progress'],
    queryFn: () => customerSuccessAPI.getProgress(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users className="h-8 w-8 text-purple-500" />
        <h1 className="text-3xl font-bold">Customer Success</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Total Milestones</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{progress?.total || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Completed</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{progress?.by_status?.completed || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">In Progress</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{progress?.by_status?.in_progress || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Completion Rate</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{progress?.completion_rate?.toFixed(0) || 0}%</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {milestones?.map((milestone: any) => (
              <div key={milestone.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium">{milestone.title}</p>
                    <p className="text-sm text-muted-foreground">{milestone.organization?.name}</p>
                  </div>
                  <Badge variant={milestone.status === 'completed' ? 'default' : 'secondary'}>
                    {milestone.status}
                  </Badge>
                </div>
                <Progress value={milestone.completion_percentage} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">{milestone.completion_percentage}% complete</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

