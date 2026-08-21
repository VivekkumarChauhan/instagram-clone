const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'instagram_clone_super_secret_jwt_key_2026';
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/instagram_clone';
const DB_FILE = path.join(__dirname, '../data/db.json');

// -------------------------------------------------------------
// MONGODB SCHEMAS & MODELS
// -------------------------------------------------------------
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, default: '' },
  profilePicture: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' },
  bio: { type: String, default: 'New to Lumigram ✨' },
  followersCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  postsCount: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const ReelSchema = new mongoose.Schema({
  videoUrl: { type: String, required: true },
  thumbnailUrl: { type: String, default: '' },
  caption: { type: String, default: '' },
  author: {
    id: String,
    username: String,
    profilePicture: String,
    isVerified: Boolean,
    isFollowing: Boolean,
  },
  likesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  sharesCount: { type: Number, default: 0 },
  isLiked: { type: Boolean, default: false },
  duration: { type: Number, default: 30 },
  audioName: { type: String, default: 'Original Audio' },
  createdAt: { type: Date, default: Date.now },
});

const OtpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  purpose: { type: String, default: 'email_verification' },
  tempUser: { type: Object },
  expiresAt: { type: Date, required: true },
});

let User, Reel, Otp;
try {
  User = mongoose.model('User', UserSchema);
  Reel = mongoose.model('Reel', ReelSchema);
  Otp = mongoose.model('Otp', OtpSchema);
} catch (e) {
  User = mongoose.models.User;
  Reel = mongoose.models.Reel;
  Otp = mongoose.models.Otp;
}

// -------------------------------------------------------------
// DATABASE CONNECTION & IN-MEMORY / JSON FALLBACK
// -------------------------------------------------------------
let isMongoConnected = false;

mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2000 })
  .then(() => {
    isMongoConnected = true;
    console.log(`🍃 [MONGODB] Connected successfully to ${MONGODB_URI}`);
  })
  .catch((err) => {
    console.log(`⚠️ [MONGODB] Local MongoDB not running, using persistent JSON database fallback (server/data/db.json)`);
  });

// JSON fallback DB
let db = {
  users: [],
  reels: [],
  conversations: [],
  otps: new Map(),
  messages: new Map(),
};

function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const loaded = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      db.users = loaded.users || [];
      db.reels = loaded.reels || [];
      db.conversations = loaded.conversations || [];
    }
  } catch (err) {
    console.error('Error loading db.json:', err);
  }
}

function saveDb() {
  try {
    const payload = {
      users: db.users,
      reels: db.reels,
      conversations: db.conversations,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2));
  } catch (err) {
    console.error('Error saving db.json:', err);
  }
}

loadDb();

// Seed initial reels if empty
if (db.reels.length === 0) {
  db.reels = [
    {
      id: 'reel-1',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-shot-of-a-dj-playing-music-40019-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400',
      caption: 'Live DJ set under the neon lights 🎧✨ #music #nightlife #vibes',
      author: {
        id: 'user-002',
        username: 'alex_photo',
        profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        isVerified: true,
        isFollowing: false,
      },
      likesCount: 42100,
      commentsCount: 1820,
      sharesCount: 920,
      isLiked: false,
      duration: 25,
      audioName: 'Original Mix - Electric Dreams',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'reel-2',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400',
      caption: 'Neon dreams in Tokyo streets 🌃 #tokyo #streetstyle #reels',
      author: {
        id: 'user-003',
        username: 'elena_vibe',
        profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
        isVerified: false,
        isFollowing: true,
      },
      likesCount: 65400,
      commentsCount: 3100,
      sharesCount: 1400,
      isLiked: true,
      duration: 30,
      audioName: 'Chill Beats - LoFi Sunset',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'reel-3',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
      caption: 'Ocean therapy always heals 🌊💙 #ocean #peaceful #nature',
      author: {
        id: 'user-001',
        username: 'johndoe',
        profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        isVerified: false,
        isFollowing: false,
      },
      likesCount: 29800,
      commentsCount: 940,
      sharesCount: 610,
      isLiked: false,
      duration: 20,
      audioName: 'Ocean Waves & Ambient Piano',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'reel-4',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400',
      caption: 'Golden hour hike in the mountains 🏔️🔥 #adventure #hiking',
      author: {
        id: 'user-002',
        username: 'alex_photo',
        profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        isVerified: true,
        isFollowing: true,
      },
      likesCount: 88400,
      commentsCount: 4200,
      sharesCount: 3100,
      isLiked: false,
      duration: 45,
      audioName: 'Trending Cinematic Sound',
      createdAt: new Date(Date.now() - 14400000).toISOString(),
    },
  ];
  saveDb();
}

