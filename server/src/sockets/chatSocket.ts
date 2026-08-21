import { Server, Socket } from 'socket.io';
import { ChatService } from '../services/chatService';

export function setupChatSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`⚡ [SOCKET] Client connected: ${socket.id}`);

    socket.on('join_conversation', ({ conversationId }: { conversationId: string }) => {
      socket.join(conversationId);
      console.log(`⚡ [SOCKET] ${socket.id} joined conversation: ${conversationId}`);
    });

    socket.on('leave_conversation', ({ conversationId }: { conversationId: string }) => {
      socket.leave(conversationId);
    });

    socket.on('typing', ({ conversationId, isTyping, userId }: { conversationId: string; isTyping: boolean; userId?: string }) => {
      socket.to(conversationId).emit('user:typing', {
        conversationId,
        userId: userId || 'user-002',
        isTyping,
      });
    });

    socket.on('send_message', async ({ conversationId, content, localId, sender }: any) => {
      const defaultSender = sender || {
        id: 'user-001',
        username: 'johndoe',
        profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      };

      const savedMessage = await ChatService.saveMessage(conversationId, defaultSender, content, localId);
      io.to(conversationId).emit('message:received', savedMessage);
    });

    socket.on('disconnect', () => {
      console.log(`⚡ [SOCKET] Client disconnected: ${socket.id}`);
    });
  });
}
