import { Request, Response } from 'express';
import { ReelsService } from '../services/reelsService';

export class ReelsController {
  public static async getReels(req: Request, res: Response) {
    try {
      const cursor = req.query.cursor ? parseInt(req.query.cursor as string, 10) : 0;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;
      const result = await ReelsService.fetchReels(cursor, limit);
      return res.json(result);
    } catch (e: any) {
      return res.status(500).json({ message: e.message || 'Failed to fetch reels' });
    }
  }

  public static async likeReel(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { isLiked } = req.body;
      const result = await ReelsService.likeReel(id, isLiked);
      return res.json(result);
    } catch (e: any) {
      return res.status(500).json({ message: e.message || 'Failed to like reel' });
    }
  }

  public static async getComments(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await ReelsService.fetchComments(id);
      return res.json({ comments: result });
    } catch (e: any) {
      return res.status(500).json({ message: e.message || 'Failed to fetch comments' });
    }
  }

  public static async addComment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { content, user } = req.body;
      const result = await ReelsService.addComment(id, user, content);
      return res.json(result);
    } catch (e: any) {
      return res.status(500).json({ message: e.message || 'Failed to add comment' });
    }
  }
}
