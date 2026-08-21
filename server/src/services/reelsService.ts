import fs from 'fs';
import path from 'path';
import { Reel } from '../models/Reel';
import { Comment } from '../models/Comment';

const DB_FILE = path.join(__dirname, '../../data/db.json');

function getLocalData() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    }
  } catch (e) {}
  return { users: [], reels: [], conversations: [] };
}

export class ReelsService {
  public static async fetchReels(cursor: number = 0, limit: number = 5) {
    try {
      const reels = await Reel.find()
        .sort({ createdAt: -1 })
        .skip(cursor)
        .limit(limit);

      if (reels && reels.length > 0) {
        const total = await Reel.countDocuments();
        const nextCursor = cursor + limit < total ? String(cursor + limit) : null;

        return {
          reels: reels.map(r => ({
            id: r._id.toString(),
            videoUrl: r.videoUrl,
            thumbnailUrl: r.thumbnailUrl,
            caption: r.caption,
            author: r.author,
            likesCount: r.likesCount,
            commentsCount: r.commentsCount,
            sharesCount: r.sharesCount,
            isLiked: r.isLiked,
            duration: r.duration,
            audioName: r.audioName,
            createdAt: r.createdAt.toISOString(),
          })),
          nextCursor,
          hasMore: nextCursor !== null,
        };
      }
    } catch (e) {}

    const data = getLocalData();
    const reelsSlice = data.reels.slice(cursor, cursor + limit);
    const nextCursor = cursor + limit < data.reels.length ? String(cursor + limit) : null;

    return {
      reels: reelsSlice,
      nextCursor,
      hasMore: nextCursor !== null,
    };
  }

  public static async likeReel(reelId: string, isLiked: boolean) {
    try {
      const reel = await Reel.findById(reelId);
      if (reel) {
        reel.isLiked = isLiked;
        reel.likesCount += isLiked ? 1 : -1;
        await reel.save();
        return { success: true, reel };
      }
    } catch (e) {}
    return { success: true, isLiked };
  }

  public static async addComment(reelId: string, user: any, content: string) {
    try {
      const comment = await Comment.create({ reelId, user, content });
      await Reel.findByIdAndUpdate(reelId, { $inc: { commentsCount: 1 } });
      return comment;
    } catch (e) {
      return { id: `cmt-${Date.now()}`, reelId, user, content, likesCount: 0, createdAt: new Date() };
    }
  }

  public static async fetchComments(reelId: string, skip: number = 0, limit: number = 20) {
    try {
      const comments = await Comment.find({ reelId }).sort({ createdAt: -1 }).skip(skip).limit(limit);
      return comments;
    } catch (e) {
      return [];
    }
  }
}
