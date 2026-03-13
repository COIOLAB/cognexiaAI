'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useGetTicket } from '@/hooks/useSupportTickets';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  const { data: ticket, isLoading } = useGetTicket(params.id);

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  if (!ticket) {
    return <div>Ticket not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/support/tickets">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Ticket #{ticket.ticketNumber}</h1>
          <p className="text-muted-foreground">
            Created {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{ticket.subject}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Description</p>
                <p className="text-sm text-muted-foreground">{ticket.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Status</p>
              <Badge variant="outline" className="mt-1">{ticket.status}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium">Priority</p>
              <Badge className="mt-1">{ticket.priority}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium">Customer</p>
              <p className="text-sm text-muted-foreground mt-1">{ticket.customerName}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Assigned To</p>
              <p className="text-sm text-muted-foreground mt-1">
                {ticket.assignedToName || 'Unassigned'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
