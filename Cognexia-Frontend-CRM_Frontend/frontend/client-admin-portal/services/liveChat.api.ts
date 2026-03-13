import { api } from '@/lib/api';
import type {
  ChatSession,
  InitiateChatDto,
  SendMessageDto,
  TransferChatDto,
  ChatMessage,
  ChatFilters,
  ChatStatistics,
} from '@/types/api.types';

const CHAT_BASE = '/crm/support/chat';

export const liveChatApi = {
  // Get chat sessions with filters
  getChatSessions: async (filters?: ChatFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const { data } = await api.get<{ data: ChatSession[]; total: number }>(
      `${CHAT_BASE}?${params.toString()}`
    );
    return data;
  },

  // Get chat session by ID
  getChatById: async (id: string) => {
    const { data } = await api.get<ChatSession>(`${CHAT_BASE}/${id}`);
    return data;
  },

  // Initiate new chat
  initiateChat: async (chatData: InitiateChatDto) => {
    const { data } = await api.post<ChatSession>(CHAT_BASE, chatData);
    return data;
  },

  // Send message in chat
  sendMessage: async (sessionId: string, messageData: SendMessageDto) => {
    const { data } = await api.post<ChatMessage>(
      `${CHAT_BASE}/${sessionId}/message`,
      messageData
    );
    return data;
  },

  // End chat session
  endChat: async (sessionId: string, feedback?: { rating?: number; comment?: string }) => {
    const { data } = await api.post<ChatSession>(`${CHAT_BASE}/${sessionId}/end`, feedback);
    return data;
  },

  // Transfer chat to another agent
  transferChat: async (sessionId: string, transferData: TransferChatDto) => {
    const { data } = await api.post<ChatSession>(
      `${CHAT_BASE}/${sessionId}/transfer`,
      transferData
    );
    return data;
  },

  // Get chat history for a customer
  getChatHistory: async (customerId: string) => {
    const { data } = await api.get<{ data: ChatSession[] }>(
      `${CHAT_BASE}/history/${customerId}`
    );
    return data;
  },

  // Get active chats
  getActiveChats: async () => {
    const { data } = await api.get<{ data: ChatSession[] }>(`${CHAT_BASE}/active`);
    return data;
  },

  // Update chat status
  updateChatStatus: async (sessionId: string, status: string) => {
    const { data } = await api.patch<ChatSession>(`${CHAT_BASE}/${sessionId}/status`, {
      status,
    });
    return data;
  },

  // Get chat statistics
  getStatistics: async () => {
    const { data } = await api.get<ChatStatistics>(`${CHAT_BASE}/statistics`);
    return data;
  },

  // Get agent's active chats
  getAgentChats: async (agentId: string) => {
    const { data } = await api.get<{ data: ChatSession[] }>(
      `${CHAT_BASE}/agent/${agentId}`
    );
    return data;
  },
};
