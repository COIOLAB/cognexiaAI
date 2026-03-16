'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useGetEmailCampaigns, useEmailCampaignStats } from '@/hooks/useEmailCampaigns';
import { PageHeader } from '@/components/PageHeader';
import { KpiCard } from '@/components/KpiCard';
import Link from 'next/link';

export default function EmailCampaignsPage() {
  const { data: campaignsData, isLoading } = useGetEmailCampaigns();
  const { data: statsData } = useEmailCampaignStats();

  const stats = statsData?.data || {
    totalSent: 0,
    openRate: 0,
    clickRate: 0,
    conversions: 0,
  };

  const campaigns = campaignsData?.data?.campaigns || campaignsData?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Campaigns"
        subtitle="Create and track email performance."
        actions={
          <Button asChild>
            <Link href="/marketing/campaigns/new">
              <Plus className="mr-2 h-4 w-4" />
              New Email Campaign
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard title="Total Sent" value={stats.totalSent || 0} />
        <KpiCard title="Open Rate" value={`${stats.openRate || 0}%`} />
        <KpiCard title="Click Rate" value={`${stats.clickRate || 0}%`} />
        <KpiCard title="Conversions" value={stats.conversions || 0} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Campaigns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading email campaigns...</div>
          ) : campaigns.length > 0 ? (
            campaigns.map((campaign: any) => (
              <Link
                key={campaign.id}
                href={`/marketing/emails/${campaign.id}`}
                className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent"
              >
                <div>
                  <div className="font-medium">{campaign.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {campaign.subject || 'Email campaign'}
                  </div>
                </div>
                <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                  {campaign.status || 'draft'}
                </Badge>
              </Link>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No campaigns found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
