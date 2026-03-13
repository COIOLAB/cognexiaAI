'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGetEvent, useUpdateEvent } from '@/hooks/useEvents';
import EventForm from '../../../event-form';
import Link from 'next/link';

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const { data: event, isLoading } = useGetEvent(eventId);
  const updateEvent = useUpdateEvent();

  const handleSubmit = (data: any) => {
    updateEvent.mutate(
      { id: eventId, data },
      {
        onSuccess: () => {
          router.push(`/calendar/events/${eventId}`);
        },
      }
    );
  };

  const handleCancel = () => {
    router.push(`/calendar/events/${eventId}`);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!event) {
    return <div>Event not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/calendar/events/${eventId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Event</h1>
          <p className="text-muted-foreground">Update event details</p>
        </div>
      </div>

      <EventForm
        event={event}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={updateEvent.isPending}
      />
    </div>
  );
}
