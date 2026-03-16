import apiClient from '@/lib/api-client';
import { createResourceApi } from './resource.api';

export const mobileApi = {
  ...createResourceApi('/mobile'),

  getDevices: async () => {
    const { data } = await apiClient.get('/mobile/devices');
    return data;
  },

  registerDevice: async (payload: any) => {
    const { data } = await apiClient.post('/mobile/devices/register', payload);
    return data;
  },

  refreshPushToken: async (deviceId: string, payload: any) => {
    const { data } = await apiClient.post(`/mobile/devices/${deviceId}/token`, payload);
    return data;
  },

  pairDevice: async (deviceId: string, otp: string) => {
    const { data } = await apiClient.post(`/mobile/devices/${deviceId}/pair`, { deviceId, otp });
    return data;
  },

  getNotifications: async () => {
    const { data } = await apiClient.get('/mobile/notifications');
    return data;
  },

  sendNotification: async (payload: any) => {
    const { data } = await apiClient.post('/mobile/notifications/send', payload);
    return data;
  },

  getSyncStats: async () => {
    const { data } = await apiClient.get('/mobile/sync/statistics');
    return data;
  },

  getSyncConflicts: async () => {
    const { data } = await apiClient.get('/mobile/sync/conflicts');
    return data;
  },

  resolveSyncConflict: async (payload: any) => {
    const { data } = await apiClient.post('/mobile/sync/conflicts/resolve', payload);
    return data;
  },

  requestPhoneOtp: async (phoneNumber: string) => {
    const { data } = await apiClient.post('/mobile/phone/otp/request', { phoneNumber });
    return data;
  },

  verifyPhoneOtp: async (phoneNumber: string, otp: string) => {
    const { data } = await apiClient.post('/mobile/phone/otp/verify', { phoneNumber, otp });
    return data;
  },

  getProviderHealth: async () => {
    const { data } = await apiClient.get('/mobile/providers/health');
    return data;
  },

  refreshProviderHealth: async () => {
    const { data } = await apiClient.post('/mobile/providers/health/refresh');
    return data;
  },

  getTemplates: async () => {
    const { data } = await apiClient.get('/mobile/templates');
    return data;
  },

  createTemplate: async (payload: any) => {
    const { data } = await apiClient.post('/mobile/templates', payload);
    return data;
  },

  updateTemplate: async (id: string, payload: any) => {
    const { data } = await apiClient.put(`/mobile/templates/${id}`, payload);
    return data;
  },

  deleteTemplate: async (id: string) => {
    const { data } = await apiClient.delete(`/mobile/templates/${id}`);
    return data;
  },
};
