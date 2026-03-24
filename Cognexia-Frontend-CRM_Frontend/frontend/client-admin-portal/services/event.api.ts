import { api } from '@/lib/api';
import type {
  Event,
  CreateEventDto,
  UpdateEventDto,
  EventQueryDto,
} from '@/types/api.types';

const EVENT_BASE = '/crm/calendar/events';

export const eventApi = {
  // Get events with filters
  getEvents: async (query?: EventQueryDto) => {
    const params = new URLSearchParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const { data: response } = await api.get<{ success: boolean; data: Event[]; total: number }>(
      `${EVENT_BASE}?${params.toString()}`
    );
    return { data: response.data ?? [], total: response.total ?? 0 };
  },

  // Get event by ID
  getEventById: async (id: string) => {
    const { data: response } = await api.get<{ success: boolean; data: Event }>(`${EVENT_BASE}/${id}`);
    return response.data;
  },

  // Create event
  createEvent: async (eventData: CreateEventDto) => {
    const { data: response } = await api.post<{ success: boolean; data: Event }>(EVENT_BASE, eventData);
    return response.data;
  },

  // Update event
  updateEvent: async (id: string, eventData: UpdateEventDto) => {
    const { data: response } = await api.put<{ success: boolean; data: Event }>(`${EVENT_BASE}/${id}`, eventData);
    return response.data;
  },

  // Delete event
  deleteEvent: async (id: string) => {
    const { data: response } = await api.delete<{ success: boolean; message: string }>(`${EVENT_BASE}/${id}`);
    return response;
  },

  // Get upcoming events
  getUpcomingEvents: async (limit: number = 10) => {
    const { data: response } = await api.get<{ success: boolean; data: Event[] }>(
      `${EVENT_BASE}/upcoming?limit=${limit}`
    );
    return { data: response.data ?? [] };
  },

  // Get events by date range
  getEventsByDate: async (startDate: string, endDate: string) => {
    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    const { data: response } = await api.get<{ success: boolean; data: Event[] }>(
      `${EVENT_BASE}?${params.toString()}`
    );
    return { data: response.data ?? [] };
  },
};

