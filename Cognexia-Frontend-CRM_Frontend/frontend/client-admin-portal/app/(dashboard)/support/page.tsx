'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supportAnalyticsApi } from '@/services/supportAnalytics.api';
import { useQuery } from '@tanstack/react-query';
import { 
  Ticket, 
  MessageSquare, 
  CheckCircle2, 
  AlertTriangle,
  TrendingUp,
  Users,
  Clock,
  Star
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default function SupportOverviewPage() {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['support', 'overview'],
    queryFn: () => supportAnalyticsApi.getOverview(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Open Tickets',
      value: overview?.openTickets || 0,
      icon: Ticket,
      trend: '+12%',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Active Chats',
      value: overview?.activeChats || 0,
      icon: MessageSquare,
      trend: '+5%',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'SLA Compliance',
      value: `${overview?.slaCompliance || 0}%`,
      icon: CheckCircle2,
      trend: overview && overview.slaCompliance >= 95 ? '+2%' : '-3%',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Avg Satisfaction',
      value: `${Number(overview?.avgSatisfaction ?? 0).toFixed(1)}/5`,
      icon: Star,
      trend: '+0.2',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ];

  const agentAvailability = overview?.agentAvailability || { available: 0, busy: 0, offline: 0 };
  const totalAgents = agentAvailability.available + agentAvailability.busy + agentAvailability.offline;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Customer Support</h1>
        <p className="text-muted-foreground">
          Monitor tickets, live chats, and team performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600">{stat.trend}</span> from last week
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Tickets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Tickets</CardTitle>
            <Link href="/support/tickets">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {overview?.recentTickets && overview.recentTickets.length > 0 ? (
                overview.recentTickets.slice(0, 5).map((ticket) => (
                  <div key={ticket.id} className="flex items-start justify-between">
                    <div className="space-y-1">
                      <Link 
                        href={`/support/tickets/${ticket.id}`}
                        className="font-medium hover:underline"
                      >
                        #{ticket.ticketNumber}
                      </Link>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {ticket.subject}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={
                        ticket.priority === 'critical' || ticket.priority === 'urgent' 
                          ? 'destructive' 
                          : ticket.priority === 'high'
                          ? 'default'
                          : 'secondary'
                      }>
                        {ticket.priority}
                      </Badge>
                      <Badge variant="outline">{ticket.status}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent tickets</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Critical Tickets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Critical Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {overview?.criticalTickets && overview.criticalTickets.length > 0 ? (
                overview.criticalTickets.slice(0, 5).map((ticket) => (
                  <div key={ticket.id} className="flex items-start justify-between">
                    <div className="space-y-1">
                      <Link 
                        href={`/support/tickets/${ticket.id}`}
                        className="font-medium hover:underline text-red-600"
                      >
                        #{ticket.ticketNumber}
                      </Link>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {ticket.subject}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Customer: {ticket.customerName}
                      </p>
                    </div>
                    <Badge variant="destructive">{ticket.priority}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No critical tickets</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Agent Availability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Agent Availability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Available</span>
                <span className="text-2xl font-bold text-green-600">
                  {agentAvailability.available}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Busy</span>
                <span className="text-2xl font-bold text-yellow-600">
                  {agentAvailability.busy}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Offline</span>
                <span className="text-2xl font-bold text-gray-600">
                  {agentAvailability.offline}
                </span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Agents</span>
                  <span className="text-lg font-bold">{totalAgents}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Knowledge Base Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Knowledge Base</CardTitle>
            <Link href="/support/knowledge-base">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Articles</span>
                <span className="text-2xl font-bold">
                  {overview?.knowledgeBaseStats?.totalArticles || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Published</span>
                <span className="text-2xl font-bold text-green-600">
                  {overview?.knowledgeBaseStats?.published || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Views</span>
                <span className="text-2xl font-bold text-blue-600">
                  {Number(overview?.knowledgeBaseStats?.totalViews ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Avg Helpfulness</span>
                <span className="text-2xl font-bold text-yellow-600">
                  {Number(overview?.knowledgeBaseStats?.avgHelpfulness ?? 0).toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SLA Violations */}
      {overview?.slaViolations && overview.slaViolations.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Recent SLA Violations
            </CardTitle>
            <Link href="/support/sla">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overview.slaViolations.slice(0, 5).map((violation) => (
                <div key={violation.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <Link 
                      href={`/support/tickets/${violation.ticketId}`}
                      className="font-medium hover:underline"
                    >
                      Ticket #{violation.ticketNumber}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {violation.slaName} - {violation.violationType}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="destructive">Violated</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(violation.breachTime), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-4">
            <Link href="/support/tickets">
              <Button variant="outline" className="w-full">
                <Ticket className="mr-2 h-4 w-4" />
                View All Tickets
              </Button>
            </Link>
            <Link href="/support/live-chat">
              <Button variant="outline" className="w-full">
                <MessageSquare className="mr-2 h-4 w-4" />
                Live Chat
              </Button>
            </Link>
            <Link href="/support/sla">
              <Button variant="outline" className="w-full">
                <Clock className="mr-2 h-4 w-4" />
                SLA Management
              </Button>
            </Link>
            <Link href="/support/analytics">
              <Button variant="outline" className="w-full">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
