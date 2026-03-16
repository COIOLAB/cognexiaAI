'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Plus, Save, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  useGetDashboard,
  useCreateDashboard,
  useUpdateDashboard,
} from '@/hooks/useDashboards';
import { DashboardType, WidgetType, ChartType } from '@/types/api.types';
import type { DashboardWidget } from '@/types/api.types';
import Link from 'next/link';

export default function DashboardBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dashboardId = searchParams.get('id');

  const { data: existingDashboard } = useGetDashboard(dashboardId || '');
  const createDashboard = useCreateDashboard();
  const updateDashboard = useUpdateDashboard();

  const [name, setName] = useState(existingDashboard?.name || '');
  const [description, setDescription] = useState(
    existingDashboard?.description || ''
  );
  const [type, setType] = useState<DashboardType>(
    existingDashboard?.type || DashboardType.PERSONAL
  );
  const [isPublic, setIsPublic] = useState(existingDashboard?.isPublic || false);
  const [isDefault, setIsDefault] = useState(
    existingDashboard?.isDefault || false
  );
  const [widgets, setWidgets] = useState<DashboardWidget[]>(
    existingDashboard?.widgets || []
  );
  const [selectedWidget, setSelectedWidget] = useState<DashboardWidget | null>(
    null
  );

  const handleAddWidget = () => {
    const newWidget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      title: 'New Widget',
      type: WidgetType.CHART,
      chartType: ChartType.LINE,
      dataSource: {},
      layout: {
        x: 0,
        y: widgets.length * 4,
        width: 6,
        height: 4,
      },
    };
    setWidgets([...widgets, newWidget]);
    setSelectedWidget(newWidget);
  };

  const handleUpdateWidget = (updatedWidget: DashboardWidget) => {
    setWidgets(
      widgets.map((w) => (w.id === updatedWidget.id ? updatedWidget : w))
    );
    setSelectedWidget(updatedWidget);
  };

  const handleRemoveWidget = (widgetId: string) => {
    setWidgets(widgets.filter((w) => w.id !== widgetId));
    setSelectedWidget(null);
  };

  const handleSave = async () => {
    const dashboardData = {
      name,
      description,
      type,
      widgets,
      isPublic,
      isDefault,
    };

    if (dashboardId) {
      updateDashboard.mutate(
        { id: dashboardId, data: dashboardData },
        {
          onSuccess: () => router.push('/dashboards'),
        }
      );
    } else {
      createDashboard.mutate(dashboardData, {
        onSuccess: () => router.push('/dashboards'),
      });
    }
  };

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
            <h1 className="text-3xl font-bold">Dashboard Builder</h1>
            <p className="text-muted-foreground">
              {dashboardId ? 'Edit dashboard' : 'Create a new dashboard'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={dashboardId ? `/dashboards/preview?id=${dashboardId}` : '/dashboards/preview'}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Link>
          </Button>
          <Button onClick={handleSave} disabled={!name || widgets.length === 0}>
            <Save className="mr-2 h-4 w-4" />
            Save Dashboard
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Configuration Panel */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Dashboard Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dashboard name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Dashboard description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as DashboardType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DashboardType.PERSONAL}>Personal</SelectItem>
                  <SelectItem value={DashboardType.TEAM}>Team</SelectItem>
                  <SelectItem value={DashboardType.ORGANIZATIONAL}>
                    Organizational
                  </SelectItem>
                  <SelectItem value={DashboardType.EXECUTIVE}>
                    Executive
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="public">Public Dashboard</Label>
              <Switch
                id="public"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="default">Set as Default</Label>
              <Switch
                id="default"
                checked={isDefault}
                onCheckedChange={setIsDefault}
              />
            </div>

            <div className="pt-4 border-t">
              <Label className="text-sm font-medium mb-2 block">Widgets</Label>
              <Button onClick={handleAddWidget} className="w-full" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Widget
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Widget List & Configuration */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Widgets ({widgets.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {widgets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  No widgets added yet. Click "Add Widget" to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {widgets.map((widget) => (
                  <div
                    key={widget.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedWidget?.id === widget.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-accent'
                    }`}
                    onClick={() => setSelectedWidget(widget)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{widget.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {widget.type} • {widget.chartType || 'N/A'} •{' '}
                          {widget.layout.width}x{widget.layout.height}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveWidget(widget.id);
                        }}
                      >
                        Remove
                      </Button>
                    </div>

                    {selectedWidget?.id === widget.id && (
                      <div className="mt-4 pt-4 border-t space-y-3">
                        <div className="space-y-2">
                          <Label>Widget Title</Label>
                          <Input
                            value={widget.title}
                            onChange={(e) =>
                              handleUpdateWidget({
                                ...widget,
                                title: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                              value={widget.type}
                              onValueChange={(value) =>
                                handleUpdateWidget({
                                  ...widget,
                                  type: value as WidgetType,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={WidgetType.CHART}>
                                  Chart
                                </SelectItem>
                                <SelectItem value={WidgetType.TABLE}>
                                  Table
                                </SelectItem>
                                <SelectItem value={WidgetType.METRIC}>
                                  Metric
                                </SelectItem>
                                <SelectItem value={WidgetType.LIST}>List</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {widget.type === WidgetType.CHART && (
                            <div className="space-y-2">
                              <Label>Chart Type</Label>
                              <Select
                                value={widget.chartType}
                                onValueChange={(value) =>
                                  handleUpdateWidget({
                                    ...widget,
                                    chartType: value as ChartType,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={ChartType.LINE}>Line</SelectItem>
                                  <SelectItem value={ChartType.BAR}>Bar</SelectItem>
                                  <SelectItem value={ChartType.PIE}>Pie</SelectItem>
                                  <SelectItem value={ChartType.AREA}>Area</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                          <div className="space-y-2">
                            <Label>Width</Label>
                            <Input
                              type="number"
                              min="1"
                              max="12"
                              value={widget.layout.width}
                              onChange={(e) =>
                                handleUpdateWidget({
                                  ...widget,
                                  layout: {
                                    ...widget.layout,
                                    width: parseInt(e.target.value),
                                  },
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Height</Label>
                            <Input
                              type="number"
                              min="1"
                              value={widget.layout.height}
                              onChange={(e) =>
                                handleUpdateWidget({
                                  ...widget,
                                  layout: {
                                    ...widget.layout,
                                    height: parseInt(e.target.value),
                                  },
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>X</Label>
                            <Input
                              type="number"
                              min="0"
                              max="11"
                              value={widget.layout.x}
                              onChange={(e) =>
                                handleUpdateWidget({
                                  ...widget,
                                  layout: {
                                    ...widget.layout,
                                    x: parseInt(e.target.value),
                                  },
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Y</Label>
                            <Input
                              type="number"
                              min="0"
                              value={widget.layout.y}
                              onChange={(e) =>
                                handleUpdateWidget({
                                  ...widget,
                                  layout: {
                                    ...widget.layout,
                                    y: parseInt(e.target.value),
                                  },
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
