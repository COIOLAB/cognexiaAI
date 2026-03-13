'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { DollarSign, Calendar, Plus, TrendingUp, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { getOpportunities } from '@/services/opportunity.api';
import { format } from 'date-fns';
import type { Opportunity } from '@/types/api.types';

interface CustomerOpportunitiesTabProps {
  customerId: string;
}

const stageColors: Record<string, string> = {
  prospecting: 'bg-gray-500',
  qualification: 'bg-blue-500',
  proposal: 'bg-yellow-500',
  negotiation: 'bg-orange-500',
  closed_won: 'bg-green-500',
  closed_lost: 'bg-red-500',
};

export function CustomerOpportunitiesTab({ customerId }: CustomerOpportunitiesTabProps) {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['customer-opportunities', customerId],
    queryFn: () => getOpportunities({ customerId, limit: 100 }),
    staleTime: 60000,
  });

  const opportunities = data?.data || [];

  // Calculate stats
  const stats = React.useMemo(() => {
    const total = opportunities.length;
    const totalValue = opportunities.reduce((sum, opp) => sum + (opp.amount || 0), 0);
    const totalWeighted = opportunities.reduce(
      (sum, opp) => sum + (opp.amount || 0) * (opp.probability || 0) / 100,
      0
    );
    const won = opportunities.filter((o) => o.stage === 'closed_won').length;
    const lost = opportunities.filter((o) => o.stage === 'closed_lost').length;
    const active = opportunities.filter(
      (o) => o.stage !== 'closed_won' && o.stage !== 'closed_lost'
    ).length;

    return { total, totalValue, totalWeighted, won, lost, active };
  }, [opportunities]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[100px]" />
          ))}
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Weighted: ${Number(stats.totalWeighted ?? 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(stats.active ?? 0)}</div>
            <p className="text-xs text-muted-foreground">
              {Number(stats.total ?? 0)} total opportunities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Won</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{Number(stats.won ?? 0)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0
                ? ((Number(stats.won ?? 0) / Number(stats.total ?? 0)) * 100).toFixed(1)
                : 0}
              % win rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lost</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{Number(stats.lost ?? 0)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0
                ? ((Number(stats.lost ?? 0) / Number(stats.total ?? 0)) * 100).toFixed(1)
                : 0}
              % loss rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Opportunities</h3>
          <p className="text-sm text-muted-foreground">
            Sales opportunities for this customer
          </p>
        </div>
        <Button onClick={() => router.push(`/opportunities/new?customerId=${customerId}`)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Opportunity
        </Button>
      </div>

      {/* Opportunities List */}
      {opportunities.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">No opportunities found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push(`/opportunities/new?customerId=${customerId}`)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create First Opportunity
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {opportunities.map((opportunity) => (
            <Card
              key={opportunity.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/opportunities/${opportunity.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{opportunity.name}</CardTitle>
                    <CardDescription className="mt-1">
                      ${Number(opportunity.amount ?? 0).toLocaleString()}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      opportunity.stage === 'closed_won'
                        ? 'default'
                        : opportunity.stage === 'closed_lost'
                        ? 'destructive'
                        : 'secondary'
                    }
                    className="capitalize"
                  >
                    {opportunity.stage?.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Probability Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Probability</span>
                    <span className="font-medium">{Number(opportunity.probability ?? 0)}%</span>
                  </div>
                  <Progress value={Number(opportunity.probability ?? 0)} className="h-2" />
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  {opportunity.expectedCloseDate && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Close: {format(new Date(opportunity.expectedCloseDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                  {opportunity.description && (
                    <p className="text-muted-foreground line-clamp-2">
                      {opportunity.description}
                    </p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/opportunities/${opportunity.id}`);
                  }}
                >
                  View Details
                  <ExternalLink className="ml-2 h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
