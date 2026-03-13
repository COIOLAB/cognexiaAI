import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '@/services/task.api';
import { toast } from 'sonner';
import type {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskQueryDto,
} from '@/types/api.types';

const QUERY_KEYS = {
  tasks: ['tasks'] as const,
  task: (id: string) => ['tasks', id] as const,
  myTasks: ['tasks', 'my'] as const,
  overdueTasks: ['tasks', 'overdue'] as const,
  taskStats: ['tasks', 'stats'] as const,
};

// Get tasks with filters
export const useGetTasks = (query?: TaskQueryDto, page?: number, limit?: number) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.tasks, query, page, limit],
    queryFn: () => taskApi.getTasks(query, page, limit),
  });
};

// Get task by ID
export const useGetTask = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.task(id),
    queryFn: () => taskApi.getTaskById(id),
    enabled: !!id,
  });
};

// Get my tasks
export const useGetMyTasks = (status?: string) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.myTasks, status],
    queryFn: () => taskApi.getMyTasks(status),
  });
};

// Get overdue tasks
export const useGetOverdueTasks = () => {
  return useQuery({
    queryKey: QUERY_KEYS.overdueTasks,
    queryFn: () => taskApi.getOverdueTasks(),
  });
};

// Create task
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskDto) => taskApi.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myTasks });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.taskStats });
      toast.success('Task created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create task');
    },
  });
};

// Update task
export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskDto }) =>
      taskApi.updateTask(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.task(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myTasks });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.overdueTasks });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.taskStats });
      toast.success('Task updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update task');
    },
  });
};

// Delete task
export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taskApi.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myTasks });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.taskStats });
      toast.success('Task deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete task');
    },
  });
};

// Get task statistics
export const useGetTaskStats = (userId?: string) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.taskStats, userId],
    queryFn: () => taskApi.getTaskStats(userId),
  });
};
