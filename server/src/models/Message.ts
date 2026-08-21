import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  conversationId: string;
  sender: {
    id: string;
    username: string;
    profilePicture?: string;
  };
  content: string;
  localId?: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio';
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    conversationId: { type: String, required: true, index: true },
    sender: {
      id: { type: String, required: true },
      username: { type: String, required: true },
      profilePicture: { type: String, default: '' },
    },
    content: { type: String, required: true },
    localId: { type: String },
    status: { type: String, enum: ['sending', 'sent', 'delivered', 'read', 'failed'], default: 'sent' },
    mediaUrl: { type: String },
    mediaType: { type: String, enum: ['image', 'video', 'audio'] },
  },
  { timestamps: true },
);

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
