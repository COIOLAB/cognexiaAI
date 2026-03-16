'use client';

import { useQuery } from '@tanstack/react-query';
import { abTestingAPI } from '@/lib/api/super-admin-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FlaskConical } from 'lucide-react';

export default function ABTestingPage() {
  const { data: tests } = useQuery({
    queryKey: ['ab-tests'],
    queryFn: () => abTestingAPI.getAllTests(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">A/B Testing</h1>
        <Button><FlaskConical className="h-4 w-4 mr-2" />Create Test</Button>
      </div>

      <div className="grid gap-4">
        {tests?.map((test: any) => (
          <Card key={test.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{test.name}</CardTitle>
                <Badge variant={test.status === 'running' ? 'default' : 'secondary'}>
                  {test.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{test.description}</p>
              <div className="flex gap-2">
                {test.variants?.map((variant: any) => (
                  <div key={variant.id} className="flex-1 p-3 border rounded-lg text-center">
                    <p className="font-medium">{variant.name}</p>
                    <p className="text-sm text-muted-foreground">{variant.trafficPercent}% traffic</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

