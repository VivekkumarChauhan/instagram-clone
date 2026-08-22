import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { TypingIndicator } from '@components/chat/TypingIndicator';
import {
  useChatStore,
  selectMessagesForConversation,
  selectTypingForConversation,
  selectHasMoreMessages,
} from '@store/chatStore';
import { chatSocket } from '@services/socket/chatSocket';
import { COLORS } from '@utils/constants';
import type { Message } from '@appTypes/chat';
import type { ChatScreenProps } from '@appTypes/navigation';
import { TYPING_INDICATOR_TIMEOUT_MS } from '@utils/constants';
import { useAuthStore } from '@store/authStore';

type Props = ChatScreenProps<'ChatDetail'>;

export const ChatDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { conversationId, participantName, participantAvatar } = route.params;
  const currentUser = useAuthStore(s => s.user);
  const currentUserId = currentUser?.id || (currentUser as any)?._id;
  const currentUsername = currentUser?.username;

  const messages = useChatStore(selectMessagesForConversation(conversationId));
  const isTyping = useChatStore(selectTypingForConversation(conversationId));
  const hasMore = useChatStore(selectHasMoreMessages(conversationId));
  const isLoadingMore = useChatStore(s => s.isLoadingMoreMessages);
  const loadMessages = useChatStore(s => s.loadMessages);
  const loadMoreMessages = useChatStore(s => s.loadMoreMessages);
  const sendMessage = useChatStore(s => s.sendMessage);
  const setActiveConversation = useChatStore(s => s.setActiveConversation);

  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList<Message>>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadMessages(conversationId);
    setActiveConversation(conversationId);
    return () => {
      setActiveConversation(null);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [conversationId, loadMessages, setActiveConversation]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;
    setInputText('');
    chatSocket.emitTyping(conversationId, false);
    sendMessage(conversationId, text);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [inputText, conversationId, sendMessage]);

  const handleTextChange = useCallback(
    (text: string) => {
      setInputText(text);
      chatSocket.emitTyping(conversationId, true);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        chatSocket.emitTyping(conversationId, false);
      }, TYPING_INDICATOR_TIMEOUT_MS);
    },
    [conversationId],
  );

  const renderMessageBubble = ({ item }: { item: Message }) => {
    const senderId = item.sender?.id || (item.sender as any)?._id;
    const senderUsername = item.sender?.username;
    const isOwn =
      senderId === 'me' ||
      (!!currentUserId && String(senderId) === String(currentUserId)) ||
      (!!currentUsername && senderUsername === currentUsername);

    return (
      <View style={[styles.bubbleRow, isOwn ? styles.bubbleRowOwn : styles.bubbleRowOther]}>
        {!isOwn && (
          <Image
            source={{ uri: participantAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' }}
            style={styles.senderAvatar}
          />
        )}
        <View
          style={[
            styles.bubbleContainer,
            isOwn ? styles.bubbleOwn : styles.bubbleOther,
          ]}
        >
          <Text style={[styles.bubbleText, isOwn ? styles.bubbleTextOwn : styles.bubbleTextOther]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Instagram-style Chat Header with proper Android Top Inset */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Image
            source={{ uri: participantAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' }}
            style={styles.headerAvatar}
          />
          <View style={styles.headerTextGroup}>
            <View style={styles.nameRow}>
              <Text style={styles.headerUsername} numberOfLines={1}>{participantName}</Text>
              <Icon name="checkmark-circle" size={13} color={COLORS.primary} style={{ marginLeft: 3 }} />
            </View>
            <Text style={styles.statusSubtitle}>Active now</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Icon name="call-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Icon name="videocam-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages List */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageBubble}
          keyExtractor={(item, index) => item.id || `msg-${index}`}
          onEndReached={() => {
            if (hasMore && !isLoadingMore) loadMoreMessages(conversationId);
          }}
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messageListContent}
          keyboardShouldPersistTaps="handled"
        />

        {/* Instagram-matched Bottom Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.cameraIconBtn}>
            <Icon name="camera" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.inputPill}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={handleTextChange}
              placeholder="Message..."
              placeholderTextColor="#8E8E93"
              multiline
              maxLength={1000}
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
            {!inputText.trim() ? (
              <View style={styles.inputIconsRow}>
                <TouchableOpacity style={styles.innerIconBtn}>
                  <Icon name="mic-outline" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.innerIconBtn}>
                  <Icon name="image-outline" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.innerIconBtn}>
                  <Icon name="happy-outline" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={handleSend} style={styles.sendTextBtn}>
                <Text style={styles.sendText}>Send</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  flex: { flex: 1 },
  header: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 6 : 8,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#262626',
    backgroundColor: '#000000',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    padding: 6,
    marginRight: 6,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
  },
  headerTextGroup: {
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerUsername: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    maxWidth: 160,
  },
  statusSubtitle: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingRight: 4,
  },
  headerIconBtn: {
    padding: 4,
  },
  messageListContent: {
    paddingHorizontal: 14,
    paddingVertical: 16,
    gap: 6,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  bubbleRowOwn: {
    justifyContent: 'flex-end',
  },
  bubbleRowOther: {
    justifyContent: 'flex-start',
  },
  senderAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    marginBottom: 2,
  },
  bubbleContainer: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleOwn: {
    backgroundColor: '#3797EF',
    borderBottomRightRadius: 4,
    borderTopRightRadius: 18,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  bubbleOther: {
    backgroundColor: '#262626',
    borderBottomLeftRadius: 4,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 20,
  },
  bubbleTextOwn: {
    color: '#FFFFFF',
  },
  bubbleTextOther: {
    color: '#FFFFFF',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#262626',
    backgroundColor: '#000000',
    gap: 8,
  },
  cameraIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0095F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 22,
    paddingHorizontal: 14,
    minHeight: 42,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    paddingVertical: 8,
    maxHeight: 90,
  },
  inputIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 6,
  },
  innerIconBtn: {
    padding: 2,
  },
  sendTextBtn: {
    paddingHorizontal: 8,
  },
  sendText: {
    color: '#0095F6',
    fontSize: 15,
    fontWeight: '700',
  },
});
