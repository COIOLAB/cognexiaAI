'use client';

import { useSalesQuotas, useTeamPerformance } from '@/hooks/useSalesAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { KpiCard } from '@/components/KpiCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function TeamPerformancePage() {
  const { data: quotasData, isLoading: quotasLoading } = useSalesQuotas();
  const { data: performanceData, isLoading: performanceLoading } = useTeamPerformance();

  if (quotasLoading || performanceLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Team Performance" subtitle="Track sales team metrics and quota achievement" />
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  const quotas = quotasData?.data;
  const performance = performanceData?.data;
  const individualQuotas = Array.isArray(quotas?.individualQuotas) ? quotas.individualQuotas : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Performance"
        subtitle="Track sales team metrics and quota achievement"
      />

      {quotas ? (
        <>
          <div className="grid gap-6 md:grid-cols-3">
            <KpiCard
              title="Team Quota"
              value={`$${(Number(quotas.teamQuota ?? 0) / 1000000).toFixed(1)}M`}
              icon={<Target className="h-4 w-4 text-muted-foreground" />}
            />
            <KpiCard
              title="Achievement"
              value={`$${(Number(quotas.currentAchievement ?? 0) / 1000000).toFixed(1)}M`}
            />
            <KpiCard
              title="Achievement Rate"
              value={<span className="text-green-600">{Number(quotas.achievementRate ?? 0)}%</span>}
              icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2" />
                Sales Rep Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {individualQuotas
                  .slice()
                  .sort((a, b) => Number(b.rate ?? 0) - Number(a.rate ?? 0))
                  .map((rep, index) => (
                    <div key={rep.salesRepId} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-medium">{rep.name}</div>
                            <div className="text-sm text-muted-foreground">
                              ${Number(rep.achievement ?? 0).toLocaleString()} / $
                              {Number(rep.quota ?? 0).toLocaleString()}
                            </div>
                          </div>
                          <Badge
                            variant={rep.rate >= 100 ? 'default' : rep.rate >= 80 ? 'secondary' : 'outline'}
                            className={
                              rep.rate >= 100
                                ? 'bg-green-100 text-green-800'
                                : rep.rate >= 80
                                ? 'bg-blue-100 text-blue-800'
                                : ''
                            }
                          >
                            {Number(rep.rate ?? 0)}%
                          </Badge>
                        </div>
                        <Progress value={Math.min(Number(rep.rate ?? 0), 100)} />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-sm text-muted-foreground">No quota data yet.</div>
      )}

      {performance && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(Number(performance.totalRevenue ?? 0) / 1000000).toFixed(2)}M
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Total Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Number(performance.totalDeals ?? 0)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Avg Deal Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${Number(performance.avgDealSize ?? 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
