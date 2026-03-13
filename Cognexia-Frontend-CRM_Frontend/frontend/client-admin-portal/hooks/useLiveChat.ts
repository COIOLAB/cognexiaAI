import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { liveChatApi } from '@/services/liveChat.api';
import { toast } from 'sonner';
import type {
  ChatSession,
  InitiateChatDto,
  SendMessageDto,
  TransferChatDto,
  ChatFilters,
} from '@/types/api.types';

const QUERY_KEYS = {
  chats: ['live-chat'] as const,
  chat: (id: string) => ['live-chat', id] as const,
  active: ['live-chat', 'active'] as const,
  statistics: ['live-chat', 'statistics'] as const,
  history: (customerId: string) => ['live-chat', 'history', customerId] as const,
  agentChats: (agentId: string) => ['live-chat', 'agent', agentId] as const,
};

// Get chat sessions with filters
export const useGetChatSessions = (filters?: ChatFilters) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.chats, filters],
    queryFn: () => liveChatApi.getChatSessions(filters),
  });
};

// Get chat by ID
export const useGetChat = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.chat(id),
    queryFn: () => liveChatApi.getChatById(id),
    enabled: !!id,
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  });
};

// Initiate new chat
export const useInitiateChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InitiateChatDto) => liveChatApi.initiateChat(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.chats });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.active });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.statistics });
      toast.success('Chat initiated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to initiate chat');
    },
  });
};

// Send message
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: SendMessageDto }) =>
      liveChatApi.sendMessage(sessionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.chat(variables.sessionId) });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to send message');
    },
  });
};

// End chat
export const useEndChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, feedback }: { sessionId: string; feedback?: { rating?: number; comment?: string } }) =>
      liveChatApi.endChat(sessionId, feedback),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.chat(variables.sessionId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.chats });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.active });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.statistics });
      toast.success('Chat ended successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to end chat');
    },
  });
};

// Transfer chat
export const useTransferChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: TransferChatDto }) =>
      liveChatApi.transferChat(sessionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.chat(variables.sessionId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.chats });
      toast.success('Chat transferred successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to transfer chat');
    },
  });
};

// Get active chats
export const useActiveChats = () => {
  return useQuery({
    queryKey: QUERY_KEYS.active,
    queryFn: () => liveChatApi.getActiveChats(),
    refetchInterval: 10000, // Refresh every 10 seconds
  });
};

// Get chat statistics
export const useChatStatistics = () => {
  return useQuery({
    queryKey: QUERY_KEYS.statistics,
    queryFn: () => liveChatApi.getStatistics(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

// Get chat history for customer
export const useChatHistory = (customerId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.history(customerId),
    queryFn: () => liveChatApi.getChatHistory(customerId),
    enabled: !!customerId,
  });
};

// Get agent's active chats
export const useAgentChats = (agentId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.agentChats(agentId),
    queryFn: () => liveChatApi.getAgentChats(agentId),
    enabled: !!agentId,
    refetchInterval: 5000, // Refresh every 5 seconds
  });
};
