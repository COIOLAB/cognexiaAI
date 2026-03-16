'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recommendationsAPI } from '@/lib/api/super-admin-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { Lightbulb, CheckCircle, X } from 'lucide-react';

export default function RecommendationsPage() {
  const queryClient = useQueryClient();

  const { data: recommendations } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => recommendationsAPI.getAll(),
  });

  const { data: stats } = useQuery({
    queryKey: ['recommendations', 'stats'],
    queryFn: () => recommendationsAPI.getStats(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, reason }: any) => recommendationsAPI.updateStatus(id, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      toast.success('Recommendation updated');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-8 w-8 text-yellow-500" />
        <h1 className="text-3xl font-bold">Smart Recommendations</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Total</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.total || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Pending</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.pending || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Accepted</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{stats?.accepted || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Acceptance Rate</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.acceptance_rate?.toFixed(0) || 0}%</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations?.map((rec: any) => (
              <div key={rec.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={rec.priority === 'critical' || rec.priority === 'high' ? 'error' : 'default'}>
                        {rec.priority}
                      </Badge>
                      <Badge variant="outline">{rec.recommendation_type}</Badge>
                      <span className="text-xs text-muted-foreground">Confidence: {rec.confidence_score}%</span>
                    </div>
                    <h3 className="font-semibold">{rec.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                    {rec.action_items && rec.action_items.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold">Action Items:</p>
                        <ul className="list-disc list-inside text-xs text-muted-foreground">
                          {rec.action_items.map((item: string, i: number) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatusMutation.mutate({ id: rec.id, status: 'accepted' })}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatusMutation.mutate({ id: rec.id, status: 'dismissed', reason: 'Not applicable' })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

