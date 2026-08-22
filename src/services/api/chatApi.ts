import apiClient from './apiClient';
import type {
  ConversationsPage,
  MessagesPage,
  Message,
  SearchUsersResponse,
  Conversation,
} from '@appTypes/chat';

export const chatApi = {
  fetchConversations: async (cursor: string | null): Promise<ConversationsPage> => {
    const response = await apiClient.get<ConversationsPage>('/chat/conversations', {
      params: { cursor },
    });
    return response.data || { conversations: [], nextCursor: null, hasMore: false };
  },

  createOrGetConversation: async (targetUserId: string): Promise<{ conversation: Conversation }> => {
    const response = await apiClient.post<{ conversation: Conversation }>('/chat/conversations', {
      targetUserId,
    });
    return response.data;
  },

  fetchMessages: async (conversationId: string, cursor: string | null): Promise<MessagesPage> => {
    const response = await apiClient.get<MessagesPage>(`/chat/conversations/${conversationId}/messages`, {
      params: { cursor },
    });
    return response.data || { messages: [], nextCursor: null, hasMore: false };
  },

  sendMessage: async (conversationId: string, content: string, localId: string): Promise<Message> => {
    const response = await apiClient.post<Message>(`/chat/conversations/${conversationId}/messages`, {
      content,
      localId,
    });
    return response.data;
  },

  searchUsers: async (query: string, cursor: string | null): Promise<SearchUsersResponse> => {
    const response = await apiClient.get<SearchUsersResponse>('/chat/users/search', {
      params: { q: query, cursor },
    });
    return response.data || { users: [], nextCursor: null, hasMore: false };
  },

  markMessagesRead: async (conversationId: string, messageIds: string[]): Promise<void> => {
    await apiClient.put(`/chat/conversations/${conversationId}/read`, { messageIds });
  },
};
