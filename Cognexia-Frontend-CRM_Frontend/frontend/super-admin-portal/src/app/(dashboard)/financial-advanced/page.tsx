'use client';

import { useQuery } from '@tanstack/react-query';
import { financialAdvancedAPI } from '@/lib/api/super-admin-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function FinancialAdvancedPage() {
  const { data: cohorts } = useQuery({
    queryKey: ['financial', 'cohorts'],
    queryFn: () => financialAdvancedAPI.getCohortAnalysis(),
  });

  const { data: waterfall } = useQuery({
    queryKey: ['financial', 'waterfall'],
    queryFn: () => financialAdvancedAPI.getRevenueWaterfall('monthly'),
  });

  const { data: unitEconomics } = useQuery({
    queryKey: ['financial', 'unit-economics'],
    queryFn: () => financialAdvancedAPI.getUnitEconomics(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-8 w-8 text-green-500" />
        <h1 className="text-3xl font-bold">Advanced Financial Analytics</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">LTV</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">${unitEconomics?.ltv?.toLocaleString() || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">CAC</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">${unitEconomics?.cac?.toLocaleString() || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">LTV:CAC Ratio</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{unitEconomics?.ltv_cac_ratio || 0}x</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Gross Margin</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{unitEconomics?.gross_margin || 0}%</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Waterfall</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-lg">
            <div className="flex justify-between"><span>Starting MRR:</span><span className="font-bold">${waterfall?.starting_mrr?.toLocaleString()}</span></div>
            <div className="flex justify-between text-green-600"><span>+ New Business:</span><span>+${waterfall?.new_business?.toLocaleString()}</span></div>
            <div className="flex justify-between text-green-600"><span>+ Expansion:</span><span>+${waterfall?.expansion?.toLocaleString()}</span></div>
            <div className="flex justify-between text-red-600"><span>- Contraction:</span><span>-${Math.abs(waterfall?.contraction || 0).toLocaleString()}</span></div>
            <div className="flex justify-between text-red-600"><span>- Churn:</span><span>-${Math.abs(waterfall?.churn || 0).toLocaleString()}</span></div>
            <div className="border-t pt-2 flex justify-between font-bold"><span>Ending MRR:</span><span>${waterfall?.ending_mrr?.toLocaleString()}</span></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cohort Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cohorts?.slice(0, 12)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cohort_name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="retention_rate" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

