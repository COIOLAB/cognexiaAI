'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { activityApi } from '@/services/activity.api';
import { PageHeader } from '@/components/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function ActivitiesPage() {
  const [entityType, setEntityType] = useState('customer');
  const [entityId, setEntityId] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const timelineQuery = useQuery({
    queryKey: ['activity', 'timeline', entityType, entityId],
    queryFn: () => activityApi.getTimeline(entityType, entityId, 50),
    enabled: false,
  });

  const notesQuery = useQuery({
    queryKey: ['activity', 'notes', entityType, entityId],
    queryFn: () => activityApi.getNotes(entityType, entityId),
    enabled: false,
  });

  const createNote = useMutation({
    mutationFn: () =>
      activityApi.createNote({
        relatedToType: entityType,
        relatedToId: entityId,
        content: noteContent,
      }),
    onSuccess: () => {
      toast.success('Note created');
      setNoteContent('');
      notesQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create note');
    },
  });

  const FieldLabel = ({ label, tooltip }: { label: string; tooltip?: string }) => (
    <div className="flex items-center gap-2 text-sm font-medium">
      <span>{label}</span>
      {tooltip && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-help rounded-full border px-1 text-[10px] text-muted-foreground">?</span>
          </TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <PageHeader
          title="Activities"
          subtitle="View timeline activities and notes."
          actions={
            <Button
              variant="outline"
              onClick={() => {
                if (!entityId) {
                  toast.error('Entity ID is required');
                  return;
                }
                timelineQuery.refetch();
                notesQuery.refetch();
              }}
            >
              Refresh
            </Button>
          }
        />

      <Card>
        <CardHeader>
          <CardTitle>Load Activity</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <FieldLabel label="Entity Type" tooltip="customer, lead, opportunity, etc." />
            <Input value={entityType} onChange={(e) => setEntityType(e.target.value)} />
          </div>
          <div className="flex-1">
            <FieldLabel label="Entity ID" tooltip="ID of the entity you want to inspect." />
            <Input value={entityId} onChange={(e) => setEntityId(e.target.value)} placeholder="entity-id" />
          </div>
          <Button
            onClick={() => {
              if (!entityId) {
                toast.error('Entity ID is required');
                return;
              }
              timelineQuery.refetch();
              notesQuery.refetch();
            }}
          >
            Fetch
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {timelineQuery.isFetching ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
              </div>
            ) : (timelineQuery.data?.data || []).length === 0 ? (
              <div className="text-sm text-muted-foreground">No timeline activity yet.</div>
            ) : (
              <div className="space-y-3">
                {(timelineQuery.data?.data || []).map((item: any, index: number) => (
                  <div key={item.id || index} className="rounded-lg border p-3">
                    <div className="text-sm font-medium">
                      {item.title || item.action || 'Activity'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.description || item.summary || 'Activity update'}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {item.createdAt ? String(item.createdAt) : '—'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            {notesQuery.isFetching ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
              </div>
            ) : (notesQuery.data?.data || []).length === 0 ? (
              <div className="text-sm text-muted-foreground">No notes yet.</div>
            ) : (
              <div className="space-y-3">
                {(notesQuery.data?.data || []).map((note: any, index: number) => (
                  <div key={note.id || index} className="rounded-lg border p-3">
                    <div className="text-sm">{note.content || note.note || 'Note'}</div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {note.createdAt ? String(note.createdAt) : '—'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Note</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FieldLabel label="Note Content" tooltip="Add a note for this entity." />
          <Textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            rows={4}
            placeholder="Add a note for this entity"
          />
          <Button
            onClick={() => {
              if (!entityId || !noteContent.trim()) {
                toast.error('Entity ID and note content are required');
                return;
              }
              createNote.mutate();
            }}
            disabled={createNote.isPending}
          >
            {createNote.isPending ? 'Saving...' : 'Save Note'}
          </Button>
        </CardContent>
      </Card>
    </div>
  </TooltipProvider>
  );
}
