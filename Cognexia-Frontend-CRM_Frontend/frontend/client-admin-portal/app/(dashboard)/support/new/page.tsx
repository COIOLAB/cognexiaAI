'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TicketForm } from '@/components/support/ticket-form';
import { useCreateTicket } from '@/hooks/useTickets';
import type { CreateTicketDto } from '@/types/api.types';
import { PageHeader } from '@/components/PageHeader';

export default function NewTicketPage() {
  const router = useRouter();
  const createMutation = useCreateTicket();

  const handleSubmit = (data: CreateTicketDto) => {
    createMutation.mutate(data, {
      onSuccess: (response) => {
        router.push(`/support/tickets/${response.id}`);
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="New Support Ticket"
        subtitle="Create a new customer support ticket"
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />
      <TicketForm onSubmit={handleSubmit} isLoading={createMutation.isPending} submitLabel="Create Ticket" />
    </div>
  );
}
