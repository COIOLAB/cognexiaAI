'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart2, TrendingUp, TrendingDown, Phone, Clock, Users } from 'lucide-react';
import { useGetCallAnalytics } from '@/hooks/useCalls';
import { PageHeader } from '@/components/PageHeader';
import { toast } from 'sonner';

export default function CallAnalyticsPage() {
  const [dateRange] = useState<{ start?: string; end?: string }>({});
  const { data: analytics, isLoading } = useGetCallAnalytics(dateRange.start, dateRange.end);

  const handleExport = () => {
    if (!analytics) {
      toast.error('No analytics data to export');
      return;
    }
    const rows = [
      ['Metric', 'Value'],
      ['Total Calls', analytics.totalCalls],
      ['Inbound Calls', analytics.inboundCalls],
      ['Outbound Calls', analytics.outboundCalls],
      ['Answered Calls', analytics.answeredCalls],
      ['Missed Calls', analytics.missedCalls],
      ['Average Duration (sec)', analytics.averageDuration],
      ['Average Wait Time (sec)', analytics.averageWaitTime],
      ['Average Talk Time (sec)', analytics.averageTalkTime],
      ['Answer Rate (%)', analytics.answerRate],
      ['Miss Rate (%)', analytics.missRate],
    ];
    const csv = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'call-analytics.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    toast.success('Export downloaded');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Call Analytics"
        subtitle="Insights and performance metrics"
        actions={
          <Button variant="outline" onClick={handleExport}>
            Export Report
          </Button>
        }
      />

      {isLoading ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">Loading analytics...</CardContent>
        </Card>
      ) : !analytics ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">No analytics data available</CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
                <Phone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalCalls}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.inboundCalls} inbound, {analytics.outboundCalls} outbound
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Answer Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.answerRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.answeredCalls} answered
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Missed Calls</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.missedCalls}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.missRate.toFixed(1)}% miss rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.floor(analytics.averageDuration / 60)}:
                  {(analytics.averageDuration % 60).toString().padStart(2, '0')}
                </div>
                <p className="text-xs text-muted-foreground mt-1">minutes</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Call Volume by Hour</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.callsByHour && analytics.callsByHour.length > 0 ? (
                  <div className="space-y-2">
                    {analytics.callsByHour.map((hourData: any) => (
                      <div key={hourData.hour} className="flex items-center gap-4">
                        <div className="text-sm font-medium w-16">{hourData.hour}:00</div>
                        <div className="flex-1">
                          <div className="h-8 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all flex items-center justify-end pr-2"
                              style={{
                                width: `${
                                  (hourData.count /
                                    Math.max(...analytics.callsByHour.map((h: any) => h.count))) *
                                  100
                                }%`,
                              }}
                            >
                              <span className="text-xs text-primary-foreground font-medium">
                                {hourData.count}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No hourly data</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Agents</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.topAgents && analytics.topAgents.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.topAgents.slice(0, 5).map((agent: any, index: number) => (
                      <div key={agent.agentId} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-sm font-semibold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{agent.agentName}</div>
                            <div className="text-sm text-muted-foreground">
                              {agent.callCount} calls
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {Math.floor(agent.avgDuration / 60)}:
                            {(agent.avgDuration % 60).toString().padStart(2, '0')}
                          </div>
                          <div className="text-xs text-muted-foreground">avg duration</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No agent data</div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Call Disposition Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.dispositionBreakdown && Object.keys(analytics.dispositionBreakdown).length > 0 ? (
                <div className="grid gap-3 md:grid-cols-3">
                  {Object.entries(analytics.dispositionBreakdown).map(([disposition, count]) => (
                    <div key={disposition} className="p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{count as number}</div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {disposition.replace(/_/g, ' ').toLowerCase()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No disposition data</div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
