'use client';

import { useQuery } from '@tanstack/react-query';
import { supportAnalyticsAdvancedAPI } from '@/lib/api/super-admin-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Headphones } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SupportAnalyticsAdvancedPage() {
  const { data: overview } = useQuery({
    queryKey: ['support-analytics', 'overview'],
    queryFn: () => supportAnalyticsAdvancedAPI.getOverview(),
  });

  const { data: sentiment } = useQuery({
    queryKey: ['support-analytics', 'sentiment'],
    queryFn: () => supportAnalyticsAdvancedAPI.getSentimentTrends(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Headphones className="h-8 w-8 text-blue-500" />
        <h1 className="text-3xl font-bold">Advanced Support Analytics</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Total Tickets</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{overview?.total_tickets || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Avg First Response</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{overview?.avg_first_response?.toFixed(0) || 0}min</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Avg Resolution</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{overview?.avg_resolution_time?.toFixed(0) || 0}min</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">CSAT Score</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{overview?.avg_csat?.toFixed(1) || 0}/5</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sentiment Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sentiment}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sentiment.positive" stroke="#10b981" name="Positive" />
              <Line type="monotone" dataKey="sentiment.neutral" stroke="#94a3b8" name="Neutral" />
              <Line type="monotone" dataKey="sentiment.negative" stroke="#ef4444" name="Negative" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

