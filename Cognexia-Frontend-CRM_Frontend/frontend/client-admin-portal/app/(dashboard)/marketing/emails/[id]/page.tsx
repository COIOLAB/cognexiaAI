'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Pause, Send, Trash2, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/PageHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  useDeleteEmailCampaign,
  useEmailEngagement,
  useEmailStats,
  useGetEmailCampaign,
  usePauseEmailCampaign,
  useScheduleEmailCampaign,
  useSendEmailCampaign,
  useTestEmailCampaign,
  useUpdateEmailCampaign,
} from '@/hooks/useEmailCampaigns';
import { emailCampaignApi } from '@/services/emailCampaign.api';
import { toast } from 'sonner';

export default function EmailDetailPage() {
  const params = useParams();
  const campaignId = params.id as string;
  const { data, isLoading } = useGetEmailCampaign(campaignId);
  const { data: statsData } = useEmailStats(campaignId);
  const { data: engagementData } = useEmailEngagement(campaignId);
  const updateCampaign = useUpdateEmailCampaign();
  const deleteCampaign = useDeleteEmailCampaign();
  const sendCampaign = useSendEmailCampaign();
  const pauseCampaign = usePauseEmailCampaign();
  const scheduleCampaign = useScheduleEmailCampaign();
  const testCampaign = useTestEmailCampaign();

  const campaign = (data as any)?.data ?? data;
  const stats = (statsData as any)?.data ?? campaign?.stats;
  const engagement = (engagementData as any)?.data ?? engagementData;

  const [name, setName] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    if (campaign) {
      setName(campaign.name || '');
      setScheduledFor(campaign.scheduledFor ? campaign.scheduledFor.slice(0, 16) : '');
    }
  }, [campaign]);

  if (isLoading) {
    return <div className="text-muted-foreground">Loading campaign...</div>;
  }

  if (!campaign) {
    return <div className="text-muted-foreground">Campaign not found.</div>;
  }

  const handleExport = async () => {
    try {
      const blob = await emailCampaignApi.exportEmailMetrics(campaignId, 'csv');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `email-campaign-${campaignId}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Export downloaded');
    } catch (error) {
      toast.error('Failed to export metrics');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Campaign Details"
        subtitle={campaign.name}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/marketing/emails">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => sendCampaign.mutate(campaignId)}
              disabled={sendCampaign.isPending}
            >
              <Send className="mr-2 h-4 w-4" />
              {sendCampaign.isPending ? 'Sending...' : 'Send Now'}
            </Button>
            <Button
              variant="outline"
              onClick={() => pauseCampaign.mutate(campaignId)}
              disabled={pauseCampaign.isPending}
            >
              <Pause className="mr-2 h-4 w-4" />
              {pauseCampaign.isPending ? 'Pausing...' : 'Pause'}
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm('Delete this campaign?')) {
                  deleteCampaign.mutate(campaignId);
                }
              }}
              disabled={deleteCampaign.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="capitalize">
              {campaign.status}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recipients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.recipients ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Open Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.openRate ?? 0}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Click Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.clickRate ?? 0}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Campaign Name</label>
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Template</label>
              <Input value={campaign.template?.name || campaign.templateId} readOnly />
            </div>
            <div>
              <label className="text-sm font-medium">Scheduled For</label>
              <Input
                type="datetime-local"
                value={scheduledFor}
                onChange={(event) => setScheduledFor(event.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (!scheduledFor) return;
                scheduleCampaign.mutate({ id: campaignId, scheduledFor });
              }}
              disabled={!scheduledFor || scheduleCampaign.isPending}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {scheduleCampaign.isPending ? 'Scheduling...' : 'Schedule'}
            </Button>
            <Button
              onClick={() =>
                updateCampaign.mutate({
                  id: campaignId,
                  data: { name: name.trim() },
                })
              }
              disabled={!name.trim() || updateCampaign.isPending}
            >
              {updateCampaign.isPending ? 'Saving...' : 'Save Name'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Send Test</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center">
          <Input
            value={testEmail}
            onChange={(event) => setTestEmail(event.target.value)}
            placeholder="test@example.com"
          />
          <Button
            onClick={() => testEmail && testCampaign.mutate({ id: campaignId, email: testEmail })}
            disabled={!testEmail || testCampaign.isPending}
          >
            <Send className="mr-2 h-4 w-4" />
            {testCampaign.isPending ? 'Sending...' : 'Send Test'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Engagement</CardTitle>
        </CardHeader>
        <CardContent>
          {Array.isArray(engagement) && engagement.length ? (
            <div className="rounded-md border bg-background">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {engagement.map((row: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{row.label || row.metric || 'Metric'}</TableCell>
                      <TableCell>{row.value ?? row.count ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No engagement data yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
