'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, MapPin, Link as LinkIcon, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGetEvent, useDeleteEvent } from '@/hooks/useEvents';
import { EventType } from '@/types/api.types';
import { format } from 'date-fns';
import Link from 'next/link';

const eventTypeColors: Record<EventType, string> = {
  [EventType.MEETING]: 'bg-blue-500',
  [EventType.CALL]: 'bg-green-500',
  [EventType.DEMO]: 'bg-purple-500',
  [EventType.FOLLOWUP]: 'bg-yellow-500',
  [EventType.DEADLINE]: 'bg-red-500',
  [EventType.OTHER]: 'bg-gray-500',
};

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const { data: event, isLoading } = useGetEvent(eventId);
  const deleteEvent = useDeleteEvent();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!event) {
    return <div>Event not found</div>;
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this event?')) {
      deleteEvent.mutate(eventId, {
        onSuccess: () => {
          router.push('/calendar');
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/calendar">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{event.title}</h1>
            <p className="text-sm text-muted-foreground">
              {format(new Date(event.startTime), 'EEEE, MMMM dd, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/calendar/events/${eventId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 md:col-span-2">
          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <div className="mt-1">
                  <Badge className={eventTypeColors[event.eventType]}>
                    {event.eventType}
                  </Badge>
                </div>
              </div>

              {event.description && (
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {event.description}
                  </p>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Start Time</label>
                  <p className="mt-1 text-sm">
                    {format(new Date(event.startTime), 'h:mm a')}
                  </p>
                </div>

                {event.endTime && (
                  <div>
                    <label className="text-sm font-medium">End Time</label>
                    <p className="mt-1 text-sm">
                      {format(new Date(event.endTime), 'h:mm a')}
                    </p>
                  </div>
                )}
              </div>

              {event.location && (
                <div>
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </label>
                  <p className="mt-1 text-sm">{event.location}</p>
                </div>
              )}

              {event.meetingLink && (
                <div>
                  <label className="text-sm font-medium flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    Meeting Link
                  </label>
                  <a
                    href={event.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block text-sm text-blue-600 hover:underline"
                  >
                    {event.meetingLink}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attendees */}
          {event.attendees && event.attendees.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Attendees ({event.attendees.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {event.attendees.map((attendee, index) => (
                    <div
                      key={`${attendee.userId}-${index}`}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{attendee.email}</p>
                        <p className="text-sm text-muted-foreground">
                          User ID: {attendee.userId}
                        </p>
                      </div>
                      <Badge
                        variant={
                          attendee.status === 'accepted'
                            ? 'default'
                            : attendee.status === 'declined'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {attendee.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Type</span>
                <Badge className={eventTypeColors[event.eventType]}>
                  {event.eventType}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Date</span>
                <span className="text-sm">
                  {format(new Date(event.startTime), 'MMM dd, yyyy')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Time</span>
                <span className="text-sm">
                  {format(new Date(event.startTime), 'h:mm a')}
                  {event.endTime &&
                    ` - ${format(new Date(event.endTime), 'h:mm a')}`}
                </span>
              </div>
              {event.attendees && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Attendees
                  </span>
                  <span className="text-sm">{event.attendees.length}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Related To */}
          {event.relatedToType && (
            <Card>
              <CardHeader>
                <CardTitle>Related To</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {event.relatedToType}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
