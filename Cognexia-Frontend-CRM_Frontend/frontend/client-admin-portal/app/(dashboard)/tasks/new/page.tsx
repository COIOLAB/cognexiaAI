'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskForm } from '@/components/tasks/task-form';
import { useCreateTask } from '@/hooks/useTasks';
import type { CreateTaskDto } from '@/types/api.types';

export default function NewTaskPage() {
  const router = useRouter();
  const createMutation = useCreateTask();

  const handleSubmit = (data: CreateTaskDto) => {
    createMutation.mutate(data, {
      onSuccess: (response) => router.push(`/tasks/${response.id}`),
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Task</h1>
          <p className="text-muted-foreground">Create a new task</p>
        </div>
      </div>
      <TaskForm onSubmit={handleSubmit} isLoading={createMutation.isPending} submitLabel="Create Task" />
    </div>
  );
}
