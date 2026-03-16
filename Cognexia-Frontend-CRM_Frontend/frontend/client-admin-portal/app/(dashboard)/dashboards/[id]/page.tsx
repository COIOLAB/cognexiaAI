'use client';

import { useParams } from 'next/navigation';
import { ArrowLeft, Edit, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGetDashboard } from '@/hooks/useDashboards';
import { DashboardType } from '@/types/api.types';
import Link from 'next/link';

const dashboardTypeLabels: Record<DashboardType, string> = {
  [DashboardType.PERSONAL]: 'Personal',
  [DashboardType.TEAM]: 'Team',
  [DashboardType.ORGANIZATIONAL]: 'Organizational',
  [DashboardType.EXECUTIVE]: 'Executive',
};

export default function DashboardViewPage() {
  const params = useParams();
  const dashboardId = params.id as string;

  const { data: dashboard, isLoading, refetch } = useGetDashboard(dashboardId);

  if (isLoading) return <div>Loading...</div>;
  if (!dashboard) return <div>Dashboard not found</div>;

  const gridCols = 12;
  const rowHeight = 80;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboards">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{dashboard.name}</h1>
              <Badge>{dashboardTypeLabels[dashboard.type]}</Badge>
              {dashboard.isDefault && (
                <Badge variant="outline">Default</Badge>
              )}
            </div>
            {dashboard.description && (
              <p className="text-muted-foreground">{dashboard.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboards/builder?id=${dashboardId}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="relative">
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
          }}
        >
          {dashboard.widgets.map((widget) => (
            <Card
              key={widget.id}
              style={{
                gridColumn: `span ${widget.layout.width}`,
                gridRow: `span ${Math.ceil(widget.layout.height)}`,
                minHeight: `${widget.layout.height * rowHeight}px`,
              }}
            >
              <CardHeader>
                <CardTitle className="text-base">{widget.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-full min-h-[120px] border-2 border-dashed rounded">
                  <div className="text-center text-muted-foreground">
                    <p className="font-medium">{widget.type}</p>
                    {widget.chartType && (
                      <p className="text-sm">{widget.chartType} chart</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {dashboard.widgets.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                This dashboard has no widgets yet.
              </p>
              <Button asChild>
                <Link href={`/dashboards/builder?id=${dashboardId}`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Add Widgets
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
