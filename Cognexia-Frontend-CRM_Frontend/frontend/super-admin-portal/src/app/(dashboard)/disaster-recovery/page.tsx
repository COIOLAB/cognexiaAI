'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { disasterRecoveryAPI } from '@/lib/api/super-admin-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { HardDrive, Download } from 'lucide-react';

export default function DisasterRecoveryPage() {
  const queryClient = useQueryClient();

  const { data: backups } = useQuery({
    queryKey: ['backups'],
    queryFn: () => disasterRecoveryAPI.getBackups(),
  });

  const { data: stats } = useQuery({
    queryKey: ['backups', 'stats'],
    queryFn: () => disasterRecoveryAPI.getStats(),
  });

  const createBackupMutation = useMutation({
    mutationFn: disasterRecoveryAPI.createBackup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] });
      toast.success('Backup initiated');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HardDrive className="h-8 w-8 text-blue-500" />
          <h1 className="text-3xl font-bold">Disaster Recovery</h1>
        </div>
        <Button onClick={() => createBackupMutation.mutate('full')}>
          <Download className="h-4 w-4 mr-2" />
          Create Backup
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Total Backups</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.total_backups || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Completed</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{stats?.completed || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Total Size</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.total_size_gb?.toFixed(2) || 0} GB</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Avg Duration</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.avg_duration_seconds || 0}s</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {backups?.map((backup: any) => (
              <div key={backup.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{backup.backup_type}</Badge>
                    <Badge variant={backup.status === 'completed' ? 'default' : 'secondary'}>
                      {backup.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {backup.backup_size_mb} MB • {new Date(backup.created_at).toLocaleString()}
                  </p>
                </div>
                <Button size="sm" variant="outline">Restore</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

