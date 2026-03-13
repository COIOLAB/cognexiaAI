import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { callApi, ivrApi, queueApi } from '@/services/call.api';
import type {
  Call,
  InitiateCallDto,
  UpdateCallDto,
  CallQueue,
  CreateQueueDto,
  UpdateQueueDto,
} from '@/types/api.types';

const CALL_KEY = 'calls';
const QUEUE_KEY = 'queues';

// Call Hooks
export const useGetCalls = () => {
  return useQuery<Call[]>({
    queryKey: [CALL_KEY],
    queryFn: () => callApi.getCalls(),
  });
};

export const useGetCall = (id: string) => {
  return useQuery<Call>({
    queryKey: [CALL_KEY, id],
    queryFn: () => callApi.getCallById(id),
    enabled: !!id,
  });
};

export const useGetActiveCalls = () => {
  return useQuery<Call[]>({
    queryKey: [CALL_KEY, 'active'],
    queryFn: () => callApi.getActiveCalls(),
    refetchInterval: 5000, // Real-time updates every 5 seconds
  });
};

export const useInitiateCall = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InitiateCallDto) => callApi.initiateCall(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CALL_KEY] });
    },
  });
};

export const useEndCall = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => callApi.endCall(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CALL_KEY] });
    },
  });
};

export const useUpdateCall = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCallDto }) =>
      callApi.updateCall(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [CALL_KEY] });
      queryClient.invalidateQueries({ queryKey: [CALL_KEY, variables.id] });
    },
  });
};

export const useTransferCall = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, toAgentId }: { id: string; toAgentId: string }) =>
      callApi.transferCall(id, toAgentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CALL_KEY] });
    },
  });
};

export const useGetCallRecording = (callId: string) => {
  return useQuery({
    queryKey: [CALL_KEY, callId, 'recordings'],
    queryFn: () => callApi.getCallRecording(callId),
    enabled: !!callId,
  });
};

export const useGetCallTranscription = (callId: string) => {
  return useQuery({
    queryKey: [CALL_KEY, callId, 'transcription'],
    queryFn: () => callApi.getCallTranscription(callId),
    enabled: !!callId,
  });
};

export const useGetCallAnalytics = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: [CALL_KEY, 'analytics', startDate, endDate],
    queryFn: () => callApi.getCallAnalytics(startDate, endDate),
  });
};

// Queue Hooks
export const useGetQueues = () => {
  return useQuery<CallQueue[]>({
    queryKey: [QUEUE_KEY],
    queryFn: () => queueApi.getQueues(),
  });
};

export const useGetQueue = (id: string) => {
  return useQuery<CallQueue>({
    queryKey: [QUEUE_KEY, id],
    queryFn: () => queueApi.getQueueById(id),
    enabled: !!id,
  });
};

export const useGetQueueStats = (id: string) => {
  return useQuery({
    queryKey: [QUEUE_KEY, id, 'stats'],
    queryFn: () => queueApi.getQueueStats(id),
    enabled: !!id,
    refetchInterval: 10000, // Update every 10 seconds
  });
};

export const useCreateQueue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateQueueDto) => queueApi.createQueue(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUEUE_KEY] });
    },
  });
};

export const useUpdateQueue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQueueDto }) =>
      queueApi.updateQueue(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUEUE_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUEUE_KEY, variables.id] });
    },
  });
};

export const useDeleteQueue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => queueApi.deleteQueue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUEUE_KEY] });
    },
  });
};

export const useGetIVRFlows = () => {
  return useQuery({
    queryKey: ['ivr', 'flows'],
    queryFn: () => queueApi.getIVRFlows(),
  });
};

export const useCreateIVRFlow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => ivrApi.createIVRFlow(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ivr', 'flows'] });
    },
  });
};

export const useUpdateIVRFlow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => ivrApi.updateIVRFlow(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ivr', 'flows'] });
    },
  });
};

export const useDeleteIVRFlow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ivrApi.deleteIVRFlow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ivr', 'flows'] });
    },
  });
};

export const useTestIVRFlow = () => {
  return useMutation({
    mutationFn: (id: string) => ivrApi.testIVRFlow(id),
  });
};
