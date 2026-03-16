import apiClient from '@/lib/api-client';
import type {
  Call,
  InitiateCallDto,
  UpdateCallDto,
  CallRecording,
  CallQueue,
  CreateQueueDto,
  UpdateQueueDto,
  CallAnalytics,
} from '@/types/api.types';

const CALL_URL = '/calls';
const QUEUE_URL = '/call-queues';
const IVR_URL = '/ivr-menus';

// Call API
export const callApi = {
  async getCalls(): Promise<Call[]> {
    const response = await apiClient.get(CALL_URL);
    return response.data;
  },

  async getCallById(id: string): Promise<Call> {
    const response = await apiClient.get(`${CALL_URL}/${id}`);
    return response.data;
  },

  async getActiveCalls(): Promise<Call[]> {
    const response = await apiClient.get(`${CALL_URL}/recent`);
    return response.data;
  },

  async initiateCall(data: InitiateCallDto): Promise<Call> {
    const response = await apiClient.post(CALL_URL, data);
    return response.data;
  },

  async endCall(id: string): Promise<void> {
    await apiClient.post(`${CALL_URL}/${id}/hangup`);
  },

  async updateCall(id: string, data: UpdateCallDto): Promise<Call> {
    const response = await apiClient.put(`${CALL_URL}/${id}`, data);
    return response.data;
  },

  async transferCall(id: string, toAgentId: string): Promise<void> {
    await apiClient.post(`${CALL_URL}/${id}/transfer`, { toAgentId });
  },

  async getCallRecording(_callId: string): Promise<CallRecording[]> {
    return [];
  },

  async getCallTranscription(_callId: string): Promise<{ transcript: string; confidence: number }> {
    return { transcript: '', confidence: 0 };
  },

  async getCallAnalytics(startDate?: string, endDate?: string): Promise<CallAnalytics> {
    const response = await apiClient.get('/call-analytics', {
      params: { startDate, endDate },
    });
    return response.data;
  },
};

// IVR API
export const ivrApi = {
  async getIVRFlows(): Promise<any[]> {
    const response = await apiClient.get(IVR_URL);
    return response.data;
  },

  async getIVRFlow(id: string): Promise<any> {
    const response = await apiClient.get(`${IVR_URL}/${id}`);
    return response.data;
  },

  async createIVRFlow(payload: any): Promise<any> {
    const response = await apiClient.post(IVR_URL, payload);
    return response.data;
  },

  async updateIVRFlow(id: string, payload: any): Promise<any> {
    const response = await apiClient.put(`${IVR_URL}/${id}`, payload);
    return response.data;
  },

  async deleteIVRFlow(id: string): Promise<any> {
    const response = await apiClient.delete(`${IVR_URL}/${id}`);
    return response.data;
  },

  async testIVRFlow(id: string): Promise<any> {
    const response = await apiClient.post(`${IVR_URL}/${id}/test`);
    return response.data;
  },
};

// Queue API
export const queueApi = {
  async getQueues(): Promise<CallQueue[]> {
    const response = await apiClient.get(QUEUE_URL);
    return response.data;
  },

  async getQueueById(id: string): Promise<CallQueue> {
    const response = await apiClient.get(`${QUEUE_URL}/${id}`);
    return response.data;
  },

  async getQueueStats(id: string): Promise<{
    currentQueueSize: number;
    averageWaitTime: number;
    agentsAvailable: number;
    callsHandledToday: number;
  }> {
    const response = await apiClient.get(`${QUEUE_URL}/${id}/statistics`);
    return response.data;
  },

  async createQueue(data: CreateQueueDto): Promise<CallQueue> {
    const response = await apiClient.post(QUEUE_URL, data);
    return response.data;
  },

  async updateQueue(id: string, data: UpdateQueueDto): Promise<CallQueue> {
    const response = await apiClient.put(`${QUEUE_URL}/${id}`, data);
    return response.data;
  },

  async deleteQueue(id: string): Promise<void> {
    await apiClient.delete(`${QUEUE_URL}/${id}`);
  },

  async getIVRFlows(): Promise<any[]> {
    return ivrApi.getIVRFlows();
  },
};
