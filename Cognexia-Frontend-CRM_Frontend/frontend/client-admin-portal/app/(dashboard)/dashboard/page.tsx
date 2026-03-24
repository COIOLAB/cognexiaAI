'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import { KpiCard } from '@/components/KpiCard';
import {
  Users,
  UserPlus,
  Target,
  DollarSign,
  BarChart3,
  PieChart,
  TrendingUp,
  LifeBuoy,
  FileText,
  LayoutDashboard,
  PhoneCall,
  Megaphone,
  ShieldCheck,
  Sparkles,
  Crown,
  Stars,
  Activity,
} from 'lucide-react';
import {
  useRecentActivities,
  useRevenueMetrics,
  useSalesFunnel,
  useUserDashboardMetrics,
  useMarketingMetrics,
  useSupportSlaMetrics,
  useTierAnalytics,
} from '@/hooks/useDashboards';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

const formatNumber = (value?: number) => (value ?? 0).toLocaleString();

const formatCurrency = (value?: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value ?? 0);

const formatCompactCurrency = (value?: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value ?? 0);

type PieDatum = { label: string; value: number; color: string };

const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const describeArc = (cx: number, cy: number, r: number, start: number, end: number) => {
  const startPos = polarToCartesian(cx, cy, r, end);
  const endPos = polarToCartesian(cx, cy, r, start);
  const largeArcFlag = end - start <= 180 ? 0 : 1;
  return [
    'M',
    startPos.x,
    startPos.y,
    'A',
    r,
    r,
    0,
    largeArcFlag,
    0,
    endPos.x,
    endPos.y,
  ].join(' ');
};

function DonutChart({
  data,
  size = 160,
  thickness = 18,
}: {
  data: PieDatum[];
  size?: number;
  thickness?: number;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  let startAngle = 0;
  const radius = size / 2 - thickness / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="hsl(var(--border))"
        strokeWidth={thickness}
        fill="none"
      />
      {data.map((slice) => {
        const angle = (slice.value / total) * 360;
        const endAngle = startAngle + angle;
        const path = describeArc(size / 2, size / 2, radius, startAngle, endAngle);
        const current = (
          <path
            key={slice.label}
            d={path}
            fill="none"
            stroke={slice.color}
            strokeWidth={thickness}
            strokeLinecap="round"
          />
        );
        startAngle = endAngle;
        return current;
      })}
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-sm">
        {Math.round(total)}
      </text>
    </svg>
  );
}

