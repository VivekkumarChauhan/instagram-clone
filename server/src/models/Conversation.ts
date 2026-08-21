import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  participants: Array<{
    id: string;
    username: string;
    fullName?: string;
    profilePicture?: string;
    isVerified?: boolean;
  }>;
  lastMessage?: {
    id: string;
    content: string;
    createdAt: Date;
    sender: {
      id: string;
      username: string;
      profilePicture?: string;
    };
    status: string;
  };
  unreadCount: number;
  isOnline?: boolean;
  isTyping?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema: Schema = new Schema(
  {
    participants: [
      {
        id: { type: String, required: true },
        username: { type: String, required: true },
        fullName: { type: String, default: '' },
        profilePicture: { type: String, default: '' },
        isVerified: { type: Boolean, default: false },
      },
    ],
    lastMessage: {
      id: String,
      content: String,
      createdAt: { type: Date, default: Date.now },
      sender: {
        id: String,
        username: String,
        profilePicture: String,
      },
      status: { type: String, default: 'sent' },
    },
    unreadCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
