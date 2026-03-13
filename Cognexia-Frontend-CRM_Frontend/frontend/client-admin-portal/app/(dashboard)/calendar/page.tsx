'use client';

import { useState } from 'react';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGetEvents, useGetUpcomingEvents } from '@/hooks/useEvents';
import { EventType, type Event } from '@/types/api.types';
import Link from 'next/link';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const eventTypeColors: Record<EventType, string> = {
  [EventType.MEETING]: 'bg-blue-500',
  [EventType.CALL]: 'bg-green-500',
  [EventType.DEMO]: 'bg-purple-500',
  [EventType.FOLLOWUP]: 'bg-yellow-500',
  [EventType.DEADLINE]: 'bg-red-500',
  [EventType.OTHER]: 'bg-gray-500',
};

export default function CalendarPage() {
  const [currentDate] = useState(new Date());

  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);

  const { data: events, isLoading } = useGetEvents({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });
  const { data: upcomingEvents } = useGetUpcomingEvents(10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">
            Manage your events and schedule
          </p>
        </div>
        <Button asChild>
          <Link href="/calendar/events/new">
            <Plus className="mr-2 h-4 w-4" />
            New Event
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Calendar Area */}
        <div className="space-y-6 md:col-span-2">
          {/* Month Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  {format(currentDate, 'MMMM yyyy')}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {/* Events List */}
              <div className="space-y-4">
                {isLoading ? (
                  <div>Loading events...</div>
                ) : events?.data && events.data.length > 0 ? (
                  events.data.map((event: Event) => (
                    <Link
                      key={event.id}
                      href={`/calendar/events/${event.id}`}
                      className="block rounded-lg border p-4 hover:bg-accent"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge className={eventTypeColors[event.eventType]}>
                              {event.eventType}
                            </Badge>
                            <h3 className="font-medium">{event.title}</h3>
                          </div>
                          {event.description && (
                            <p className="mt-2 text-sm text-muted-foreground">
                              {event.description}
                            </p>
                          )}
                          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              {format(new Date(event.startTime), 'MMM dd, h:mm a')}
                            </span>
                            {event.endTime && (
                              <>
                                <span>-</span>
                                <span>
                                  {format(new Date(event.endTime), 'h:mm a')}
                                </span>
                              </>
                            )}
                          </div>
                          {event.location && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              📍 {event.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No events scheduled for this month
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingEvents?.data && upcomingEvents.data.length > 0 ? (
                  upcomingEvents.data.map((event: Event) => (
                    <Link
                      key={event.id}
                      href={`/calendar/events/${event.id}`}
                      className="block rounded-lg border p-3 hover:bg-accent"
                    >
                      <div className="flex items-start gap-2">
                        <Badge
                          className={`${eventTypeColors[event.eventType]} text-xs`}
                        >
                          {event.eventType}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{event.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(event.startTime), 'MMM dd, h:mm a')}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    No upcoming events
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Events
                  </span>
                  <span className="text-sm font-medium">
                    {events?.data?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Meetings
                  </span>
                  <span className="text-sm font-medium">
                    {events?.data?.filter((e: Event) => e.eventType === EventType.MEETING)
                      .length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Calls</span>
                  <span className="text-sm font-medium">
                    {events?.data?.filter((e: Event) => e.eventType === EventType.CALL)
                      .length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Demos</span>
                  <span className="text-sm font-medium">
                    {events?.data?.filter((e: Event) => e.eventType === EventType.DEMO)
                      .length || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
