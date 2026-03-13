'use client';

import { useQuery } from '@tanstack/react-query';
import { multiRegionAPI } from '@/lib/api/super-admin-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe } from 'lucide-react';

export default function MultiRegionPage() {
  const { data: regions } = useQuery({
    queryKey: ['multi-region', 'organizations'],
    queryFn: () => multiRegionAPI.getOrganizationsByRegion(),
  });

  const { data: compliance } = useQuery({
    queryKey: ['multi-region', 'compliance'],
    queryFn: () => multiRegionAPI.getRegionalCompliance(),
  });

  const { data: performance } = useQuery({
    queryKey: ['multi-region', 'performance'],
    queryFn: () => multiRegionAPI.getRegionalPerformance(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Globe className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Multi-Region Management</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {regions?.map((region: any) => (
          <Card key={region.region}>
            <CardHeader>
              <CardTitle className="text-base">{region.region}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><span className="font-medium">{region.organizationCount}</span> organizations</p>
                <p><span className="font-medium">{region.activeUsers}</span> active users</p>
                <p><span className="font-medium">${region.totalRevenue}</span> monthly revenue</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Regional Compliance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {compliance?.map((item: any) => (
              <div key={item.region} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{item.region}</p>
                  <p className="text-sm text-muted-foreground">Data Residency: {item.dataResidency}</p>
                </div>
                <Badge variant={item.gdprCompliant ? 'success' : 'error'}>
                  {item.gdprCompliant ? 'GDPR Compliant' : 'Non-Compliant'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

