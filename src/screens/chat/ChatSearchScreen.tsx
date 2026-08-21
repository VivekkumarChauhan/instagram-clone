import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useChatStore, selectSearchResults, selectIsSearching, selectRecentSearches } from '@store/chatStore';
import { useDebounce } from '@hooks/useDebounce';
import { SEARCH_DEBOUNCE_MS, SEARCH_MIN_CHARS } from '@utils/constants';
import type { UserSearchResult } from '@appTypes/chat';
import type { ChatScreenProps } from '@appTypes/navigation';

type Props = ChatScreenProps<'ChatSearch'>;

export const ChatSearchScreen: React.FC<Props> = ({ navigation }) => {
  const searchResults = useChatStore(selectSearchResults);
  const isSearching = useChatStore(selectIsSearching);
  const recentSearches = useChatStore(selectRecentSearches);
  const searchError = useChatStore(s => s.searchError);
  const searchUsers = useChatStore(s => s.searchUsers);
  const clearSearch = useChatStore(s => s.clearSearch);
  const addRecentSearch = useChatStore(s => s.addRecentSearch);

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, SEARCH_DEBOUNCE_MS);
  const abortControllerRef = useRef<AbortController | null>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    inputRef.current?.focus();
    return () => clearSearch();
  }, [clearSearch]);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (trimmed.length < SEARCH_MIN_CHARS) {
      clearSearch();
      return;
    }

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    searchUsers(trimmed, abortControllerRef.current.signal);
  }, [debouncedQuery, searchUsers, clearSearch]);

  const handleUserPress = useCallback(
    (user: UserSearchResult) => {
      addRecentSearch(user);
      const conversationId = `conv-${user.id}`;
      navigation.navigate('ChatDetail', {
        conversationId,
        participantName: user.username,
        participantAvatar: user.profilePicture,
      });
    },
    [addRecentSearch, navigation],
  );

  const handleClear = useCallback(() => {
    setQuery('');
    clearSearch();
    inputRef.current?.focus();
  }, [clearSearch]);

  const renderUserItem = useCallback(
    ({ item }: { item: UserSearchResult }) => (
      <TouchableOpacity style={styles.userItem} onPress={() => handleUserPress(item)}>
        <Image source={{ uri: item.profilePicture }} style={styles.userAvatar} />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.fullName}>{item.fullName}</Text>
        </View>
        {item.isVerified && <Text style={styles.verified}>✓</Text>}
      </TouchableOpacity>
    ),
    [handleUserPress],
  );

  const isShowingResults = query.trim().length >= SEARCH_MIN_CHARS;
  const showRecent = !isShowingResults && recentSearches.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search people..."
            placeholderTextColor="#8E8E93"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {isSearching && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#E1306C" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      )}

      {searchError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{searchError}</Text>
        </View>
      )}

      {showRecent && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent</Text>
          <FlatList
            data={recentSearches}
            renderItem={renderUserItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {isShowingResults && !isSearching && (
        <FlatList
          data={searchResults}
          renderItem={renderUserItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !searchError ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No results for "{query}"</Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
    gap: 8,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, color: '#FFFFFF', fontSize: 15 },
  clearIcon: { color: '#8E8E93', fontSize: 14, padding: 4 },
  cancelText: { color: '#E1306C', fontSize: 15, fontWeight: '500' },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  loadingText: { color: '#8E8E93', fontSize: 13 },
  errorBanner: {
    backgroundColor: '#3A0010',
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  errorText: { color: '#FF6B8A', fontSize: 13 },
  section: { flex: 1 },
  sectionTitle: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  userAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#2C2C2E' },
  userInfo: { flex: 1 },
  username: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  fullName: { color: '#8E8E93', fontSize: 13, marginTop: 2 },
  verified: { color: '#4FC3F7', fontSize: 14, fontWeight: '700' },
  emptyContainer: { padding: 32, alignItems: 'center' },
  emptyText: { color: '#8E8E93', fontSize: 14 },
});
