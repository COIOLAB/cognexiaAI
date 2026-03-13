'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Clock, User, Tag, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useTicket, useDeleteTicket } from '@/hooks/useTickets';
import { format } from 'date-fns';
import { TicketStatus, TicketPriority } from '@/types/api.types';

const priorityStyles: Record<TicketPriority, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
  critical: 'bg-red-600 text-white',
};

const statusStyles: Record<TicketStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  open: 'bg-green-100 text-green-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  pending: 'bg-purple-100 text-purple-800',
  resolved: 'bg-emerald-100 text-emerald-800',
  closed: 'bg-gray-100 text-gray-800',
  reopened: 'bg-orange-100 text-orange-800',
};

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const { data, isLoading, error } = useTicket(ticketId);
  const deleteMutation = useDeleteTicket();
  const ticket = data;

  const handleDelete = () => {
    if (confirm(`Delete ticket ${ticket?.ticketNumber}?`)) {
      deleteMutation.mutate(ticketId, {
        onSuccess: () => router.push('/support'),
      });
    }
  };

  if (isLoading) return <div className="flex flex-col gap-6 p-6"><Skeleton className="h-[600px]" /></div>;
  if (error || !ticket) return (
    <div className="flex flex-col items-center justify-center gap-4 p-6">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <h2 className="text-2xl font-bold">Ticket not found</h2>
      <Button onClick={() => router.push('/support')}>Back to Support</Button>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{ticket.subject}</h1>
              <Badge className={statusStyles[ticket.status]}>{ticket.status.replace(/_/g, ' ')}</Badge>
              <Badge className={priorityStyles[ticket.priority]}>{ticket.priority}</Badge>
            </div>
            <p className="text-muted-foreground">{ticket.ticketNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/support/${ticketId}/edit`)}><Edit className="mr-2 h-4 w-4" />Edit</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center"><Clock className="mr-2 h-4 w-4" />Created</CardTitle></CardHeader>
          <CardContent><p className="text-sm">{format(new Date(ticket.createdAt), 'MMM d, yyyy HH:mm')}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center"><User className="mr-2 h-4 w-4" />Customer</CardTitle></CardHeader>
          <CardContent><p className="text-sm font-mono">{ticket.customerId}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center"><Tag className="mr-2 h-4 w-4" />Category</CardTitle></CardHeader>
          <CardContent><Badge variant="outline">{ticket.category.replace(/_/g, ' ')}</Badge></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center"><Tag className="mr-2 h-4 w-4" />Channel</CardTitle></CardHeader>
          <CardContent><Badge variant="secondary">{ticket.channel}</Badge></CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details">
        <TabsList><TabsTrigger value="details">Details</TabsTrigger><TabsTrigger value="history">History</TabsTrigger></TabsList>
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Description</CardTitle></CardHeader>
            <CardContent><p className="whitespace-pre-wrap">{ticket.description}</p></CardContent>
          </Card>
          {ticket.tags && ticket.tags.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Tags</CardTitle></CardHeader>
              <CardContent><div className="flex flex-wrap gap-2">{ticket.tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}</div></CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="history">
          <Card>
            <CardHeader><CardTitle>Activity History</CardTitle><CardDescription>All ticket activities and responses</CardDescription></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">No activity history available</p></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
