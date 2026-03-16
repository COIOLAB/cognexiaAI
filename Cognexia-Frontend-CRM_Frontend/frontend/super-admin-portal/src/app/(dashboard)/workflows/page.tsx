'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { automationWorkflowsAPI } from '@/lib/api/super-admin-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'react-hot-toast';
import { Play, Pause } from 'lucide-react';

export default function WorkflowsPage() {
  const queryClient = useQueryClient();

  const { data: workflows } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => automationWorkflowsAPI.getAllWorkflows(),
  });

  const { data: stats } = useQuery({
    queryKey: ['workflows', 'stats'],
    queryFn: () => automationWorkflowsAPI.getStats(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      automationWorkflowsAPI.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow status updated');
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Automation Workflows</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-sm">Total Workflows</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Active</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.active}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Total Executions</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.totalExecutions}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Workflows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {workflows?.map((workflow: any) => (
              <div key={workflow.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{workflow.name}</p>
                  <p className="text-sm text-muted-foreground">{workflow.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Executed {workflow.executionCount} times
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                    {workflow.status}
                  </Badge>
                  <Switch
                    checked={workflow.status === 'active'}
                    onCheckedChange={(checked) =>
                      updateStatusMutation.mutate({
                        id: workflow.id,
                        status: checked ? 'active' : 'paused',
                      })
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

