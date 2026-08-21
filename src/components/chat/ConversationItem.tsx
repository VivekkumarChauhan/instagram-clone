import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { StoryRing } from '@components/common/StoryRing';
import { formatRelativeTime } from '@utils/timeUtils';
import { COLORS } from '@utils/constants';
import type { Conversation } from '@appTypes/chat';

interface ConversationItemProps {
  conversation: Conversation;
  onPress: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = memo(({ conversation, onPress }) => {
  const participant = conversation.participants[0];
  const hasUnread = conversation.unreadCount > 0;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.avatarWrapper}>
        <StoryRing size={56} hasStory={!conversation.isOnline} isSeen={false}>
          <Image
            source={{ uri: participant?.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' }}
            style={styles.avatar}
          />
        </StoryRing>
        {conversation.isOnline && <View style={styles.onlineBadge} />}
      </View>

      <View style={styles.content}>
        <Text style={[styles.name, hasUnread && styles.nameBold]} numberOfLines={1}>
          {participant?.username ?? 'Unknown'}
        </Text>

        <View style={styles.messageRow}>
          {conversation.isTyping ? (
            <Text style={styles.typing}>Typing...</Text>
          ) : (
            <Text
              style={[styles.lastMessage, hasUnread && styles.lastMessageBold]}
              numberOfLines={1}
            >
              {conversation.lastMessage?.content ?? 'Sent an attachment'}
            </Text>
          )}
          <Text style={[styles.timeDot, hasUnread && styles.timeDotUnread]}>
            {' '}· {conversation.lastMessage ? formatRelativeTime(conversation.lastMessage.createdAt) : '2h'}
          </Text>
        </View>
      </View>

      <View style={styles.rightAction}>
        {hasUnread ? (
          <View style={styles.unreadBlueDot} />
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
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 3,
  },
  nameBold: {
    fontWeight: '700',
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
    fontWeight: '600',
  },
  timeDot: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  timeDotUnread: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  typing: {
    color: COLORS.primary,
    fontSize: 13,
    fontStyle: 'italic',
  },
  rightAction: {
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBlueDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: COLORS.primary,
  },
  cameraBtn: {
    padding: 4,
  },
});
