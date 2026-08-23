import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { StoryRing } from '@components/common/StoryRing';
import { formatRelativeTime } from '@utils/timeUtils';
import { COLORS } from '@utils/constants';
import { useAuthStore } from '@store/authStore';
import { useChatStore } from '@store/chatStore';
import type { Conversation } from '@appTypes/chat';

interface ConversationItemProps {
  conversation: Conversation;
  onPress: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = memo(({ conversation, onPress }) => {
  const sessionUser = useAuthStore(s => s.user);
  const sessionUserId = sessionUser?.id || (sessionUser as any)?._id;
  const sessionUsername = sessionUser?.username;

  // Resolve the actual other user from participantDetails or participants
  const participantsList =
    (conversation as any).participantDetails || conversation.participants || [];

  const otherUser =
    participantsList.find((p: any) => {
      const pId = p.id || p._id;
      return (
        (sessionUserId && pId !== sessionUserId) ||
        (sessionUsername && p.username !== sessionUsername)
      );
    }) ||
    participantsList[0] ||
    {};

  const displayName = otherUser.username || otherUser.fullName || 'Direct';
  const displayAvatar =
    otherUser.profilePicture ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200';

  const convId = conversation.id || (conversation as any)._id;
  const storeUnread = useChatStore(s => s.unreadCountByConversation[convId]);

  let unreadCount = 0;
  if (typeof storeUnread === 'number') {
    unreadCount = storeUnread;
  } else if (typeof conversation.unreadCount === 'number') {
    unreadCount = conversation.unreadCount;
  } else if (conversation.unreadCount && typeof conversation.unreadCount === 'object') {
    unreadCount = (conversation.unreadCount as any)[sessionUserId || ''] || 0;
  }

  const isTyping = useChatStore(
    s => s.typingByConversation[convId] ?? false,
  );
  const hasUnread = unreadCount > 0;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.avatarWrapper}>
        <Image
          source={{ uri: displayAvatar }}
          style={styles.avatar}
        />
        {conversation.isOnline && <View style={styles.onlineBadge} />}
      </View>

      <View style={styles.content}>
        <Text style={[styles.name, hasUnread && styles.nameBold]} numberOfLines={1}>
          {displayName}
        </Text>

        <View style={styles.messageRow}>
          {isTyping ? (
            <Text style={styles.typing}>Typing...</Text>
          ) : (
            <Text
              style={[styles.lastMessage, hasUnread && styles.lastMessageBold]}
              numberOfLines={1}
            >
              {conversation.lastMessage?.content ?? 'Tap to chat'}
            </Text>
          )}
          {conversation.lastMessage?.createdAt && (
            <Text style={[styles.timeDot, hasUnread && styles.timeDotUnread]}>
              {' '}· {formatRelativeTime(conversation.lastMessage.createdAt)}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.rightAction}>
        {hasUnread ? (
          unreadCount > 1 ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </View>
          ) : (
            <View style={styles.unreadRedDot} />
          )
        ) : (
          <TouchableOpacity style={styles.cameraBtn} onPress={onPress}>
            <Icon name="camera-outline" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
});

ConversationItem.displayName = 'ConversationItem';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.background,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.online,
    borderWidth: 2.5,
    borderColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  nameBold: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    color: COLORS.textSecondary,
    fontSize: 13,
    maxWidth: '75%',
  },
  lastMessageBold: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  timeDot: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  timeDotUnread: {
    color: '#0095F6',
    fontWeight: '600',
  },
  typing: {
    color: '#0095F6',
    fontSize: 13,
    fontStyle: 'italic',
  },
  rightAction: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadRedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
  },
  unreadBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  cameraBtn: {
    padding: 4,
  },
});
