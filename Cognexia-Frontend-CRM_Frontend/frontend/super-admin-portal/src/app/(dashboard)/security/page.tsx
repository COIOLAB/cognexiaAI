'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { securityComplianceAPI } from '@/lib/api/super-admin-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import { Shield, AlertTriangle, Lock, Ban, CheckCircle } from 'lucide-react';
import { useState } from 'react';

const severityColors: Record<string, 'error' | 'success' | 'secondary' | 'default' | 'outline' | 'warning'> = {
  low: 'secondary',
  medium: 'default',
  high: 'error',
  critical: 'error',
};

export default function SecurityPage() {
  const queryClient = useQueryClient();
  const [ipToBlock, setIpToBlock] = useState('');
  const [blockReason, setBlockReason] = useState('');

  const { data: dashboard } = useQuery({
    queryKey: ['security', 'dashboard'],
    queryFn: () => securityComplianceAPI.getDashboard(),
    refetchInterval: 10000, // Refresh every 10s
  });

  const { data: events } = useQuery({
    queryKey: ['security', 'events'],
    queryFn: () => securityComplianceAPI.getEvents(),
  });

  const { data: blockedIPs } = useQuery({
    queryKey: ['security', 'blocked-ips'],
    queryFn: () => securityComplianceAPI.getBlockedIPs(),
  });

  const { data: mfaStatus } = useQuery({
    queryKey: ['security', 'mfa-status'],
    queryFn: () => securityComplianceAPI.getMFAStatus(),
  });

  const { data: complianceReport } = useQuery({
    queryKey: ['security', 'compliance'],
    queryFn: () => securityComplianceAPI.getComplianceReport(),
  });

  const blockIPMutation = useMutation({
    mutationFn: () => securityComplianceAPI.blockIP({ ipAddress: ipToBlock, reason: blockReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security'] });
      toast.success('IP blocked successfully');
      setIpToBlock('');
      setBlockReason('');
    },
  });

  const unblockIPMutation = useMutation({
    mutationFn: securityComplianceAPI.unblockIP,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security'] });
      toast.success('IP unblocked');
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Security & Compliance</h1>
        <p className="text-muted-foreground">Monitor security events and compliance status</p>
      </div>

      {/* Security Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.totalEvents}</div>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{dashboard?.criticalEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unresolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.unresolvedEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.failedLoginAttempts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.blockedIPs}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Security Events */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Security Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboard?.recentEvents?.map((event: any) => (
                <div key={event.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={severityColors[event.severity] as any}>
                        {event.severity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{event.eventType.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* IP Blocklist Management */}
        <Card>
          <CardHeader>
            <CardTitle>IP Blocklist</CardTitle>
            <CardDescription>Manage blocked IP addresses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="IP Address (e.g., 192.168.1.1)"
                  value={ipToBlock}
                  onChange={(e) => setIpToBlock(e.target.value)}
                />
                <Input
                  placeholder="Reason for blocking"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                />
                <Button
                  className="w-full"
                  onClick={() => blockIPMutation.mutate()}
                  disabled={!ipToBlock || !blockReason}
                >
                  Block IP
                </Button>
              </div>

              <div className="border-t pt-4 space-y-2">
                <h4 className="font-semibold text-sm">Currently Blocked:</h4>
                {blockedIPs?.map((blocked: any) => (
                  <div key={blocked.ipAddress} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-mono text-sm">{blocked.ipAddress}</p>
                      <p className="text-xs text-muted-foreground">{blocked.reason}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => unblockIPMutation.mutate(blocked.ipAddress)}
                    >
                      Unblock
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MFA Status */}
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{mfaStatus?.totalUsers}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Users with MFA</p>
              <p className="text-2xl font-bold text-green-600">{mfaStatus?.usersWithMFA}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Adoption Rate</p>
              <p className="text-2xl font-bold">{mfaStatus?.mfaAdoptionRate}%</p>
              <div className="w-full bg-secondary rounded-full h-2 mt-2">
                <div
                  className="h-2 rounded-full bg-green-500"
                  style={{ width: `${mfaStatus?.mfaAdoptionRate}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Status */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complianceReport?.map((report: any) => (
              <div key={report.organizationId} className="border-b pb-3">
                <p className="font-medium">{report.organizationName}</p>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {report.standards?.map((standard: any) => (
                    <div key={standard.standard} className="text-center">
                      <Badge
                        variant={standard.status === 'compliant' ? 'success' : 'error'}
                      >
                        {standard.standard}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {standard.score?.toFixed(0)}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

