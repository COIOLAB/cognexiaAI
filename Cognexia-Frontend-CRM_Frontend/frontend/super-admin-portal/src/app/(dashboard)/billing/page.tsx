'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBillingMetrics, useTransactions } from '@/hooks/use-billing';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, TrendingUp, CreditCard, FileText, Building2 } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function BillingPage() {
  const router = useRouter();
  const { data: metrics, isLoading: metricsLoading } = useBillingMetrics();
  const { data: transactions } = useTransactions({ limit: 10 });

  if (metricsLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Billing & Revenue</h1>
          <p className="text-gray-500">Financial overview and transaction history</p>
        </div>
        <Button onClick={() => router.push('/billing/enterprise')} variant="outline">
          <Building2 className="h-4 w-4 mr-2" />
          Enterprise Payments
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Gateway Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">

          {metrics && (
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">MRR</CardTitle>
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(metrics.monthlyRecurringRevenue)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                  <CreditCard className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(metrics.totalTransactions)}</div>
                  <p className="text-xs text-green-600 mt-1">
                    {metrics.successfulTransactions} successful
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">

          <Card>
            <CardHeader>
              <CardTitle>Recent Gateway Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions?.data.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No transactions yet</p>
              ) : (
                <div className="space-y-4">
                  {transactions?.data.map((txn) => (
                    <div key={txn.id} className="flex items-center justify-between border-b pb-4">
                      <div>
                        <p className="font-medium">{txn.organization?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{txn.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(txn.amount)}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(txn.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

