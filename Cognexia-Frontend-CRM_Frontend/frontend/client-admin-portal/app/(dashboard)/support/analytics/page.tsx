'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supportAnalyticsApi } from '@/services/supportAnalytics.api';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/PageHeader';
import { KpiCard } from '@/components/KpiCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function SupportAnalyticsPage() {
  const { data: analytics } = useQuery({
    queryKey: ['support-analytics'],
    queryFn: () => supportAnalyticsApi.getAnalytics(),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support Analytics"
        subtitle="Monitor SLA performance, ticket volume, and agent efficiency."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard title="Total Tickets" value={analytics?.ticketStats?.total || 0} />
        <KpiCard
          title="Resolved"
          value={<span className="text-green-600">{analytics?.ticketStats?.resolved || 0}</span>}
        />
        <KpiCard
          title="Avg Resolution Time"
          value={`${analytics?.ticketStats?.avgResolutionTime?.toFixed(0) || '0'}m`}
        />
        <KpiCard
          title="SLA Compliance"
          value={`${analytics?.slaMetrics?.complianceRate?.toFixed(1) || '0.0'}%`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agent Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics?.agentPerformance?.length ? (
            <div className="rounded-md border bg-background">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Tickets</TableHead>
                    <TableHead>Resolution Time</TableHead>
                    <TableHead>Satisfaction</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.agentPerformance.map((agent: any, index: number) => (
                    <TableRow key={agent.id || index}>
                      <TableCell className="font-medium">{agent.name || 'Agent'}</TableCell>
                      <TableCell>{agent.ticketsResolved || agent.totalTickets || 0}</TableCell>
                      <TableCell>
                        {agent.avgResolutionTime ? `${agent.avgResolutionTime}m` : '—'}
                      </TableCell>
                      <TableCell>
                        {agent.avgRating ? `${agent.avgRating.toFixed(1)}/5` : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No agent performance data yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
