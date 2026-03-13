'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationHealthAPI } from '@/lib/api/super-admin-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { Activity, AlertTriangle, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const riskColors: Record<string, string> = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
  critical: '#dc2626',
};

export default function OrganizationHealthPage() {
  const queryClient = useQueryClient();

  const { data: summary } = useQuery({
    queryKey: ['health', 'summary'],
    queryFn: () => organizationHealthAPI.getHealthSummary(),
  });

  const { data: scores } = useQuery({
    queryKey: ['health', 'scores'],
    queryFn: () => organizationHealthAPI.getHealthScores(),
  });

  const { data: inactive } = useQuery({
    queryKey: ['health', 'inactive'],
    queryFn: () => organizationHealthAPI.getInactiveOrganizations(),
  });

  const recalculateMutation = useMutation({
    mutationFn: organizationHealthAPI.recalculateAll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health'] });
      toast.success('Health scores recalculation started');
    },
  });

  const riskData = summary?.riskDistribution ? Object.entries(summary.riskDistribution).map(([name, value]) => ({ name, value })) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Organization Health</h1>
          <p className="text-muted-foreground">Monitor organization health and identify at-risk customers</p>
        </div>
        <Button onClick={() => recalculateMutation.mutate()} disabled={recalculateMutation.isPending}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Recalculate All
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalOrganizations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Healthy</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary?.healthyOrganizations}</div>
            <p className="text-xs text-muted-foreground">Score ≥ 70</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summary?.atRiskOrganizations}</div>
            <p className="text-xs text-muted-foreground">Score &lt; 50</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary?.criticalOrganizations}</div>
            <p className="text-xs text-muted-foreground">Score &lt; 30</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={riskColors[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Issues */}
        <Card>
          <CardHeader>
            <CardTitle>Top Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary?.topIssues?.map((issue: any) => (
                <div key={issue.issue} className="flex items-center justify-between">
                  <span className="text-sm">{issue.issue}</span>
                  <Badge variant="outline">{issue.count} orgs</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* At-Risk Organizations */}
      <Card>
        <CardHeader>
          <CardTitle>Organizations Requiring Attention</CardTitle>
          <CardDescription>Organizations with health score &lt; 50</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {scores?.filter((s: any) => s.healthScore < 50).slice(0, 10).map((org: any) => (
              <div key={org.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{org.organizationName}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant={org.riskLevel === 'critical' ? 'error' : 'secondary'}>
                          {org.riskLevel}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Score: {org.healthScore}/100
                        </span>
                      </div>
                    </div>
                  </div>
                  {org.recommendations?.length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <strong>Recommendations:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {org.recommendations.slice(0, 2).map((rec: string, i: number) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center" style={{ borderColor: riskColors[org.riskLevel] }}>
                    <span className="text-lg font-bold">{org.healthScore}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Inactive Organizations */}
      <Card>
        <CardHeader>
          <CardTitle>Inactive Organizations</CardTitle>
          <CardDescription>No login in 30+ days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {inactive?.slice(0, 10).map((org: any) => (
              <div key={org.id} className="flex items-center justify-between p-2 border-b">
                <div>
                  <p className="font-medium">{org.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Last login: {org.daysSinceLastLogin} days ago • {org.tier} tier
                  </p>
                </div>
                <Badge variant="error">{org.daysSinceLastLogin} days</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

