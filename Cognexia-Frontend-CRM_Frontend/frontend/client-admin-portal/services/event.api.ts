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
    const { data } = await api.get<{ data: Event[]; total: number }>(
      `${EVENT_BASE}?${params.toString()}`
    );
    return data;
  },

  // Get event by ID
  getEventById: async (id: string) => {
    const { data } = await api.get<Event>(`${EVENT_BASE}/${id}`);
    return data;
  },

  // Create event
  createEvent: async (eventData: CreateEventDto) => {
    const { data } = await api.post<Event>(EVENT_BASE, eventData);
    return data;
  },

  // Update event
  updateEvent: async (id: string, eventData: UpdateEventDto) => {
    const { data } = await api.put<Event>(`${EVENT_BASE}/${id}`, eventData);
    return data;
  },

  // Delete event
  deleteEvent: async (id: string) => {
    const { data } = await api.delete(`${EVENT_BASE}/${id}`);
    return data;
  },

  // Get upcoming events
  getUpcomingEvents: async (limit: number = 10) => {
    const { data } = await api.get<{ data: Event[] }>(
      `${EVENT_BASE}/upcoming?limit=${limit}`
    );
    return data;
  },

  // Get events by date range
  getEventsByDate: async (startDate: string, endDate: string) => {
    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    const { data } = await api.get<{ data: Event[] }>(
      `${EVENT_BASE}?${params.toString()}`
    );
    return data;
  },
};
