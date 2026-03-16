'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useGetTask, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { useGetTimeline, useCreateNote } from '@/hooks/useActivities';
import { TaskStatus, TaskPriority } from '@/types/api.types';
import { format } from 'date-fns';
import Link from 'next/link';

const statusColors: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'bg-gray-500',
  [TaskStatus.IN_PROGRESS]: 'bg-blue-500',
  [TaskStatus.WAITING]: 'bg-yellow-500',
  [TaskStatus.COMPLETED]: 'bg-green-500',
  [TaskStatus.CANCELLED]: 'bg-red-500',
};

const priorityColors: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'bg-gray-400',
  [TaskPriority.MEDIUM]: 'bg-blue-400',
  [TaskPriority.HIGH]: 'bg-orange-400',
  [TaskPriority.URGENT]: 'bg-red-600',
};

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;

  const [newNote, setNewNote] = useState('');

  const { data: task, isLoading } = useGetTask(taskId);
  const { data: timeline } = useGetTimeline('Task', taskId);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const createNote = useCreateNote();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!task) {
    return <div>Task not found</div>;
  }

  const handleStatusChange = (status: TaskStatus) => {
    updateTask.mutate({ id: taskId, data: { status } });
  };

  const handlePriorityChange = (priority: TaskPriority) => {
    updateTask.mutate({ id: taskId, data: { priority } });
  };

  const handleComplete = () => {
    updateTask.mutate({
      id: taskId,
      data: { status: TaskStatus.COMPLETED },
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask.mutate(taskId, {
        onSuccess: () => {
          router.push('/tasks');
        },
      });
    }
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    createNote.mutate(
      {
        content: newNote,
        relatedToType: 'Task',
        relatedToId: taskId,
      },
      {
        onSuccess: () => {
          setNewNote('');
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/tasks">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{task.title}</h1>
            <p className="text-sm text-muted-foreground">
              Created {format(new Date(task.createdAt), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {task.status !== TaskStatus.COMPLETED && (
            <Button onClick={handleComplete}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark Complete
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href={`/tasks/${taskId}/edit`}>
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
          {/* Task Details */}
          <Card>
            <CardHeader>
              <CardTitle>Task Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {task.description && (
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {task.description}
                  </p>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={task.status}
                    onValueChange={(value) =>
                      handleStatusChange(value as TaskStatus)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TaskStatus.TODO}>To Do</SelectItem>
                      <SelectItem value={TaskStatus.IN_PROGRESS}>
                        In Progress
                      </SelectItem>
                      <SelectItem value={TaskStatus.WAITING}>Waiting</SelectItem>
                      <SelectItem value={TaskStatus.COMPLETED}>
                        Completed
                      </SelectItem>
                      <SelectItem value={TaskStatus.CANCELLED}>
                        Cancelled
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={task.priority}
                    onValueChange={(value) =>
                      handlePriorityChange(value as TaskPriority)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                      <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                      <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                      <SelectItem value={TaskPriority.URGENT}>Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {task.dueDate && (
                <div>
                  <label className="text-sm font-medium">Due Date</label>
                  <p className="mt-1 text-sm">
                    {format(new Date(task.dueDate), 'MMMM dd, yyyy')}
                  </p>
                </div>
              )}

              {task.assignedToName && (
                <div>
                  <label className="text-sm font-medium">Assigned To</label>
                  <p className="mt-1 text-sm">{task.assignedToName}</p>
                </div>
              )}

              {task.relatedToType && (
                <div>
                  <label className="text-sm font-medium">Related To</label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {task.relatedToType}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeline?.data?.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex gap-3 border-b pb-4 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.activityType}</p>
                      {activity.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {format(new Date(activity.createdAt), 'MMM dd, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge className={statusColors[task.status]}>
                  {task.status.replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Priority</span>
                <Badge className={priorityColors[task.priority]}>
                  {task.priority}
                </Badge>
              </div>
              {task.completedAt && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Completed At
                  </span>
                  <span className="text-sm">
                    {format(new Date(task.completedAt), 'MMM dd, yyyy')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add Note */}
          <Card>
            <CardHeader>
              <CardTitle>Add Note</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Write a note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={4}
              />
              <Button
                onClick={handleAddNote}
                disabled={!newNote.trim() || createNote.isPending}
                className="w-full"
              >
                Add Note
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
