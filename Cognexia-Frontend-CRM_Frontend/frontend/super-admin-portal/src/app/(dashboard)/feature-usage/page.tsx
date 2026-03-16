'use client';

import { useQuery } from '@tanstack/react-query';
import { featureUsageAPI } from '@/lib/api/super-admin-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function FeatureUsagePage() {
  const { data: adoptionRates } = useQuery({
    queryKey: ['feature-usage', 'adoption'],
    queryFn: () => featureUsageAPI.getAdoptionRates(),
  });

  const { data: usageByTier } = useQuery({
    queryKey: ['feature-usage', 'by-tier'],
    queryFn: () => featureUsageAPI.getUsageByTier(),
  });

  const { data: userJourney } = useQuery({
    queryKey: ['feature-usage', 'journey'],
    queryFn: () => featureUsageAPI.getUserJourney(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Feature Usage Analytics</h1>
        <p className="text-muted-foreground">Track feature adoption and user engagement</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feature Adoption Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {adoptionRates?.features?.map((feature: any) => (
              <div key={feature.name}>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{feature.name}</span>
                  <span className="text-sm">{feature.adoptionRate}%</span>
                </div>
                <Progress value={feature.adoptionRate} />
                <p className="text-xs text-muted-foreground mt-1">
                  {feature.activeUsers} of {feature.totalUsers} users
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Journey Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={userJourney?.featureFunnel} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="step" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="users" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

