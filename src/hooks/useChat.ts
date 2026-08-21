import {
  useChatStore,
  selectConversations,
  selectActiveConversationId,
  selectSocketState,
  selectSearchResults,
  selectIsSearching,
  selectRecentSearches,
} from '@store/chatStore';

export function useChat() {
  const conversations = useChatStore(selectConversations);
  const activeConversationId = useChatStore(selectActiveConversationId);
  const socketState = useChatStore(selectSocketState);
  const searchResults = useChatStore(selectSearchResults);
  const isSearching = useChatStore(selectIsSearching);
  const recentSearches = useChatStore(selectRecentSearches);
  const isLoadingConversations = useChatStore(s => s.isLoadingConversations);
  const loadConversations = useChatStore(s => s.loadConversations);
  const connectSocket = useChatStore(s => s.connectSocket);
  const disconnectSocket = useChatStore(s => s.disconnectSocket);
  const sendMessage = useChatStore(s => s.sendMessage);
  const searchUsers = useChatStore(s => s.searchUsers);
  const clearSearch = useChatStore(s => s.clearSearch);

  return {
    conversations,
    activeConversationId,
    socketState,
    searchResults,
    isSearching,
    recentSearches,
    isLoadingConversations,
    isSocketConnected: socketState === 'connected',
    loadConversations,
    connectSocket,
    disconnectSocket,
    sendMessage,
    searchUsers,
    clearSearch,
  };
}
