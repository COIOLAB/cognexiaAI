'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  FileText,
  User,
  Clock,
  Plus,
  Pin,
  Edit2,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { activityApi } from '@/services/activity.api';
import { toast } from 'sonner';
import type { Activity, Note } from '@/types/api.types';

interface CustomerActivitiesTabProps {
  customerId: string;
}

const activityIcons: Record<string, React.ReactNode> = {
  call: <Phone className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  meeting: <Calendar className="h-4 w-4" />,
  note: <MessageSquare className="h-4 w-4" />,
  task: <FileText className="h-4 w-4" />,
};

export function CustomerActivitiesTab({ customerId }: CustomerActivitiesTabProps) {
  const queryClient = useQueryClient();
  const [noteContent, setNoteContent] = React.useState('');
  const [editingNote, setEditingNote] = React.useState<string | null>(null);
  const [editContent, setEditContent] = React.useState('');

  // Fetch activities
  const { data: activitiesData, isLoading: activitiesLoading } = useQuery({
    queryKey: ['customer-activities', customerId],
    queryFn: () => activityApi.getTimeline('customer', customerId, 100),
    staleTime: 30000,
  });

  // Fetch notes
  const { data: notesData, isLoading: notesLoading } = useQuery({
    queryKey: ['customer-notes', customerId],
    queryFn: () => activityApi.getNotes('customer', customerId),
    staleTime: 30000,
  });

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: (content: string) =>
      activityApi.createNote({
        content,
        relatedToType: 'customer',
        relatedToId: customerId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-notes', customerId] });
      queryClient.invalidateQueries({ queryKey: ['customer-activities', customerId] });
      setNoteContent('');
      toast.success('Note added successfully');
    },
    onError: () => {
      toast.error('Failed to add note');
    },
  });

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      activityApi.updateNote(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-notes', customerId] });
      setEditingNote(null);
      setEditContent('');
      toast.success('Note updated successfully');
    },
    onError: () => {
      toast.error('Failed to update note');
    },
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: (id: string) => activityApi.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-notes', customerId] });
      queryClient.invalidateQueries({ queryKey: ['customer-activities', customerId] });
      toast.success('Note deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete note');
    },
  });

  // Pin note mutation
  const pinNoteMutation = useMutation({
    mutationFn: (id: string) => activityApi.togglePinNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-notes', customerId] });
      toast.success('Note pin status updated');
    },
    onError: () => {
      toast.error('Failed to update note');
    },
  });

  const activities = activitiesData?.data || [];
  const notes = notesData?.data || [];

  const handleAddNote = () => {
    if (!noteContent.trim()) {
      toast.error('Note content cannot be empty');
      return;
    }
    createNoteMutation.mutate(noteContent);
  };

  const handleUpdateNote = (id: string) => {
    if (!editContent.trim()) {
      toast.error('Note content cannot be empty');
      return;
    }
    updateNoteMutation.mutate({ id, content: editContent });
  };

  const handleDeleteNote = (id: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      deleteNoteMutation.mutate(id);
    }
  };

  const startEditNote = (note: Note) => {
    setEditingNote(note.id);
    setEditContent(note.content);
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setEditContent('');
  };

  if (activitiesLoading || notesLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px]" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Notes Section */}
      <div className="md:col-span-1 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Quick Notes</CardTitle>
            <CardDescription>Add notes about this customer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Note */}
            <div className="space-y-2">
              <Textarea
                placeholder="Type your note here..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={4}
              />
              <Button
                onClick={handleAddNote}
                disabled={createNoteMutation.isPending}
                size="sm"
                className="w-full"
              >
                {createNoteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Plus className="mr-2 h-4 w-4" />
                Add Note
              </Button>
            </div>

            {/* Notes List */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {notes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No notes yet. Add your first note above.
                </p>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className={`p-3 rounded-lg border ${
                      note.isPinned ? 'bg-yellow-50 border-yellow-300' : 'bg-muted/50'
                    }`}
                  >
                    {editingNote === note.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleUpdateNote(note.id)}>
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm">{note.content}</p>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => pinNoteMutation.mutate(note.id)}
                            >
                              <Pin
                                className={`h-3 w-3 ${note.isPinned ? 'fill-current' : ''}`}
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => startEditNote(note)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleDeleteNote(note.id)}
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{note.createdByName || 'Unknown'}</span>
                          <span>•</span>
                          <Clock className="h-3 w-3" />
                          <span>{format(new Date(note.createdAt), 'MMM d, yyyy')}</span>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
            <CardDescription>Recent interactions and activities</CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">No activities yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Activities will appear here as you interact with this customer
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={activity.id} className="flex gap-4">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background">
                        {activityIcons[activity.activityType] || <MessageSquare className="h-4 w-4" />}
                      </div>
                      {index < activities.length - 1 && (
                        <div className="h-full w-[2px] bg-border mt-2" />
                      )}
                    </div>

                    {/* Activity content */}
                    <div className="flex-1 pb-8">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium capitalize">{activity.activityType}</p>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(activity.createdAt), 'MMM d, yyyy h:mm a')}
                        </div>
                      </div>
                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <div className="mt-2 p-2 rounded bg-muted/50 text-xs">
                          {Object.entries(activity.metadata).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium">{key}:</span> {String(value)}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>
                          {activity.performedByName || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
