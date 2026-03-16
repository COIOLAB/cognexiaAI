'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Phone, Mail, MessageSquare, Calendar, FileText, User, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetTimeline, useGetNotes } from '@/hooks/useActivities';
import type { Activity, Note, ActivityType } from '@/types/api.types';

const activityIcons: Record<string, React.ReactNode> = {
  NOTE: <FileText className="h-4 w-4" />,
  CALL: <Phone className="h-4 w-4" />,
  EMAIL: <Mail className="h-4 w-4" />,
  MEETING: <Calendar className="h-4 w-4" />,
  TASK: <FileText className="h-4 w-4" />,
  STATUS_CHANGE: <Clock className="h-4 w-4" />,
  CREATED: <User className="h-4 w-4" />,
  UPDATED: <User className="h-4 w-4" />,
};

interface ActivityTimelineProps {
  entityType: string;
  entityId: string;
  showNotes?: boolean;
  limit?: number;
}

export default function ActivityTimeline({
  entityType,
  entityId,
  showNotes = true,
  limit = 50,
}: ActivityTimelineProps) {
  const [filterType, setFilterType] = useState<string>('all');

  const { data: activities, isLoading: activitiesLoading } = useGetTimeline(
    entityType,
    entityId,
    limit
  );
  const { data: notes, isLoading: notesLoading } = useGetNotes(
    entityType,
    entityId
  );

  const filteredActivities =
    filterType === 'all'
      ? activities?.data
      : activities?.data?.filter((activity) => activity.activityType === filterType);

  if (activitiesLoading) {
    return <div>Loading activity timeline...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Activities */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Activity Timeline</CardTitle>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="NOTE">Notes</SelectItem>
                <SelectItem value="CALL">Calls</SelectItem>
                <SelectItem value="EMAIL">Emails</SelectItem>
                <SelectItem value="MEETING">Meetings</SelectItem>
                <SelectItem value="TASK">Tasks</SelectItem>
                <SelectItem value="STATUS_CHANGE">Status Changes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredActivities && filteredActivities.length > 0 ? (
              filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex gap-4 border-b pb-4 last:border-0"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {activityIcons[activity.activityType] || (
                      <MessageSquare className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{activity.activityType}</Badge>
                          {activity.performedByName && (
                            <span className="text-sm text-muted-foreground">
                              by {activity.performedByName}
                            </span>
                          )}
                        </div>
                        {activity.description && (
                          <p className="mt-2 text-sm">{activity.description}</p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(
                          new Date(activity.createdAt),
                          'MMM dd, yyyy h:mm a'
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No activities found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes Section */}
      {showNotes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notesLoading ? (
                <div>Loading notes...</div>
              ) : notes?.data && notes.data.length > 0 ? (
                notes.data.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {note.isPinned && (
                          <Badge variant="secondary" className="mb-2">
                            Pinned
                          </Badge>
                        )}
                        <p className="text-sm">{note.content}</p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                          {note.createdByName && (
                            <span>by {note.createdByName}</span>
                          )}
                          <span>•</span>
                          <span>
                            {format(new Date(note.createdAt), 'MMM dd, yyyy h:mm a')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No notes yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
