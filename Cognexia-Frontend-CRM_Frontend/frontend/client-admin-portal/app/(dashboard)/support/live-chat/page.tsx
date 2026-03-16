'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useActiveChats, useChatStatistics } from '@/hooks/useLiveChat';
import { PageHeader } from '@/components/PageHeader';
import { KpiCard } from '@/components/KpiCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function LiveChatPage() {
  const { data: activeChats } = useActiveChats();
  const { data: stats } = useChatStatistics();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Chat"
        subtitle="Monitor active conversations and response quality."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard title="Active Chats" value={<span className="text-green-600">{stats?.activeChats || 0}</span>} />
        <KpiCard title="Waiting" value={<span className="text-orange-600">{stats?.waitingChats || 0}</span>} />
        <KpiCard title="Today's Chats" value={stats?.totalChatsToday || 0} />
        <KpiCard
          title="Avg Rating"
          value={<span className="text-yellow-600">{stats?.avgRating?.toFixed(1) || '0.0'}/5</span>}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Chat Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {activeChats?.data?.length ? (
            <div className="rounded-md border bg-background">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned</TableHead>
                    <TableHead>Started</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeChats.data.slice(0, 10).map((chat: any, index: number) => (
                    <TableRow key={chat.id || index}>
                      <TableCell className="font-medium">
                        {chat.customerName || chat.visitorName || 'Visitor'}
                      </TableCell>
                      <TableCell>{chat.status || 'active'}</TableCell>
                      <TableCell>{chat.agentName || 'Unassigned'}</TableCell>
                      <TableCell>{chat.startedAt ? String(chat.startedAt) : '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No active chat sessions.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
