import apiClient from '@/lib/api-client';
import type {
  Activity,
  CreateActivityDto,
  Note,
  CreateNoteDto,
  ApiResponse,
} from '@/types/api.types';

const ACTIVITY_BASE = '/activity';

export const activityApi = {
  // Log activity manually
  logActivity: async (activityData: CreateActivityDto) => {
    const { data } = await apiClient.post<ApiResponse<Activity>>(`${ACTIVITY_BASE}/log`, activityData);
    return data;
  },

  // Get activity timeline for entity
  getTimeline: async (entityType: string, entityId: string, limit: number = 50) => {
    const { data } = await apiClient.get<ApiResponse<Activity[]>>(
      `${ACTIVITY_BASE}/timeline/${entityType}/${entityId}?limit=${limit}`
    );
    return data;
  },

  // Create note
  createNote: async (noteData: CreateNoteDto) => {
    const { data } = await apiClient.post<ApiResponse<Note>>(`${ACTIVITY_BASE}/notes`, noteData);
    return data;
  },

  // Get notes for entity
  getNotes: async (entityType: string, entityId: string) => {
    const { data } = await apiClient.get<ApiResponse<Note[]>>(
      `${ACTIVITY_BASE}/notes/${entityType}/${entityId}`
    );
    return data;
  },

  // Update note
  updateNote: async (id: string, content: string) => {
    const { data } = await apiClient.put<ApiResponse<Note>>(`${ACTIVITY_BASE}/notes/${id}`, { content });
    return data;
  },

  // Delete note
  deleteNote: async (id: string) => {
    const { data } = await apiClient.delete<ApiResponse<void>>(`${ACTIVITY_BASE}/notes/${id}`);
    return data;
  },

  // Toggle pin note
  togglePinNote: async (id: string) => {
    const { data } = await apiClient.post<ApiResponse<Note>>(`${ACTIVITY_BASE}/notes/${id}/pin`);
    return data;
  },
};
