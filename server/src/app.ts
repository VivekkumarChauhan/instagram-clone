import express from 'express';
import cors from 'cors';
import path from 'path';
import { AuthController } from './controllers/authController';
import { ReelsController } from './controllers/reelsController';
import { ChatController } from './controllers/chatController';

export const app = express();

app.use(cors());
app.use(express.json());
app.use('/videos', express.static(path.join(__dirname, '../public/videos')));

// -------------------------------------------------------------
// REST API ROUTES
// -------------------------------------------------------------

// Auth Routes
app.post('/v1/auth/login', AuthController.login);
app.post('/v1/auth/signup', AuthController.signup);
app.post('/v1/auth/verify-otp', AuthController.verifyOtp);
app.post('/v1/auth/forgot-password', AuthController.verifyOtp);
app.post('/v1/auth/create-profile', AuthController.updateProfile);
app.post('/v1/auth/logout', AuthController.logout);

// Reels Routes
app.get('/v1/reels', ReelsController.getReels);
app.post('/v1/reels/:id/like', ReelsController.likeReel);
app.get('/v1/reels/:id/comments', ReelsController.getComments);
app.post('/v1/reels/:id/comments', ReelsController.addComment);

// Chat Routes
app.get('/v1/chat/conversations', ChatController.getConversations);
app.get('/v1/chat/conversations/:id/messages', ChatController.getMessages);
app.post('/v1/chat/conversations/:id/messages', ChatController.sendMessage);
app.get('/v1/chat/users/search', ChatController.searchUsers);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
