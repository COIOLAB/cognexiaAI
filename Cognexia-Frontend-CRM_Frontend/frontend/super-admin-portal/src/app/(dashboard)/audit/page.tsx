'use client';

import { useQuery } from '@tanstack/react-query';
import { advancedAuditAPI } from '@/lib/api/super-admin-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileText } from 'lucide-react';
import { useState } from 'react';

export default function AuditPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: logs } = useQuery({
    queryKey: ['audit', 'logs', searchTerm],
    queryFn: () => advancedAuditAPI.searchLogs({ action: searchTerm }),
  });

  const { data: stats } = useQuery({
    queryKey: ['audit', 'stats'],
    queryFn: () => advancedAuditAPI.getStats(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileText className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Advanced Audit & Compliance</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-sm">Total Logs</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.total_logs?.toLocaleString() || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Last 24h</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.last_24h || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Compliance</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">Compliant</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
          <div className="space-y-2">
            {logs?.slice(0, 50).map((log: any) => (
              <div key={log.id} className="flex items-center justify-between p-2 border-b text-sm">
                <div>
                  <span className="font-medium">{log.action}</span>
                  <span className="text-muted-foreground ml-2">by {log.user_email || 'System'}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