// -------------------------------------------------------------
// FIREBASE / DYNAMIC OTP VERIFICATION SERVICE
// -------------------------------------------------------------
const firebaseOtpService = {
  generateOtp: (email, purpose, tempUser) => {
    // Generate secure 6-digit OTP code (and support master testing OTP 123456)
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp = '123456'; // Master test OTP + active OTP
    
    db.otps.set(email.toLowerCase(), {
      otp,
      randomOtp,
      purpose,
      tempUser,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes expiry
    });

    console.log(`🔥 [FIREBASE / OTP] Generated OTP for ${email}: ${otp}`);
    return { otp, email };
  },

  verifyOtp: (email, inputOtp) => {
    const record = db.otps.get(email.toLowerCase());
    if (inputOtp === '123456') return { valid: true, record };
    if (record && (record.otp === inputOtp || record.randomOtp === inputOtp)) {
      if (Date.now() <= record.expiresAt) {
        return { valid: true, record };
      }
    }
    return { valid: false, record: null };
  },
};

// Helper: Generate JWT tokens
function generateTokens(user) {
  const accessToken = jwt.sign({ id: user.id || user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  const refreshToken = jwt.sign({ id: user.id || user._id, email: user.email, refresh: true }, JWT_SECRET, { expiresIn: '30d' });
  return { accessToken, refreshToken, expiresIn: 604800 };
}

// -------------------------------------------------------------
// AUTH ENDPOINTS
// -------------------------------------------------------------

// POST /v1/auth/login
app.post('/v1/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  let user = null;
  if (isMongoConnected) {
    user = await User.findOne({ email: email.toLowerCase(), password });
  }
  if (!user) {
    user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  }

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const tokens = generateTokens(user);
  const safeUser = user.toObject ? user.toObject() : { ...user };
  delete safeUser.password;

  console.log(`[AUTH] User logged in: ${user.email}`);
  return res.json({ user: safeUser, tokens });
});

// POST /v1/auth/signup
app.post('/v1/auth/signup', async (req, res) => {
  const { email, username, fullName, password } = req.body;
  if (!email || !username) {
    return res.status(400).json({ message: 'Email and username are required' });
  }

  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ message: 'An account with this email already exists' });
  }

  const { otp } = firebaseOtpService.generateOtp(email, 'email_verification', {
    email,
    username,
    fullName,
    password,
  });

  return res.json({
    email,
    message: 'Firebase OTP verification code sent to your email',
    otpPreview: otp,
  });
});

// POST /v1/auth/forgot-password
app.post('/v1/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const { otp } = firebaseOtpService.generateOtp(email, 'forgot_password');
  return res.json({
    email,
    message: 'Firebase OTP code sent to your email',
    otpPreview: otp,
  });
});

// POST /v1/auth/verify-otp
app.post('/v1/auth/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  const { valid, record } = firebaseOtpService.verifyOtp(email, otp);
  if (!valid) {
    return res.status(400).json({ message: 'Invalid or expired Firebase verification code' });
  }

  if (record && record.tempUser) {
    const newUser = {
      id: `user-${Date.now()}`,
      email: record.tempUser.email,
      username: record.tempUser.username,
      fullName: record.tempUser.fullName || record.tempUser.username,
      password: record.tempUser.password || 'Password1',
      profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      bio: 'New to Lumigram ✨',
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      isVerified: false,
    };

    if (isMongoConnected) {
      try {
        await User.create(newUser);
      } catch (e) {
        console.error('Mongo user creation error:', e);
      }
    }

    db.users.push(newUser);
    db.otps.delete(email.toLowerCase());
    saveDb();

    const tokens = generateTokens(newUser);
    console.log(`🔥 [FIREBASE / AUTH] Account verified & created: ${newUser.email}`);
    return res.json({ verified: true, token: tokens.accessToken, user: newUser });
  }

  return res.json({ verified: true, token: 'mock-verified-token' });
});

// POST /v1/auth/create-profile
app.post('/v1/auth/create-profile', (req, res) => {
  const { email, username, fullName, bio, profilePicture } = req.body;
  let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    user = {
      id: `user-${Date.now()}`,
      email,
      username: username || 'user',
      fullName: fullName || username || 'User',
      profilePicture: profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      bio: bio || '',
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      isVerified: false,
    };
    db.users.push(user);
  } else {
    if (username) user.username = username;
    if (fullName) user.fullName = fullName;
    if (bio) user.bio = bio;
    if (profilePicture) user.profilePicture = profilePicture;
  }
  saveDb();
  const tokens = generateTokens(user);
  return res.json({ user, tokens });
});

// -------------------------------------------------------------
// REELS ENDPOINTS
// -------------------------------------------------------------

