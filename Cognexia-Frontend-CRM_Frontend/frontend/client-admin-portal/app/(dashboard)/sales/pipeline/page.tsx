'use client';

import { useSalesPipeline } from '@/hooks/useSalesAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { KpiCard } from '@/components/KpiCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function SalesPipelinePage() {
  const { data, isLoading } = useSalesPipeline();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Sales Pipeline" subtitle="Track deals through your sales process" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const pipeline = data?.data;

  return (
    <div className="space-y-6">
      <PageHeader title="Sales Pipeline" subtitle="Track deals through your sales process" />

      {pipeline ? (
        <>
          <div className="grid gap-6 md:grid-cols-3">
            <KpiCard
              title="Total Pipeline Value"
              value={`$${(Number(pipeline.totalPipelineValue ?? 0) / 1000000).toFixed(2)}M`}
              icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
            />
            <KpiCard
              title="Weighted Value"
              value={`$${(Number(pipeline.weightedPipelineValue ?? 0) / 1000000).toFixed(2)}M`}
              icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
            />
            <KpiCard
              title="Avg Sales Cycle"
              value={`${Number(pipeline.avgSalesCycle ?? 0)} days`}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pipeline Stages</CardTitle>
            </CardHeader>
            <CardContent>
              {pipeline.stages?.length ? (
                <div className="space-y-6">
                  {pipeline.stages.map((stage, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{stage.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {Number(stage.opportunities ?? 0)} opportunities • $
                            {(Number(stage.value ?? 0) / 1000000).toFixed(2)}M
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {Number(stage.avgProbability ?? 0)}%
                          </div>
                          <div className="text-sm text-muted-foreground">probability</div>
                        </div>
                      </div>
                      <Progress value={Number(stage.avgProbability ?? 0)} className="h-3" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No pipeline stages yet.</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conversion Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Prospecting → Qualification</span>
                    <span className="font-semibold">
                      {Number(pipeline.conversionRates?.prospectingToQualification ?? 0)}%
                    </span>
                  </div>
                  <Progress value={Number(pipeline.conversionRates?.prospectingToQualification ?? 0)} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Qualification → Proposal</span>
                    <span className="font-semibold">
                      {Number(pipeline.conversionRates?.qualificationToProposal ?? 0)}%
                    </span>
                  </div>
                  <Progress value={Number(pipeline.conversionRates?.qualificationToProposal ?? 0)} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Proposal → Negotiation</span>
                    <span className="font-semibold">
                      {Number(pipeline.conversionRates?.proposalToNegotiation ?? 0)}%
                    </span>
                  </div>
                  <Progress value={Number(pipeline.conversionRates?.proposalToNegotiation ?? 0)} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Negotiation → Closed</span>
                    <span className="font-semibold">
                      {Number(pipeline.conversionRates?.negotiationToClosed ?? 0)}%
                    </span>
                  </div>
                  <Progress value={Number(pipeline.conversionRates?.negotiationToClosed ?? 0)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-sm text-muted-foreground">No pipeline data yet.</div>
      )}
    </div>
  );
}
