'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { revenueBillingAPI } from '@/lib/api/super-admin-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, RefreshCcw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function RevenuePage() {
  const queryClient = useQueryClient();

  const { data: overview } = useQuery({
    queryKey: ['revenue', 'overview'],
    queryFn: () => revenueBillingAPI.getOverview(),
  });

  const { data: churnAnalysis } = useQuery({
    queryKey: ['revenue', 'churn'],
    queryFn: () => revenueBillingAPI.getChurnAnalysis(),
  });

  const { data: transactions } = useQuery({
    queryKey: ['revenue', 'transactions'],
    queryFn: () => revenueBillingAPI.getTransactions(),
  });

  const { data: failedPayments } = useQuery({
    queryKey: ['revenue', 'failed-payments'],
    queryFn: () => revenueBillingAPI.getFailedPayments(),
  });

  const retryPaymentMutation = useMutation({
    mutationFn: revenueBillingAPI.retryPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revenue'] });
      toast.success('Payment retry initiated');
    },
    onError: () => toast.error('Failed to retry payment'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Revenue & Billing</h1>
        <p className="text-muted-foreground">Financial metrics and transaction management</p>
      </div>

      {/* Revenue Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overview?.mrr?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Monthly Recurring Revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ARR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overview?.arr?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Annual Recurring Revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.churnRate}%</div>
            <p className="text-xs text-muted-foreground">
              {overview?.churnRate < 3 ? 'Healthy' : 'Action needed'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.failedPayments}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Churn Analysis Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Churn Trend Analysis</CardTitle>
          <CardDescription>Monthly churn rate over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={churnAnalysis?.churnTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="churnRate" stroke="#ef4444" name="Churn Rate %" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-4">
            <h4 className="font-semibold mb-2">Top Churn Reasons:</h4>
            <div className="space-y-2">
              {churnAnalysis?.churnReasons?.map((reason: any) => (
                <div key={reason.reason} className="flex items-center justify-between text-sm">
                  <span>{reason.reason}</span>
                  <Badge variant="outline">{reason.count} orgs</Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Failed Payments */}
      {failedPayments && failedPayments.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Failed Payments Requiring Action</CardTitle>
            <CardDescription>{failedPayments.length} payments need to be retried</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {failedPayments.map((payment: any) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{payment.organizationName}</p>
                    <p className="text-sm text-muted-foreground">${payment.amount}</p>
                    <p className="text-xs text-red-500">{payment.failureReason}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => retryPaymentMutation.mutate(payment.id)}
                    disabled={retryPaymentMutation.isPending}
                  >
                    <RefreshCcw className="h-4 w-4 mr-1" />
                    Retry
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revenue by Tier */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Breakdown by Tier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(overview?.revenueByTier || {}).map(([tier, amount]: [string, any]) => (
              <div key={tier}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium capitalize">{tier} Tier</span>
                  <span className="font-bold">${amount?.toLocaleString()}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{
                      width: `${(amount / Math.max(...(Object.values(overview?.revenueByTier || {}) as number[]))) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {transactions?.slice(0, 10).map((txn: any) => (
              <div key={txn.id} className="flex items-center justify-between p-2 border-b">
                <div>
                  <p className="font-medium">{txn.organization?.name}</p>
                  <p className="text-sm text-muted-foreground">{txn.type}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${txn.amount}</p>
                  <Badge
                    variant={txn.status === 'completed' ? 'success' : txn.status === 'failed' ? 'error' : 'secondary'}
                  >
                    {txn.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

