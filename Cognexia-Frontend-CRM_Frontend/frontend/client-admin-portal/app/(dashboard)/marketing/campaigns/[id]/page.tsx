'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { useDeleteCampaign, useGetCampaign, useCampaignPerformance } from '@/hooks/useCampaigns';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit } from 'lucide-react';

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  const { data, isLoading } = useGetCampaign(campaignId);
  const { data: performanceData } = useCampaignPerformance(campaignId);
  const deleteCampaign = useDeleteCampaign();
  const campaign = (data as any)?.data ?? data;
  const performance = (performanceData as any)?.data ?? performanceData;

  if (isLoading) {
    return <div className="text-muted-foreground">Loading campaign...</div>;
  }

  if (!campaign) {
    return <div className="text-muted-foreground">Campaign not found.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaign Details"
        subtitle={campaign.name}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/marketing/campaigns">Back to Campaigns</Link>
            </Button>
            <Button variant="outline" onClick={() => router.push(`/marketing/campaigns/${campaignId}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
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

      <div className="grid gap-4 md:grid-cols-3">
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
            <CardTitle className="text-sm">Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Number(campaign.budget ?? 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Number(campaign.spent ?? 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm text-muted-foreground">Type</div>
              <div className="font-medium capitalize">{campaign.type}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Schedule</div>
              <div className="font-medium">
                {campaign.startDate} → {campaign.endDate}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Channels</div>
              <div className="flex flex-wrap gap-2">
                {(campaign.channels || []).map((channel: string) => (
                  <Badge key={channel} variant="secondary" className="capitalize">
                    {channel}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Objectives</div>
              <div className="text-sm">{(campaign.objectives || []).join(', ') || '—'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {performance ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <div className="text-sm text-muted-foreground">Impressions</div>
                <div className="text-xl font-bold">{performance.impressions ?? 0}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Clicks</div>
                <div className="text-xl font-bold">{performance.clicks ?? 0}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">ROI</div>
                <div className="text-xl font-bold">{performance.roi ?? 0}%</div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No performance data yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