export default function DashboardPage() {
  type UserDashboardMetrics = {
    total_customers?: number;
    total_leads?: number;
    open_opportunities?: number;
    total_revenue?: number;
    total_pipeline_value?: number;
    open_tickets?: number;
    pending_tickets?: number;
    resolved_tickets_this_month?: number;
    avg_resolution_time_hours?: number;
  };
  const { data: metricsData } = useUserDashboardMetrics();
  const { data: salesFunnelData } = useSalesFunnel();
  const { data: revenueMetricsData } = useRevenueMetrics();
  const { data: marketingMetricsData } = useMarketingMetrics();
  const { data: supportSlaData } = useSupportSlaMetrics();
  const { data: tierAnalyticsData } = useTierAnalytics();
  const metrics = (metricsData ?? {}) as UserDashboardMetrics;
  const salesFunnel = Array.isArray(salesFunnelData) ? salesFunnelData : [];
  const revenueMetrics = (revenueMetricsData ?? {}) as {
    mrr?: number;
    arr?: number;
    growth?: number;
    churnRate?: number;
    nrr?: number;
    trend?: Array<{ month: string; value: number; growth: number }>;
    segments?: Array<{ name: string; value: number; percent: number }>;
  };
  const marketingMetrics = (marketingMetricsData ?? {}) as {
    totalCampaigns?: number;
    activeCampaigns?: number;
    totalSpend?: number;
    totalRevenue?: number;
    roi?: number;
    roiByCampaign?: Array<{ campaignId: string; name: string; roi: number; revenue: number; spend: number }>;
    channelMix?: Array<{ label: string; value: number }>;
  };
  const supportSla = (supportSlaData ?? {}) as {
    breachRate?: number;
    avgResolutionHours?: number;
    totalTickets?: number;
    breachedTickets?: number;
    byStatus?: Record<string, number>;
  };
  const tierAnalytics = (tierAnalyticsData ?? {}) as {
    basic?: { kpis?: Array<{ label: string; value: number }>; highlights?: Array<{ label: string; value: number }> };
    premium?: { kpis?: Array<{ label: string; value: number }>; highlights?: Array<{ label: string; value: number }> };
    advanced?: { kpis?: Array<{ label: string; value: number }>; highlights?: Array<{ label: string; value: number }> };
  };
  const { data: activitiesData, isLoading: activitiesLoading } = useRecentActivities(6);
  const { user, resetDemo, isDemoResetting } = useAuth();
  const activities = (activitiesData ?? []) as Array<{
    id?: string;
    title?: string;
    description?: string;
    createdAt?: string;
    timestamp?: string;
    type?: string;
  }>;

  const stats = [
    {
      name: 'Total Customers',
      value: formatNumber(metrics?.total_customers),
      helper: 'Live count',
      icon: Users,
    },
    {
      name: 'Total Leads',
      value: formatNumber(metrics?.total_leads),
      helper: 'Live count',
      icon: UserPlus,
    },
    {
      name: 'Open Opportunities',
      value: formatNumber(metrics?.open_opportunities),
      helper: 'Live count',
      icon: Target,
    },
    {
      name: 'Pipeline Value',
      value: formatCurrency(metrics?.total_pipeline_value),
      helper: 'Live total',
      icon: DollarSign,
    },
  ];

  const supportMix = useMemo<PieDatum[]>(() => {
    const open = Number(metrics?.open_tickets ?? 0);
    const pending = Number(metrics?.pending_tickets ?? 0);
    const resolved = Number(metrics?.resolved_tickets_this_month ?? 0);
    return [
      { label: 'Open', value: open, color: '#f97316' },
      { label: 'Pending', value: pending, color: '#facc15' },
      { label: 'Resolved', value: resolved, color: '#22c55e' },
    ];
  }, [metrics?.open_tickets, metrics?.pending_tickets, metrics?.resolved_tickets_this_month]);

  const funnelMix = useMemo<PieDatum[]>(() => {
    return salesFunnel.map((stage) => ({
      label: stage.stage,
      value: Number(stage.count ?? 0),
      color: '#3b82f6',
    }));
  }, [salesFunnel]);

  const revenueSegments = useMemo<PieDatum[]>(() => {
    if (Array.isArray(revenueMetrics?.segments) && revenueMetrics.segments.length > 0) {
      return revenueMetrics.segments.map((segment, index) => ({
        label: segment.name,
        value: Number(segment.value ?? 0),
        color: ['#8b5cf6', '#22c55e', '#f97316', '#3b82f6'][index % 4],
      }));
    }
    return [
      { label: 'Recurring', value: Number(revenueMetrics?.mrr ?? 0), color: '#8b5cf6' },
      { label: 'Pipeline', value: Number(metrics?.total_pipeline_value ?? 0), color: '#3b82f6' },
      { label: 'Other', value: 1, color: '#d1d5db' },
    ];
  }, [metrics?.total_pipeline_value, revenueMetrics?.mrr, revenueMetrics?.segments]);

  const pipelineStages = useMemo(() => {
    const maxValue = Math.max(
      1,
      ...salesFunnel.map((stage) => Number(stage.value ?? 0)),
    );
    return salesFunnel.map((stage, index) => ({
      ...stage,
      width: Math.round((Number(stage.value ?? 0) / maxValue) * 100),
      color: ['#6366f1', '#22c55e', '#0ea5e9', '#f97316', '#ec4899'][index % 5],
    }));
  }, [salesFunnel]);

  const campaignRoi = useMemo(() => {
    if (marketingMetrics?.roiByCampaign && marketingMetrics.roiByCampaign.length > 0) {
      return marketingMetrics.roiByCampaign.slice(0, 3).map((item) => ({
        name: item.name,
        roi: Math.round(item.roi),
      }));
    }
    const base = Number(revenueMetrics?.growth ?? 6);
    return [
      { name: 'Q1 Launch', roi: Math.max(12, base + 18) },
      { name: 'Retention Play', roi: Math.max(8, base + 9) },
      { name: 'Upsell Blitz', roi: Math.max(6, base + 5) },
    ];
  }, [marketingMetrics?.roiByCampaign, revenueMetrics?.growth]);

  const slaBreachRate = useMemo(() => {
    if (supportSla?.breachRate !== undefined) {
      return supportSla.breachRate;
    }
    const total = supportMix.reduce((sum, item) => sum + item.value, 0);
    const pending = Number(metrics?.pending_tickets ?? 0);
    return total ? Math.round((pending / total) * 100) : 0;
  }, [metrics?.pending_tickets, supportMix, supportSla?.breachRate]);

  const marketingMix = useMemo<PieDatum[]>(() => {
    const mix = marketingMetrics?.channelMix || [];
    if (mix.length === 0) {
      return [
        { label: 'Email', value: 36, color: '#22c55e' },
        { label: 'Social', value: 24, color: '#0ea5e9' },
        { label: 'Ads', value: 20, color: '#f97316' },
        { label: 'Referral', value: 12, color: '#a855f7' },
      ];
    }
    const colors = ['#22c55e', '#0ea5e9', '#f97316', '#a855f7', '#facc15', '#14b8a6'];
    return mix.map((item, index) => ({
      label: item.label,
      value: item.value,
      color: colors[index % colors.length],
    }));
  }, [marketingMetrics?.channelMix]);

  const reportLinks = [
    {
      title: 'Reports Center',
      description: 'Create, run, and schedule reports.',
      href: '/reports',
      icon: FileText,
    },
    {
      title: 'Dashboards',
      description: 'Custom analytics dashboards.',
      href: '/dashboards',
      icon: LayoutDashboard,
    },
    {
      title: 'Sales Analytics',
      description: 'Pipeline, revenue, and funnel analytics.',
      href: '/sales/analytics',
      icon: TrendingUp,
    },
    {
      title: 'Marketing Analytics',
      description: 'Campaign performance and ROI.',
      href: '/marketing/analytics',
      icon: Megaphone,
    },
    {
      title: 'Support Analytics',
      description: 'SLA, ticket load, and agent metrics.',
      href: '/support/analytics',
      icon: LifeBuoy,
    },
    {
      title: 'Call Analytics',
      description: 'Queue and call center performance.',
      href: '/calls/analytics',
      icon: PhoneCall,
    },
  ];

  const tieredFeatures = [
    {
      title: 'Basic Suite',
      description: 'Core CRM, sales, and productivity essentials.',
      icon: Sparkles,
      tone: 'bg-gradient-to-br from-emerald-500/10 via-transparent to-emerald-500/20',
      links: [
        { label: 'Clients', href: '/accounts' },
        { label: 'Leads', href: '/leads' },
        { label: 'Opportunities', href: '/opportunities' },
        { label: 'Tasks & Activities', href: '/operations/tasks' },
        { label: 'Documents', href: '/documents' },
        { label: 'Calendar', href: '/operations/calendar' },
      ],
      badge: { label: 'Basic', variant: 'secondary' as const },
      analytics: tierAnalytics?.basic,
    },
    {
      title: 'Premium Growth',
      description: 'Marketing, support, and collaboration excellence.',
      icon: Crown,
      tone: 'bg-gradient-to-br from-indigo-500/10 via-transparent to-indigo-500/20',
      links: [
        { label: 'Marketing', href: '/marketing' },
        { label: 'Email Campaigns', href: '/marketing/email-campaigns' },
        { label: 'Support', href: '/support' },
        { label: 'Service Desk', href: '/support/tickets' },
        { label: 'Workflows', href: '/workflows' },
        { label: 'Integrations', href: '/integrations' },
      ],
      badge: { label: 'Premium', variant: 'default' as const },
      analytics: tierAnalytics?.premium,
    },
    {
      title: 'Advanced Intelligence',
      description: 'AI automation, revenue intelligence, and security.',
      icon: Stars,
      tone: 'bg-gradient-to-br from-rose-500/10 via-transparent to-rose-500/20',
      links: [
        { label: 'AI Lab', href: '/ai-lab' },
        { label: 'Revenue Intelligence', href: '/sales/analytics' },
        { label: 'Security Center', href: '/security' },
        { label: 'Predictive Analytics', href: '/reports' },
        { label: 'Call Intelligence', href: '/calls/analytics' },
        { label: 'Compliance', href: '/compliance' },
      ],
      badge: { label: 'Advanced', variant: 'destructive' as const },
      analytics: tierAnalytics?.advanced,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's your business overview."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/leads/new">New Lead</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/opportunities/new">New Opportunity</Link>
            </Button>
            <Button asChild>
              <Link href="/sales/orders/new">New Order</Link>
            </Button>
          </>
        }
      />

      {user?.organizationName === 'CognexiaAI Demo' && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold text-amber-900">CognexiaAI Demo Environment</div>
              <div className="text-sm text-amber-800">
                Refresh the demo dataset to restore the full story-driven pipeline and analytics.
              </div>
            </div>
            <Button variant="outline" onClick={() => resetDemo()} disabled={isDemoResetting}>
              {isDemoResetting ? 'Resetting...' : 'Reset Demo Data'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <KpiCard
              key={stat.name}
              title={stat.name}
              value={stat.value}
              helper={stat.helper}
              icon={<Icon className="h-4 w-4 text-muted-foreground" />}
            />
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Revenue & Growth
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 rounded-lg border p-4">
              <div className="text-xs text-muted-foreground">Monthly Recurring Revenue</div>
              <div className="text-2xl font-bold">{formatCompactCurrency(revenueMetrics?.mrr)}</div>
              <div className="text-xs text-muted-foreground">
                ARR: {formatCompactCurrency(revenueMetrics?.arr)}
              </div>
            </div>
            <div className="space-y-2 rounded-lg border p-4">
              <div className="text-xs text-muted-foreground">Growth & Retention</div>
              <div className="text-2xl font-bold">{Number(revenueMetrics?.growth ?? 0)}%</div>
              <div className="text-xs text-muted-foreground">
                NRR: {Number(revenueMetrics?.nrr ?? 0)}% · Churn: {Number(revenueMetrics?.churnRate ?? 0)}%
              </div>
            </div>
            <div className="space-y-2 rounded-lg border p-4 md:col-span-2">
              <div className="text-xs text-muted-foreground">6-Month Trend</div>
              <div className="grid grid-cols-6 gap-2">
                {(revenueMetrics?.trend || []).map((item) => (
                  <div key={item.month} className="text-center">
                    <div className="h-16 rounded-md bg-primary/10 flex items-end justify-center">
                      <div
                        className="w-5 rounded-md bg-primary"
                        style={{
                          height: `${Math.min(100, Math.max(20, Math.round((item.value || 0) / 1000)))}%`,
                        }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">{item.month}</div>
                  </div>
                ))}
              </div>
              {(!revenueMetrics?.trend || revenueMetrics.trend.length === 0) && (
                <div className="text-sm text-muted-foreground">No trend data available.</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-muted-foreground" />
              Revenue Segments
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <DonutChart data={revenueSegments} />
            <div className="w-full space-y-2">
              {revenueSegments.map((segment) => (
                <div key={segment.label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: segment.color }} />
                    <span>{segment.label}</span>
                  </div>
                  <span className="text-muted-foreground">{formatCompactCurrency(segment.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              Sales Funnel
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-[180px,1fr] items-center">
            <div className="flex justify-center">
              <DonutChart data={funnelMix.length ? funnelMix : [{ label: 'No data', value: 1, color: '#d1d5db' }]} size={140} />
            </div>
            <div className="space-y-3">
              {salesFunnel.length > 0 ? (
                salesFunnel.map((stage) => (
                  <div key={stage.stage} className="flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium">{stage.stage}</div>
                      <div className="text-xs text-muted-foreground">
                        {Number(stage.count ?? 0)} opportunities · {formatCompactCurrency(stage.value)}
                      </div>
                    </div>
                    <span className="text-muted-foreground">{Number(stage.conversion_rate ?? 0).toFixed(1)}%</span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">No funnel data yet.</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              Support Health
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-[160px,1fr] items-center">
            <div className="flex justify-center">
              <DonutChart data={supportMix} size={140} />
            </div>
            <div className="space-y-3">
              {supportMix.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-muted-foreground">{item.value}</span>
                </div>
              ))}
              <div className="text-xs text-muted-foreground">
                Avg resolution: {Number(metrics?.avg_resolution_time_hours ?? 0).toFixed(1)} hrs
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Pipeline by Stage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pipelineStages.length > 0 ? (
              pipelineStages.map((stage) => (
                <div key={stage.stage} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{stage.stage}</span>
                    <span className="text-muted-foreground">{formatCompactCurrency(stage.value)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${stage.width}%`,
                        backgroundColor: stage.color,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">No pipeline data available.</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/5 via-transparent to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              SLA Breach Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold">{slaBreachRate}%</div>
            <div className="h-2 rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-rose-500"
                style={{ width: `${Math.min(100, slaBreachRate)}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {supportSla?.breachedTickets !== undefined
                ? `${supportSla.breachedTickets ?? 0} breaches from ${supportSla.totalTickets ?? 0} tickets`
                : 'Est. based on pending vs total tickets.'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-muted-foreground" />
              Campaign ROI
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {campaignRoi.map((campaign, index) => (
              <div key={`${campaign.name}-${index}`} className="rounded-lg border p-4 space-y-2">
                <div className="text-xs text-muted-foreground">{campaign.name}</div>
                <div className="text-2xl font-semibold">{campaign.roi}%</div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-emerald-500"
                    style={{ width: `${Math.min(100, campaign.roi)}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">ROI uplift</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 via-transparent to-emerald-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-muted-foreground" />
              Marketing Mix
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <DonutChart data={marketingMix} size={140} />
            <div className="w-full space-y-2">
              {marketingMix.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-muted-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stars className="h-4 w-4 text-muted-foreground" />
            Feature Tiers
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-3">
          {tieredFeatures.map((tier) => {
            const Icon = tier.icon;
            return (
              <div key={tier.title} className={`rounded-xl border p-4 ${tier.tone}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {tier.title}
                  </div>
                  <Badge variant={tier.badge.variant}>{tier.badge.label}</Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{tier.description}</p>
                {tier.analytics?.kpis?.length ? (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {tier.analytics.kpis.map((kpi) => (
                      <div key={kpi.label} className="rounded-lg border bg-background/60 p-2">
                        <div className="text-xs text-muted-foreground">{kpi.label}</div>
                        <div className="text-lg font-semibold">{formatNumber(kpi.value)}</div>
                      </div>
                    ))}
                  </div>
                ) : null}
                {tier.analytics?.highlights?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tier.analytics.highlights.map((item) => (
                      <span key={item.label} className="inline-flex items-center rounded-full bg-background/70 px-3 py-1 text-xs font-medium">
                        {item.label}: {formatNumber(item.value)}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  {tier.links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-xs font-medium hover:bg-accent"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
            Reports & Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {reportLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="rounded-lg border p-4 hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {item.title}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">{item.description}</div>
              </Link>
            );
          })}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {activitiesLoading ? (
            <div className="text-sm text-muted-foreground">Loading activity…</div>
          ) : activities && activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id || activity.timestamp} className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {activity.title || activity.description || 'Activity update'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.description || 'Recent activity'} ·{' '}
                      {formatDistanceToNow(new Date(activity.timestamp || activity.createdAt || new Date().toISOString()), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              No recent activity yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
