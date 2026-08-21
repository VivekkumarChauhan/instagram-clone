import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { User } from '../models/User';

export class ChatService {
  public static async fetchConversations() {
    const conversations = await Conversation.find().sort({ updatedAt: -1 });
    return {
      conversations: conversations.map(c => ({
        id: c._id.toString(),
        participants: c.participants,
        lastMessage: c.lastMessage,
        unreadCount: c.unreadCount,
        updatedAt: c.updatedAt.toISOString(),
      })),
      nextCursor: null,
      hasMore: false,
    };
  }

  public static async fetchMessages(conversationId: string, skip: number = 0, limit: number = 20) {
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    return {
      messages: messages.map(m => ({
        id: m._id.toString(),
        conversationId: m.conversationId,
        sender: m.sender,
        content: m.content,
        localId: m.localId,
        status: m.status,
        createdAt: m.createdAt.toISOString(),
      })),
      nextCursor: null,
      hasMore: false,
    };
  }

  public static async saveMessage(conversationId: string, sender: any, content: string, localId?: string) {
    const message = await Message.create({
      conversationId,
      sender,
      content,
      localId,
      status: 'sent',
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      $set: {
        lastMessage: {
          id: message._id.toString(),
          content: message.content,
          createdAt: message.createdAt,
          sender: message.sender,
          status: message.status,
        },
        updatedAt: new Date(),
      },
    });

    return {
      id: message._id.toString(),
      conversationId: message.conversationId,
      sender: message.sender,
      content: message.content,
      localId: message.localId,
      status: message.status,
      createdAt: message.createdAt.toISOString(),
    };
  }

  public static async searchUsers(query: string) {
    if (!query || query.length < 2) return { users: [], nextCursor: null, hasMore: false };
    const regex = new RegExp(query, 'i');
    const users = await User.find({
      $or: [{ username: regex }, { fullName: regex }],
    }).limit(20);

    return {
      users: users.map(u => ({
        id: u._id.toString(),
        username: u.username,
        fullName: u.fullName,
        profilePicture: u.profilePicture,
        isVerified: u.isVerified,
      })),
      nextCursor: null,
      hasMore: false,
    };
  }
}
