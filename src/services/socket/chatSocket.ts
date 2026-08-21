import { socketClient } from './socketClient';
import type { Message, TypingEvent, PresenceEvent, ReadReceiptEvent } from '@appTypes/chat';
import { mockDelay } from '@utils/mockDelay';

type MessageHandler = (message: Message) => void;
type TypingHandler = (event: TypingEvent) => void;
type PresenceHandler = (event: PresenceEvent) => void;
type ReadReceiptHandler = (event: ReadReceiptEvent) => void;

let mockTypingTimeouts: Record<string, NodeJS.Timeout> = {};

export const chatSocket = {
  joinConversation(conversationId: string): void {
    socketClient.emit('join_conversation', { conversationId });
    simulateMockEvents(conversationId);
  },

  leaveConversation(conversationId: string): void {
    socketClient.emit('leave_conversation', { conversationId });
    clearMockEvents(conversationId);
  },

  onNewMessage(handler: MessageHandler): void {
    socketClient.on('new_message', handler as Parameters<typeof socketClient.on>[1]);
  },

  onTyping(handler: TypingHandler): void {
    socketClient.on('typing', handler as Parameters<typeof socketClient.on>[1]);
  },

  onPresenceChange(handler: PresenceHandler): void {
    socketClient.on('presence', handler as Parameters<typeof socketClient.on>[1]);
  },

  onReadReceipt(handler: ReadReceiptHandler): void {
    socketClient.on('read_receipt', handler as Parameters<typeof socketClient.on>[1]);
  },

  emitTyping(conversationId: string, isTyping: boolean): void {
    socketClient.emit('typing', { conversationId, isTyping });
  },

  emitReadReceipt(conversationId: string, messageIds: string[]): void {
    socketClient.emit('read_receipt', { conversationId, messageIds });
  },

  removeAllChatListeners(): void {
    socketClient.off('new_message');
    socketClient.off('typing');
    socketClient.off('presence');
    socketClient.off('read_receipt');
  },
};

function simulateMockEvents(conversationId: string): void {
  const typingTimeout = setTimeout(async () => {
    const typingEvent: TypingEvent = { conversationId, userId: 'u1', isTyping: true };
    triggerMockEvent('typing', typingEvent);

    await mockDelay(2000, 3000);

    const stopTypingEvent: TypingEvent = { conversationId, userId: 'u1', isTyping: false };
    triggerMockEvent('typing', stopTypingEvent);

    await mockDelay(500, 1000);

    const mockMessage: Message = {
      id: `mock-msg-${Date.now()}`,
      conversationId,
      sender: {
        id: 'u1',
        username: 'alex.captures',
        profilePicture: 'https://i.pravatar.cc/150?img=2',
      },
      content: getRandomIncomingMessage(),
      status: 'delivered',
      createdAt: new Date().toISOString(),
    };
    triggerMockEvent('new_message', mockMessage);
  }, 4000);

  mockTypingTimeouts[conversationId] = typingTimeout;
}

function clearMockEvents(conversationId: string): void {
  const timeout = mockTypingTimeouts[conversationId];
  if (timeout) {
    clearTimeout(timeout);
    delete mockTypingTimeouts[conversationId];
  }
}

function triggerMockEvent(event: string, data: unknown): void {
  const handler = (socketClient as unknown as { registeredEvents: Map<string, (...args: unknown[]) => void> }).registeredEvents?.get(event);
  if (handler) {
    handler(data);
  }
}

function getRandomIncomingMessage(): string {
  const messages = [
    'Hey! How are you doing? 😊',
    'Just saw your story! Amazing! 🔥',
    'Are you free this weekend?',
    'Check out this reel I found 😂',
    'Miss chatting with you!',
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}
