import { Request, Response } from 'express';
import { ChatService } from '../services/chatService';

export class ChatController {
  public static async getConversations(req: Request, res: Response) {
    try {
      const result = await ChatService.fetchConversations();
      return res.json(result);
    } catch (e: any) {
      return res.status(500).json({ message: e.message || 'Failed to fetch conversations' });
    }
  }

  public static async getMessages(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await ChatService.fetchMessages(id);
      return res.json(result);
    } catch (e: any) {
      return res.status(500).json({ message: e.message || 'Failed to fetch messages' });
    }
  }

  public static async sendMessage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { content, localId, sender } = req.body;
      const defaultSender = sender || {
        id: 'user-001',
        username: 'johndoe',
        profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      };
      const result = await ChatService.saveMessage(id, defaultSender, content, localId);
      return res.json(result);
    } catch (e: any) {
      return res.status(500).json({ message: e.message || 'Failed to send message' });
    }
  }

  public static async searchUsers(req: Request, res: Response) {
    try {
      const query = (req.query.q as string) || '';
      const result = await ChatService.searchUsers(query);
      return res.json(result);
    } catch (e: any) {
      return res.status(500).json({ message: e.message || 'Failed to search users' });
    }
  }
}
