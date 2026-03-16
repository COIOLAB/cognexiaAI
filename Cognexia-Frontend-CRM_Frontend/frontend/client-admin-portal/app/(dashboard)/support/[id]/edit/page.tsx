'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TicketForm } from '@/components/support/ticket-form';
import { useTicket, useUpdateTicket } from '@/hooks/useTickets';
import type { CreateTicketDto } from '@/types/api.types';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditTicketPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const { data, isLoading } = useTicket(ticketId);
  const updateMutation = useUpdateTicket();
  const ticket = data;

  const handleSubmit = (formData: CreateTicketDto) => {
    updateMutation.mutate({ id: ticketId, data: formData }, {
      onSuccess: () => router.push(`/support/${ticketId}`),
    });
  };

  if (isLoading) return <div className="flex flex-col gap-6 p-6"><Skeleton className="h-[600px]" /></div>;
  if (!ticket) return (
    <div className="flex flex-col items-center justify-center gap-4 p-6">
      <h2 className="text-2xl font-bold">Ticket not found</h2>
      <Button onClick={() => router.push('/support')}>Back to Support</Button>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Ticket</h1>
          <p className="text-muted-foreground">{ticket.ticketNumber}</p>
        </div>
      </div>
      <TicketForm initialData={ticket} onSubmit={handleSubmit} isLoading={updateMutation.isPending} submitLabel="Save Changes" />
    </div>
  );
}
