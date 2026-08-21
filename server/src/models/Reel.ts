import mongoose, { Schema, Document } from 'mongoose';

export interface IReelAuthor {
  id: string;
  username: string;
  profilePicture: string;
  isVerified: boolean;
  isFollowing?: boolean;
}

export interface IReel extends Document {
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
  author: IReelAuthor;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  duration: number;
  audioName: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReelSchema: Schema = new Schema(
  {
    videoUrl: { type: String, required: true },
    thumbnailUrl: { type: String, default: '' },
    caption: { type: String, default: '' },
    author: {
      id: { type: String, required: true },
      username: { type: String, required: true },
      profilePicture: { type: String, default: '' },
      isVerified: { type: Boolean, default: false },
      isFollowing: { type: Boolean, default: false },
    },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
    isLiked: { type: Boolean, default: false },
    duration: { type: Number, default: 30 },
    audioName: { type: String, default: 'Original Audio - Lumigram Sound' },
  },
  { timestamps: true },
);

export const Reel = mongoose.model<IReel>('Reel', ReelSchema);
