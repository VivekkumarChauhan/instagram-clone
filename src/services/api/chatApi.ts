import apiClient from './apiClient';
import { chatMock } from '@services/mock/chatMock';
import type {
  ConversationsPage,
  MessagesPage,
  Message,
  SearchUsersResponse,
} from '@appTypes/chat';

export const chatApi = {
  fetchConversations: async (cursor: string | null): Promise<ConversationsPage> => {
    try {
      const response = await apiClient.get<ConversationsPage>('/chat/conversations', {
        params: { cursor },
      });
      if (response.data && response.data.conversations && response.data.conversations.length > 0) {
        return response.data;
      }
      return chatMock.fetchConversations(cursor);
    } catch (e) {
      return chatMock.fetchConversations(cursor);
    }
  },

  fetchMessages: async (conversationId: string, cursor: string | null): Promise<MessagesPage> => {
    try {
      const response = await apiClient.get<MessagesPage>(`/chat/conversations/${conversationId}/messages`, {
        params: { cursor },
      });
      if (response.data && response.data.messages && response.data.messages.length > 0) {
        return response.data;
      }
      return chatMock.fetchMessages(conversationId, cursor);
    } catch (e) {
      return chatMock.fetchMessages(conversationId, cursor);
    }
  },

  sendMessage: async (conversationId: string, content: string, localId: string): Promise<Message> => {
    try {
      const response = await apiClient.post<Message>(`/chat/conversations/${conversationId}/messages`, {
        content,
        localId,
      });
      return response.data;
    } catch (e) {
      return chatMock.sendMessage(conversationId, content, localId);
    }
  },

  searchUsers: async (query: string, cursor: string | null): Promise<SearchUsersResponse> => {
    try {
      const response = await apiClient.get<SearchUsersResponse>('/chat/users/search', {
        params: { q: query, cursor },
      });
      return response.data;
    } catch (e) {
      return chatMock.searchUsers(query, cursor);
    }
  },

  markMessagesRead: async (conversationId: string, messageIds: string[]): Promise<void> => {
    try {
      await apiClient.post(`/chat/conversations/${conversationId}/read`, { messageIds });
    } catch (e) {
      await chatMock.markMessagesRead(conversationId, messageIds);
    }
  },
};
