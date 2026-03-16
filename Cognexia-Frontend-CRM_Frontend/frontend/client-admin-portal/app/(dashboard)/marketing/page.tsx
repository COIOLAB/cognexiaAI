'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMarketingOverview } from '@/hooks/useMarketingAnalytics';
import { Megaphone, Mail, Users, TrendingUp, Plus, Send, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function MarketingOverviewPage() {
  const { data: overview, isLoading } = useMarketingOverview();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Active Campaigns',
      value: overview?.data?.activeCampaigns || 0,
      icon: Megaphone,
      color: 'text-blue-600',
    },
    {
      title: 'Emails Sent Today',
      value: formatNumber(overview?.data?.emailsSentToday || 0),
      icon: Mail,
      color: 'text-green-600',
    },
    {
      title: 'Active Segments',
      value: overview?.data?.activeSegments || 0,
      icon: Users,
      color: 'text-purple-600',
    },
    {
      title: 'Overall ROI',
      value: `${overview?.data?.overallROI || 0}%`,
      icon: TrendingUp,
      color: 'text-orange-600',
    },
  ];

  const recentCampaigns = overview?.data?.recentCampaigns || [];
  const upcomingEmails = overview?.data?.upcomingEmails || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketing</h1>
          <p className="text-muted-foreground mt-1">
            Manage campaigns, emails, and audience segments
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/marketing/campaigns">
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button asChild variant="outline" className="h-24 flex-col">
              <Link href="/marketing/campaigns">
                <Megaphone className="h-8 w-8 mb-2" />
                <span>Create Campaign</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-24 flex-col">
              <Link href="/marketing/emails">
                <Send className="h-8 w-8 mb-2" />
                <span>Send Email</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-24 flex-col">
              <Link href="/marketing/segments">
                <UserPlus className="h-8 w-8 mb-2" />
                <span>Create Segment</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            {recentCampaigns.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent campaigns</p>
            ) : (
              <div className="space-y-4">
                {recentCampaigns.slice(0, 5).map((campaign: any) => (
                  <Link
                    key={campaign.id}
                    href={`/marketing/campaigns/${campaign.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{campaign.name}</p>
                      <p className="text-sm text-muted-foreground">{campaign.type}</p>
                    </div>
                    <Badge
                      variant={
                        campaign.status === 'active'
                          ? 'default'
                          : campaign.status === 'completed'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {campaign.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Emails */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Scheduled Emails</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEmails.length === 0 ? (
              <p className="text-sm text-muted-foreground">No scheduled emails</p>
            ) : (
              <div className="space-y-4">
                {upcomingEmails.slice(0, 5).map((email: any) => (
                  <Link
                    key={email.id}
                    href={`/marketing/emails/${email.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{email.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {email.scheduledFor
                          ? new Date(email.scheduledFor).toLocaleString()
                          : 'Not scheduled'}
                      </p>
                    </div>
                    <Badge variant="outline">{email.recipients} recipients</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