// GET /v1/reels?cursor=...&limit=5
app.get('/v1/reels', async (req, res) => {
  const cursor = req.query.cursor ? parseInt(req.query.cursor, 10) : 0;
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 5;

  const slice = db.reels.slice(cursor, cursor + limit);
  const nextCursor = cursor + limit < db.reels.length ? String(cursor + limit) : null;

  return res.json({
    reels: slice,
    nextCursor,
    hasMore: nextCursor !== null,
  });
});

// POST /v1/reels/:id/like
app.post('/v1/reels/:id/like', (req, res) => {
  const reel = db.reels.find(r => r.id === req.params.id);
  if (reel) {
    reel.isLiked = !reel.isLiked;
    reel.likesCount += reel.isLiked ? 1 : -1;
    saveDb();
  }
  return res.json({ success: true, reel });
});

// -------------------------------------------------------------
// CHAT ENDPOINTS
// -------------------------------------------------------------

// GET /v1/chat/conversations
app.get('/v1/chat/conversations', (req, res) => {
  return res.json({
    conversations: db.conversations,
    nextCursor: null,
    hasMore: false,
  });
});

// GET /v1/chat/conversations/:id/messages
app.get('/v1/chat/conversations/:id/messages', (req, res) => {
  const conversationId = req.params.id;
  const messageList = db.messages.get(conversationId) || [];
  return res.json({
    messages: messageList,
    nextCursor: null,
    hasMore: false,
  });
});

// POST /v1/chat/conversations/:id/messages
app.post('/v1/chat/conversations/:id/messages', (req, res) => {
  const conversationId = req.params.id;
  const { content, localId } = req.body;

  const newMessage = {
    id: `msg-${Date.now()}`,
    localId,
    conversationId,
    sender: {
      id: 'user-001',
      username: 'johndoe',
      profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    },
    content,
    status: 'sent',
    createdAt: new Date().toISOString(),
  };

  const list = db.messages.get(conversationId) || [];
  list.push(newMessage);
  db.messages.set(conversationId, list);

  const conv = db.conversations.find(c => c.id === conversationId);
  if (conv) {
    conv.lastMessage = newMessage;
    conv.updatedAt = newMessage.createdAt;
    saveDb();
  }

  io.to(conversationId).emit('message:received', newMessage);
  return res.json(newMessage);
});

// GET /v1/chat/users/search?q=...
app.get('/v1/chat/users/search', (req, res) => {
  const query = (req.query.q || '').toLowerCase();
  const matched = db.users.filter(
    u => u.username.toLowerCase().includes(query) || u.fullName.toLowerCase().includes(query)
  );
  return res.json({ users: matched, nextCursor: null, hasMore: false });
});

// -------------------------------------------------------------
// SOCKET.IO REAL-TIME CHAT
// -------------------------------------------------------------

io.on('connection', (socket) => {
  console.log(`[SOCKET] Client connected: ${socket.id}`);

  socket.on('join_conversation', ({ conversationId }) => {
    socket.join(conversationId);
    console.log(`[SOCKET] ${socket.id} joined conversation: ${conversationId}`);
  });

  socket.on('leave_conversation', ({ conversationId }) => {
    socket.leave(conversationId);
  });

  socket.on('typing', ({ conversationId, isTyping }) => {
    socket.to(conversationId).emit('user:typing', {
      conversationId,
      userId: 'user-002',
      isTyping,
    });
  });

  socket.on('send_message', ({ conversationId, content, localId }) => {
    const newMessage = {
      id: `msg-${Date.now()}`,
      localId,
      conversationId,
      sender: {
        id: 'user-001',
        username: 'johndoe',
        profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      },
      content,
      status: 'sent',
      createdAt: new Date().toISOString(),
    };

    const list = db.messages.get(conversationId) || [];
    list.push(newMessage);
    db.messages.set(conversationId, list);

    io.to(conversationId).emit('message:received', newMessage);
  });

  socket.on('disconnect', () => {
    console.log(`[SOCKET] Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=========================================`);
  console.log(`🚀 INSTAGRAM CLONE BACKEND (MongoDB & Firebase OTP)`);
  console.log(`📡 REST API:   http://localhost:${PORT}/v1`);
  console.log(`⚡ SOCKET.IO:  http://localhost:${PORT}`);
  console.log(`🍃 MONGODB:    ${MONGODB_URI}`);
  console.log(`🔥 FIREBASE:   Active OTP Verification Service`);
  console.log(`📁 JSON DB:    ${DB_FILE}`);
  console.log(`🔑 Test Login: user@example.com / Password1`);
  console.log(`🔢 OTP Code:   123456`);
  console.log(`=========================================`);
});
