import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ConversationItem } from '@components/chat/ConversationItem';
import { NetworkBanner } from '@components/common/NetworkBanner';
import { Loader } from '@components/common/Loader';
import { useAuthStore } from '@store/authStore';
import { useChatStore, selectConversations } from '@store/chatStore';
import { COLORS } from '@utils/constants';
import type { Conversation } from '@appTypes/chat';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { ChatScreenProps } from '@appTypes/navigation';

type Props = ChatScreenProps<'ChatList'>;

interface NoteItem {
  id: string;
  username: string;
  avatar: string;
  noteText: string;
  isUser?: boolean;
}

export const ChatListScreen: React.FC<Props> = ({ navigation }) => {
  const conversations = useChatStore(selectConversations);
  const isLoading = useChatStore(s => s.isLoadingConversations);
  const loadConversations = useChatStore(s => s.loadConversations);
  const connectSocket = useChatStore(s => s.connectSocket);
  const disconnectSocket = useChatStore(s => s.disconnectSocket);
  const sessionUser = useAuthStore(s => s.user);
  const [activeTab, setActiveTab] = useState<'messages' | 'requests'>('messages');

  useEffect(() => {
    connectSocket();
    return () => disconnectSocket();
  }, [connectSocket, disconnectSocket]);

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [loadConversations]),
  );

  const sessionUserId = sessionUser?.id || (sessionUser as any)?._id;
  const sessionUsername = sessionUser?.username;

  const handleConversationPress = useCallback(
    (conversation: any) => {
      const other =
        conversation.participantDetails?.find((p: any) => {
          const pId = p.id || p._id;
          return (
            (sessionUserId && pId !== sessionUserId) ||
            (sessionUsername && p.username !== sessionUsername)
          );
        }) || conversation.participants?.[0];
      const conversationId = conversation.id || conversation._id;
      navigation.navigate('ChatDetail', {
        conversationId,
        participantName: other?.username ?? other?.fullName ?? 'Chat',
        participantAvatar: other?.profilePicture ?? '',
      });
    },
    [navigation, sessionUserId, sessionUsername],
  );

  const renderHeader = () => (
    <View style={styles.listHeaderContainer}>
      {/* Search Pill Bar */}
      <TouchableOpacity
        style={styles.searchBar}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('ChatSearch')}
      >
        <Icon name="search-outline" size={18} color={COLORS.textMuted} style={styles.searchIcon} />
        <Text style={styles.searchPlaceholder}>Search</Text>
      </TouchableOpacity>

      {/* User Note Bubble */}
      {sessionUser && (
        <View style={styles.notesSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.notesList}>
            <View style={styles.noteItem}>
              <View style={styles.noteBubbleContainer}>
                <View style={styles.noteBubble}>
                  <Text style={styles.noteBubbleText} numberOfLines={1}>
                    Share a thought...
                  </Text>
                </View>
                <View style={styles.noteTriangle} />
              </View>

              <View style={styles.noteAvatarWrapper}>
                <Image
                  source={{ uri: sessionUser.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' }}
                  style={styles.noteAvatar}
                />
                <View style={styles.addNoteBadge}>
                  <Icon name="add" size={12} color="#FFFFFF" />
                </View>
              </View>

              <Text style={styles.noteUsername} numberOfLines={1}>
                Your note
              </Text>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Messages / Requests Tab Row */}
      <View style={styles.sectionHeaderRow}>
        <TouchableOpacity onPress={() => setActiveTab('messages')}>
          <Text style={[styles.sectionTab, activeTab === 'messages' && styles.activeSectionTab]}>
            Messages
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('requests')}>
          <Text style={[styles.requestsTab, activeTab === 'requests' && styles.activeRequestsTab]}>
            Requests
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderItem = useCallback(
    ({ item }: { item: Conversation }) => (
      <ConversationItem conversation={item} onPress={() => handleConversationPress(item)} />
    ),
    [handleConversationPress],
  );

  const keyExtractor = useCallback((item: Conversation) => item.id, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <NetworkBanner />

      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        <View style={styles.usernameRow}>
          {navigation.canGoBack() && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
              <Icon name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          )}
          <Text style={styles.headerUsername}>{sessionUser?.username ?? 'Direct'}</Text>
          <Icon name="chevron-down" size={14} color={COLORS.textPrimary} style={{ marginLeft: 4 }} />
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('ChatSearch')} style={styles.composeBtn}>
          <Icon name="create-outline" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {isLoading && conversations.length === 0 ? (
        <Loader fullScreen message="Loading messages..." />
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          refreshing={isLoading}
          onRefresh={loadConversations}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Icon name="chatbubbles-outline" size={56} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptySubtitle}>Search for friends to start chatting</Text>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topHeader: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerUsername: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  composeBtn: {
    padding: 4,
  },
  listHeaderContainer: {
    backgroundColor: COLORS.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    height: 38,
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  notesSection: {
    paddingBottom: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  notesList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  noteItem: {
    alignItems: 'center',
    width: 76,
  },
  noteBubbleContainer: {
    alignItems: 'center',
    marginBottom: 4,
  },
  noteBubble: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  noteBubbleText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    maxWidth: 72,
  },
  noteTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: COLORS.surfaceLight,
  },
  noteAvatarWrapper: {
    position: 'relative',
  },
  noteAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  addNoteBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteUsername: {
    fontSize: 11,
    color: COLORS.textPrimary,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTab: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  activeSectionTab: {
    color: COLORS.textPrimary,
  },
  requestsTab: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  activeRequestsTab: {
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '600',
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
});
