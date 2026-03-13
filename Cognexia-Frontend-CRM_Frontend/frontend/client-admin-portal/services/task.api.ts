import { api } from '@/lib/api';
import type {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskQueryDto,
  TaskStatistics,
} from '@/types/api.types';

const TASK_BASE = '/activity/tasks';

export const taskApi = {
  // Get tasks with filters
  getTasks: async (query?: TaskQueryDto, page: number = 1, limit: number = 20) => {
    const params = new URLSearchParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    const { data } = await api.get<{ data: Task[]; total: number }>(
      `${TASK_BASE}?${params.toString()}`
    );
    return data;
  },

  // Get task by ID
  getTaskById: async (id: string) => {
    const { data } = await api.get<Task>(`${TASK_BASE}/${id}`);
    return data;
  },

  // Get my tasks
  getMyTasks: async (status?: string) => {
    const params = new URLSearchParams();
    if (status) {
      params.append('status', status);
    }
    const { data } = await api.get<{ data: Task[] }>(`${TASK_BASE}/my?${params.toString()}`);
    return data;
  },

  // Get overdue tasks
  getOverdueTasks: async () => {
    const { data } = await api.get<{ data: Task[] }>(`${TASK_BASE}/overdue`);
    return data;
  },

  // Create task
  createTask: async (taskData: CreateTaskDto) => {
    const { data } = await api.post<Task>(TASK_BASE, taskData);
    return data;
  },

  // Update task
  updateTask: async (id: string, taskData: UpdateTaskDto) => {
    const { data } = await api.put<Task>(`${TASK_BASE}/${id}`, taskData);
    return data;
  },

  // Delete task
  deleteTask: async (id: string) => {
    const { data } = await api.delete(`${TASK_BASE}/${id}`);
    return data;
  },

  // Get task statistics
  getTaskStats: async (userId?: string) => {
    const params = new URLSearchParams();
    if (userId) {
      params.append('userId', userId);
    }
    const { data } = await api.get<TaskStatistics>(
      `${TASK_BASE}/stats?${params.toString()}`
    );
    return data;
  },
};
