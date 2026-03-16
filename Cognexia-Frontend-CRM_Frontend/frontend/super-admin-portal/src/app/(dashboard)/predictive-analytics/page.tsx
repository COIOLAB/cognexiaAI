'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { predictiveAnalyticsAPI } from '@/lib/api/super-admin-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { Brain, TrendingUp, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PredictiveAnalyticsPage() {
  const queryClient = useQueryClient();

  const { data: churnPredictions } = useQuery({
    queryKey: ['churn-predictions'],
    queryFn: () => predictiveAnalyticsAPI.getChurnPredictions(),
  });

  const { data: summary } = useQuery({
    queryKey: ['churn-summary'],
    queryFn: () => predictiveAnalyticsAPI.getChurnSummary(),
  });

  const predictChurnMutation = useMutation({
    mutationFn: predictiveAnalyticsAPI.predictChurn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['churn-predictions'] });
      toast.success('Churn prediction generated');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Brain className="h-8 w-8 text-purple-500" />
        <h1 className="text-3xl font-bold">AI-Powered Predictive Analytics</h1>
      </div>
      <p className="text-muted-foreground">Machine learning-powered churn prediction and revenue forecasting</p>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Total Predictions</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{summary?.total || 0}</div></CardContent>
        </Card>
        <Card className="border-red-200">
          <CardHeader><CardTitle className="text-sm">High Risk</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">{summary?.high_risk || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Medium Risk</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-yellow-600">{summary?.medium_risk || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Avg Probability</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{summary?.avg_probability?.toFixed(1) || 0}%</div></CardContent>
        </Card>
      </div>

      {/* Churn Predictions */}
      <Card>
        <CardHeader>
          <CardTitle>Churn Risk Predictions</CardTitle>
          <CardDescription>Organizations predicted to churn in next 30/60/90 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {churnPredictions?.slice(0, 10).map((prediction: any) => (
              <div key={prediction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center"
                         style={{ borderColor: prediction.churn_risk_level === 'critical' ? '#dc2626' : prediction.churn_risk_level === 'high' ? '#ef4444' : '#f59e0b' }}>
                      <span className="text-lg font-bold">{prediction.churn_probability}%</span>
                    </div>
                    <div>
                      <p className="font-medium">{prediction.organization?.name}</p>
                      <Badge variant={prediction.churn_risk_level === 'critical' || prediction.churn_risk_level === 'high' ? 'error' : 'secondary'}>
                        {prediction.churn_risk_level} risk
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Confidence: {prediction.confidence_score}%
                      </p>
                    </div>
                  </div>
                  {prediction.risk_factors && (
                    <div className="mt-3 text-sm">
                      <strong>Risk Factors:</strong>
                      <ul className="list-disc list-inside mt-1 text-muted-foreground">
                        {prediction.risk_factors.slice(0, 3).map((factor: any, i: number) => (
                          <li key={i}>{factor.description}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

