'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskForm } from '@/components/tasks/task-form';
import { useGetTask, useUpdateTask } from '@/hooks/useTasks';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditTaskPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;
  const { data, isLoading } = useGetTask(taskId);
  const updateMutation = useUpdateTask();

  if (isLoading) return <div className="flex flex-col gap-6 p-6"><Skeleton className="h-[600px]" /></div>;
  if (!data) return <div className="flex flex-col items-center justify-center gap-4 p-6"><h2 className="text-2xl font-bold">Task not found</h2><Button onClick={() => router.push('/tasks')}>Back</Button></div>;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Task</h1>
          <p className="text-muted-foreground">{data.title}</p>
        </div>
      </div>
      <TaskForm initialData={data} onSubmit={(formData) => updateMutation.mutate({ id: taskId, data: formData }, { onSuccess: () => router.push(`/tasks/${taskId}`) })} isLoading={updateMutation.isPending} submitLabel="Save Changes" />
    </div>
  );
}
