'use client';

import { useQuery } from '@tanstack/react-query';
import { mobileAdminAPI } from '@/lib/api/super-admin-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, Bell } from 'lucide-react';

export default function MobileAdminPage() {
  const { data: stats } = useQuery({
    queryKey: ['mobile', 'stats'],
    queryFn: () => mobileAdminAPI.getStats(),
  });

  const { data: templates } = useQuery({
    queryKey: ['mobile', 'templates'],
    queryFn: () => mobileAdminAPI.getTemplates(),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Mobile Admin</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Total Downloads</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.totalDownloads}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Active Users</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.activeUsers}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">iOS</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.platform?.ios}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Android</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.platform?.android}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Push Notifications</CardTitle>
            <Button><Bell className="h-4 w-4 mr-2" />Send Notification</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {templates?.map((template: any) => (
              <div key={template.id} className="p-3 border rounded-lg">
                <p className="font-medium">{template.title}</p>
                <p className="text-sm text-muted-foreground">{template.body}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

