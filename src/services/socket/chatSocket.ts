import { socketClient } from './socketClient';
import type { Message, TypingEvent, PresenceEvent, ReadReceiptEvent } from '@appTypes/chat';

type MessageHandler = (message: Message) => void;
type TypingHandler = (event: TypingEvent) => void;
type PresenceHandler = (event: PresenceEvent) => void;
type ReadReceiptHandler = (event: ReadReceiptEvent) => void;

export const chatSocket = {
  joinConversation(conversationId: string): void {
    socketClient.emit('join_conversation', { conversationId });
  },

  leaveConversation(conversationId: string): void {
    socketClient.emit('leave_conversation', { conversationId });
  },

  onNewMessage(handler: MessageHandler): void {
    socketClient.on('message:received', handler as Parameters<typeof socketClient.on>[1]);
    // Also listen to legacy event name if emitted
    socketClient.on('new_message', handler as Parameters<typeof socketClient.on>[1]);
  },

  onTyping(handler: TypingHandler): void {
    socketClient.on('user:typing', handler as Parameters<typeof socketClient.on>[1]);
    socketClient.on('typing', handler as Parameters<typeof socketClient.on>[1]);
  },

  onPresenceChange(handler: PresenceHandler): void {
    socketClient.on('user:online', (data: any) => {
      handler({ userId: data.userId, isOnline: true });
    });
    socketClient.on('user:offline', (data: any) => {
      handler({ userId: data.userId, isOnline: false });
    });
  },

  onReadReceipt(handler: ReadReceiptHandler): void {
    socketClient.on('messages:read', handler as Parameters<typeof socketClient.on>[1]);
    socketClient.on('read_receipt', handler as Parameters<typeof socketClient.on>[1]);
  },

  emitTyping(conversationId: string, isTyping: boolean): void {
    socketClient.emit('typing', { conversationId, isTyping });
  },

  emitReadReceipt(conversationId: string, messageIds: string[]): void {
    socketClient.emit('read_receipt', { conversationId, messageIds });
  },

  removeAllChatListeners(): void {
    socketClient.off('message:received');
    socketClient.off('new_message');
    socketClient.off('user:typing');
    socketClient.off('typing');
    socketClient.off('user:online');
    socketClient.off('user:offline');
    socketClient.off('messages:read');
    socketClient.off('read_receipt');
  },
};
