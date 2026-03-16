'use client';

import { useQuery } from '@tanstack/react-query';
import { kpiTrackingAPI } from '@/lib/api/super-admin-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target } from 'lucide-react';

export default function KPIsPage() {
  const { data: goals } = useQuery({
    queryKey: ['kpi-goals'],
    queryFn: () => kpiTrackingAPI.getAllGoals(),
  });

  const { data: progress } = useQuery({
    queryKey: ['kpi-goals', 'progress'],
    queryFn: () => kpiTrackingAPI.getProgress(),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">KPI & Goal Tracking</h1>

      <div className="grid gap-4">
        {progress?.map((goal: any) => (
          <Card key={goal.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  {goal.name}
                </CardTitle>
                <Badge variant={goal.status === 'achieved' ? 'default' : 'secondary'}>
                  {goal.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress: {goal.progress.toFixed(1)}%</span>
                  <span>{goal.current} / {goal.target} {goal.unit}</span>
                </div>
                <Progress value={goal.progress} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

