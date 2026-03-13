'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCreateEvent } from '@/hooks/useEvents';
import EventForm from '../../event-form';
import Link from 'next/link';

export default function NewEventPage() {
  const router = useRouter();
  const createEvent = useCreateEvent();

  const handleSubmit = (data: any) => {
    createEvent.mutate(data, {
      onSuccess: (response) => {
        router.push(`/calendar/events/${response.id}`);
      },
    });
  };

  const handleCancel = () => {
    router.push('/calendar');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/calendar">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Event</h1>
          <p className="text-muted-foreground">
            Schedule a new calendar event
          </p>
        </div>
      </div>

      <EventForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={createEvent.isPending}
      />
    </div>
  );
}
