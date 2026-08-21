import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatTime } from '@utils/timeUtils';
import type { Message } from '@appTypes/chat';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onRetry?: (message: Message) => void;
}

const STATUS_ICONS: Record<string, string> = {
  sending: '⏳',
  sent: '✓',
  delivered: '✓✓',
  read: '✓✓',
  failed: '⚠️',
};

export const MessageBubble: React.FC<MessageBubbleProps> = memo(({ message, isOwn, onRetry }) => {
  const isFailed = message.status === 'failed';
  const isRead = message.status === 'read';

  return (
    <View style={[styles.wrapper, isOwn ? styles.ownWrapper : styles.otherWrapper]}>
      <View style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
        <Text style={[styles.content, isOwn ? styles.ownContent : styles.otherContent]}>
          {message.content}
        </Text>

        <View style={styles.meta}>
          <Text style={[styles.time, isOwn ? styles.ownTime : styles.otherTime]}>
            {formatTime(message.createdAt)}
          </Text>
          {isOwn && (
            <Text style={[styles.statusIcon, isRead && styles.readIcon]}>
              {STATUS_ICONS[message.status] ?? ''}
            </Text>
          )}
        </View>
      </View>

      {isFailed && isOwn && onRetry && (
        <TouchableOpacity style={styles.retryBtn} onPress={() => onRetry(message)}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

MessageBubble.displayName = 'MessageBubble';

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingVertical: 2,
    maxWidth: '80%',
  },
  ownWrapper: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  otherWrapper: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 4,
  },
  ownBubble: {
    backgroundColor: '#E1306C',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#2C2C2E',
    borderBottomLeftRadius: 4,
  },
  content: { fontSize: 15, lineHeight: 20 },
  ownContent: { color: '#FFFFFF' },
  otherContent: { color: '#FFFFFF' },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  time: { fontSize: 10 },
  ownTime: { color: 'rgba(255,255,255,0.7)' },
  otherTime: { color: '#8E8E93' },
  statusIcon: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
  },
  readIcon: { color: '#4FC3F7' },
  retryBtn: {
    marginTop: 4,
    backgroundColor: '#3A0010',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  retryText: { color: '#E1306C', fontSize: 12, fontWeight: '600' },
});
