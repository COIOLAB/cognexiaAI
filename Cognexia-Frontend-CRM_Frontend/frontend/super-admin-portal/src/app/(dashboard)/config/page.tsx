'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { systemConfigAPI } from '@/lib/api/super-admin-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { toast } from 'react-hot-toast';
import { Settings, Flag } from 'lucide-react';

export default function SystemConfigPage() {
  const queryClient = useQueryClient();

  const { data: configs } = useQuery({
    queryKey: ['system-config', 'configs'],
    queryFn: () => systemConfigAPI.getAllConfigs(),
  });

  const { data: featureFlags } = useQuery({
    queryKey: ['system-config', 'feature-flags'],
    queryFn: () => systemConfigAPI.getAllFeatureFlags(),
  });

  const updateConfigMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      systemConfigAPI.updateConfig(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-config'] });
      toast.success('Configuration updated');
    },
  });

  const updateFlagMutation = useMutation({
    mutationFn: ({ id, enabled, rolloutPercentage }: any) =>
      systemConfigAPI.updateFeatureFlag(id, { enabled, rolloutPercentage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-config'] });
      toast.success('Feature flag updated');
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Configuration</h1>
        <p className="text-muted-foreground">Manage system settings and feature flags</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Configurations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {configs?.map((config: any) => (
              <div key={config.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label className="font-medium">{config.key}</Label>
                  <p className="text-xs text-muted-foreground">{config.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    defaultValue={config.value}
                    onBlur={(e) => {
                      if (e.target.value !== config.value) {
                        updateConfigMutation.mutate({ key: config.key, value: e.target.value });
                      }
                    }}
                    className="w-32"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Feature Flags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {featureFlags?.map((flag: any) => (
              <div key={flag.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">{flag.name}</Label>
                    <p className="text-sm text-muted-foreground">{flag.description}</p>
                  </div>
                  <Switch
                    checked={flag.enabled}
                    onCheckedChange={(enabled) =>
                      updateFlagMutation.mutate({ id: flag.id, enabled, rolloutPercentage: flag.rolloutPercentage })
                    }
                  />
                </div>
                {flag.enabled && (
                  <div>
                    <Label className="text-sm">Rollout: {flag.rolloutPercentage}%</Label>
                    <Slider
                      value={[flag.rolloutPercentage]}
                      onValueChange={([rolloutPercentage]) =>
                        updateFlagMutation.mutate({ id: flag.id, enabled: flag.enabled, rolloutPercentage })
                      }
                      max={100}
                      step={5}
                      className="mt-2"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

