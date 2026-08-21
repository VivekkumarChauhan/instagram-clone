import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  reelId: string;
  user: {
    id: string;
    username: string;
    profilePicture?: string;
  };
  content: string;
  likesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema(
  {
    reelId: { type: String, required: true, index: true },
    user: {
      id: { type: String, required: true },
      username: { type: String, required: true },
      profilePicture: { type: String, default: '' },
    },
    content: { type: String, required: true },
    likesCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Comment = mongoose.model<IComment>('Comment', CommentSchema);
