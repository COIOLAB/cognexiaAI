'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supportTicketsAPI } from '@/lib/api/super-admin-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';

export default function SupportTicketsPage() {
  const queryClient = useQueryClient();

  const { data: tickets } = useQuery({
    queryKey: ['support-tickets'],
    queryFn: () => supportTicketsAPI.getAllTickets(),
  });

  const { data: stats } = useQuery({
    queryKey: ['support-tickets', 'stats'],
    queryFn: () => supportTicketsAPI.getStats(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      supportTicketsAPI.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      toast.success('Ticket status updated');
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Support Tickets</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Total</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Open</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.open}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">In Progress</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.inProgress}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Avg Resolution</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.avgResolutionTime}h</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tickets?.map((ticket: any) => (
              <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={ticket.priority === 'urgent' ? 'error' : 'default'}>
                      {ticket.priority}
                    </Badge>
                    <p className="font-medium">{ticket.title}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{ticket.description}</p>
                </div>
                <Select
                  value={ticket.status}
                  onValueChange={(status) => updateStatusMutation.mutate({ id: ticket.id, status })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

