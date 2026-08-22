const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { v2: cloudinary } = require('cloudinary');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.use(cors());
app.use(express.json());
app.use('/videos', express.static(path.join(__dirname, '../public/videos')));

const JWT_SECRET = process.env.JWT_SECRET || 'lumigram_jwt_secret_change_me';
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/instagram_clone';
const DB_FILE = path.join(__dirname, '../data/db.json');

const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || '').replace(/['"]/g, '').trim();
const apiKey = (process.env.CLOUDINARY_API_KEY || '').replace(/['"]/g, '').trim();
const apiSecret = (process.env.CLOUDINARY_API_SECRET || '').replace(/['"]/g, '').trim();

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

// -------------------------------------------------------------
// MONGODB SCHEMAS & MODELS
// -------------------------------------------------------------
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  fullName: { type: String, default: '' },
  profilePicture: { type: String, default: '' },
  bio: { type: String, default: '' },
  followersCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  postsCount: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const ReelSchema = new mongoose.Schema({
  videoUrl: { type: String, required: true },
  thumbnailUrl: { type: String, default: '' },
  publicId: { type: String, default: '' },
  caption: { type: String, default: '' },
  author: {
    id: String,
    username: String,
    profilePicture: String,
    isVerified: { type: Boolean, default: false },
  },
  likesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  sharesCount: { type: Number, default: 0 },
  duration: { type: Number, default: 30 },
  audioName: { type: String, default: 'Original Audio' },
  createdAt: { type: Date, default: Date.now },
});

const OtpSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  purpose: { type: String, default: 'email_verification' },
  tempUser: { type: Object },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
});

const ConversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  participantDetails: [Object],
  lastMessage: { type: Object, default: null },
  unreadCount: { type: Map, of: Number, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const MessageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  senderId: { type: String, required: true },
  senderDetails: { type: Object },
  content: { type: String, required: true },
  status: { type: String, enum: ['sending', 'sent', 'delivered', 'read'], default: 'sent' },
  localId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const LikeSchema = new mongoose.Schema({
  reelId: { type: String, required: true },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
LikeSchema.index({ reelId: 1, userId: 1 }, { unique: true });

let User, Reel, Otp, Conversation, Message, Like;
try {
  User = mongoose.model('User', UserSchema);
  Reel = mongoose.model('Reel', ReelSchema);
  Otp = mongoose.model('Otp', OtpSchema);
  Conversation = mongoose.model('Conversation', ConversationSchema);
  Message = mongoose.model('Message', MessageSchema);
  Like = mongoose.model('Like', LikeSchema);
} catch (e) {
  User = mongoose.models.User;
  Reel = mongoose.models.Reel;
  Otp = mongoose.models.Otp;
  Conversation = mongoose.models.Conversation;
  Message = mongoose.models.Message;
  Like = mongoose.models.Like;
}

// -------------------------------------------------------------
// DATABASE CONNECTION & JSON FALLBACK
// -------------------------------------------------------------
let isMongoConnected = false;

mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    isMongoConnected = true;
    console.log(`🍃 [MONGODB] Connected successfully`);
  })
  .catch(() => {
    console.log(`⚠️ [MONGODB] Using local JSON fallback (server/data/db.json)`);
  });

let db = { users: [], reels: [], conversations: [], messages: new Map(), otps: new Map() };

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
    fs.writeFileSync(DB_FILE, JSON.stringify({
      users: db.users,
      reels: db.reels,
      conversations: db.conversations,
    }, null, 2));
  } catch (err) {
    console.error('Error saving db.json:', err);
  }
}

loadDb();

// -------------------------------------------------------------
// EMAIL SERVICE
// -------------------------------------------------------------
let nodemailer;
try { nodemailer = require('nodemailer'); } catch (e) {}

async function sendOtpEmail(toEmail, otp) {
  console.log(`\n📧 [OTP] Sending to ${toEmail}: ${otp}`);
  if (!nodemailer) return;

  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD;

  if (!smtpUser || !smtpPass) {
    console.log(`⚠️ [EMAIL] SMTP not configured — OTP logged above for testing`);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // Port 465 SSL prevents cloud provider timeout
      auth: { user: smtpUser, pass: smtpPass },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
    });
    await transporter.sendMail({
      from: `"Lumigram" <${smtpUser}>`,
      to: toEmail,
      subject: `${otp} is your Lumigram verification code`,
      html: `
        <div style="font-family:Arial,sans-serif;background:#08080A;color:#fff;padding:40px;text-align:center;">
          <h1 style="color:#fff;font-size:24px;letter-spacing:3px">LUMIGRAM</h1>
          <p style="color:#aaa">Your verification code:</p>
          <div style="background:#1A1A2B;border:1.5px dashed #7928CA;border-radius:14px;padding:18px;margin:20px auto;max-width:300px;">
            <span style="font-size:36px;font-weight:900;letter-spacing:8px;color:#00DFD8">${otp}</span>
          </div>
          <p style="color:#666;font-size:12px">Expires in 10 minutes. Do not share this code.</p>
        </div>`,
    });
    console.log(`✅ [EMAIL] OTP email delivered to ${toEmail}`);
  } catch (err) {
    console.error(`⚠️ [EMAIL] Failed to send email:`, err.message);
  }
}

// -------------------------------------------------------------
// JWT HELPERS
// -------------------------------------------------------------
function generateTokens(user) {
  const payload = { id: user._id || user.id, email: user.email, username: user.username };
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  const refreshToken = jwt.sign({ ...payload, refresh: true }, JWT_SECRET, { expiresIn: '30d' });
  return { accessToken, refreshToken, expiresIn: 604800 };
}

function verifyToken(token) {
  try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  const decoded = verifyToken(authHeader.split(' ')[1]);
  if (!decoded) return res.status(401).json({ message: 'Invalid or expired token' });
  req.user = decoded;
  next();
}

function sanitizeUser(user) {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  return obj;
}

// -------------------------------------------------------------
// HEALTH CHECK
// -------------------------------------------------------------
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// -------------------------------------------------------------
// AUTH ENDPOINTS
// -------------------------------------------------------------

// POST /v1/auth/signup
app.post('/v1/auth/signup', async (req, res) => {
  const { email, username, fullName, password } = req.body;
  if (!email || !username || !password) {
    return res.status(400).json({ message: 'Email, username, and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    if (isMongoConnected) {
      const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
      if (existing) {
        const field = existing.email === email.toLowerCase() ? 'email' : 'username';
        return res.status(409).json({ message: `This ${field} is already taken` });
      }
    } else {
      const existing = db.users.find(u =>
        u.email.toLowerCase() === email.toLowerCase() || u.username === username
      );
      if (existing) return res.status(409).json({ message: 'Email or username already exists' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const hashedPassword = await bcrypt.hash(password, 10);
    const tempUser = { email: email.toLowerCase(), username, fullName: fullName || username, password: hashedPassword };

    if (isMongoConnected) {
      await Otp.deleteMany({ email: email.toLowerCase(), purpose: 'email_verification' });
      await Otp.create({ email: email.toLowerCase(), otp, purpose: 'email_verification', tempUser, expiresAt });
    } else {
      db.otps.set(email.toLowerCase(), { otp, purpose: 'email_verification', tempUser, expiresAt: expiresAt.getTime() });
    }

    await sendOtpEmail(email, otp);
    return res.json({ email, message: 'Verification code sent to your email' });
  } catch (err) {
    console.error('[SIGNUP ERROR]', err);
    return res.status(500).json({ message: 'Signup failed. Please try again.' });
  }
});

// POST /v1/auth/login
app.post('/v1/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

  try {
    let user = null;
    if (isMongoConnected) {
      user = await User.findOne({ email: email.toLowerCase() });
    } else {
      user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    }

    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ message: 'Invalid email or password' });

    const tokens = generateTokens(user);
    return res.json({ user: sanitizeUser(user), tokens });
  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    return res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

// POST /v1/auth/verify-otp
app.post('/v1/auth/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

  try {
    let record = null;
    if (isMongoConnected) {
      record = await Otp.findOne({ email: email.toLowerCase(), used: false }).sort({ createdAt: -1 });
    } else {
      record = db.otps.get(email.toLowerCase());
    }

    if (!record) return res.status(400).json({ message: 'No verification code found. Please request a new one.' });

    const expiresAt = record.expiresAt instanceof Date ? record.expiresAt.getTime() : record.expiresAt;
    if (Date.now() > expiresAt) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ message: 'Invalid verification code. Please check and try again.' });
    }

    if (isMongoConnected) await Otp.updateOne({ _id: record._id }, { used: true });
    else db.otps.delete(email.toLowerCase());

    if (record.tempUser) {
      let newUser;
      if (isMongoConnected) {
        newUser = await User.create(record.tempUser);
      } else {
        newUser = { id: `user-${Date.now()}`, ...record.tempUser };
        db.users.push(newUser);
        saveDb();
      }
      const tokens = generateTokens(newUser);
      return res.json({ verified: true, token: tokens.accessToken, tokens, user: sanitizeUser(newUser) });
    }

    return res.json({ verified: true });
  } catch (err) {
    console.error('[VERIFY OTP ERROR]', err);
    return res.status(500).json({ message: 'Verification failed. Please try again.' });
  }
});

// POST /v1/auth/forgot-password
app.post('/v1/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    let user = null;
    if (isMongoConnected) user = await User.findOne({ email: email.toLowerCase() });
    else user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) return res.json({ message: 'If an account exists, a code was sent to your email' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    if (isMongoConnected) {
      await Otp.deleteMany({ email: email.toLowerCase(), purpose: 'forgot_password' });
      await Otp.create({ email: email.toLowerCase(), otp, purpose: 'forgot_password', expiresAt });
    } else {
      db.otps.set(email.toLowerCase(), { otp, purpose: 'forgot_password', expiresAt: expiresAt.getTime() });
    }

    await sendOtpEmail(email, otp);
    return res.json({ message: 'Verification code sent to your email' });
  } catch (err) {
    console.error('[FORGOT PASSWORD ERROR]', err);
    return res.status(500).json({ message: 'Failed to send code. Please try again.' });
  }
});

// POST /v1/auth/create-profile
app.post('/v1/auth/create-profile', requireAuth, async (req, res) => {
  const { username, fullName, bio, profilePicture } = req.body;
  const userId = req.user.id;

  try {
    if (isMongoConnected) {
      const user = await User.findByIdAndUpdate(
        userId,
        { ...(username && { username }), ...(fullName && { fullName }), ...(bio !== undefined && { bio }), ...(profilePicture && { profilePicture }) },
        { new: true }
      );
      if (!user) return res.status(404).json({ message: 'User not found' });
      const tokens = generateTokens(user);
      return res.json({ user: sanitizeUser(user), tokens });
    } else {
      const user = db.users.find(u => (u._id || u.id) === userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      if (username) user.username = username;
      if (fullName) user.fullName = fullName;
      if (bio !== undefined) user.bio = bio;
      if (profilePicture) user.profilePicture = profilePicture;
      saveDb();
      const tokens = generateTokens(user);
      return res.json({ user: sanitizeUser(user), tokens });
    }
  } catch (err) {
    console.error('[CREATE PROFILE ERROR]', err);
    return res.status(500).json({ message: 'Profile update failed' });
  }
});

// POST /v1/auth/refresh-token
app.post('/v1/auth/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: 'Refresh token required' });

  const decoded = verifyToken(refreshToken);
  if (!decoded || !decoded.refresh) return res.status(401).json({ message: 'Invalid refresh token' });

  try {
    let user = null;
    if (isMongoConnected) user = await User.findById(decoded.id);
    else user = db.users.find(u => (u._id || u.id) === decoded.id);

    if (!user) return res.status(401).json({ message: 'User not found' });

    const tokens = generateTokens(user);
    return res.json(tokens);
  } catch (err) {
    return res.status(500).json({ message: 'Token refresh failed' });
  }
});

// POST /v1/auth/logout
app.post('/v1/auth/logout', (req, res) => res.json({ message: 'Logged out successfully' }));

// GET /v1/auth/me
app.get('/v1/auth/me', requireAuth, async (req, res) => {
  try {
    if (isMongoConnected) {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json({ user: sanitizeUser(user) });
    } else {
      const user = db.users.find(u => (u._id || u.id) === req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json({ user: sanitizeUser(user) });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// -------------------------------------------------------------
// CLOUDINARY UPLOAD
// -------------------------------------------------------------

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });

// POST /v1/reels/upload-url — returns signed upload params
app.post('/v1/reels/upload-url', requireAuth, async (req, res) => {
  try {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'lumigram/reels';

    const paramsToSign = { folder, timestamp };
    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

    return res.json({
      signature,
      timestamp,
      folder,
      cloudName: cloudName,
      apiKey: apiKey,
    });
  } catch (err) {
    console.error('[CLOUDINARY SIGN ERROR]', err);
    return res.status(500).json({ message: 'Failed to generate upload credentials' });
  }
});

// POST /v1/reels/upload-direct — reliable direct backend stream to Cloudinary
app.post('/v1/reels/upload-direct', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No video file provided' });

  const uploadStream = cloudinary.uploader.upload_stream(
    { folder: 'lumigram/reels', resource_type: 'video' },
    (error, result) => {
      if (error) {
        console.error('[CLOUDINARY DIRECT ERROR]', error);
        return res.status(500).json({ message: error.message || 'Cloudinary upload failed' });
      }
      const thumbnailUrl = result.secure_url.replace(/\.[^/.]+$/, '.jpg');
      return res.json({
        secure_url: result.secure_url,
        public_id: result.public_id,
        thumbnail_url: thumbnailUrl,
      });
    }
  );
  uploadStream.end(req.file.buffer);
});

// -------------------------------------------------------------
// REELS ENDPOINTS
// -------------------------------------------------------------

// GET /v1/reels?cursor=...&limit=5
app.get('/v1/reels', async (req, res) => {
  const cursor = req.query.cursor || null;
  const limit = Math.min(parseInt(req.query.limit) || 5, 20);
  const userId = req.headers.authorization ? verifyToken(req.headers.authorization.split(' ')[1])?.id : null;

  try {
    if (isMongoConnected) {
      const query = cursor ? { _id: { $lt: new mongoose.Types.ObjectId(cursor) } } : {};
      const reels = await Reel.find(query).sort({ createdAt: -1 }).limit(limit + 1);
      const hasMore = reels.length > limit;
      const page = hasMore ? reels.slice(0, limit) : reels;
      const nextCursor = hasMore ? page[page.length - 1]._id.toString() : null;

      let likedReelIds = new Set();
      if (userId) {
        const likes = await Like.find({ userId, reelId: { $in: page.map(r => r._id.toString()) } });
        likedReelIds = new Set(likes.map(l => l.reelId));
      }

      const formatted = page.map(r => ({
        id: r._id.toString(),
        videoUrl: r.videoUrl,
        thumbnailUrl: r.thumbnailUrl,
        caption: r.caption,
        author: r.author,
        likesCount: r.likesCount,
        commentsCount: r.commentsCount,
        sharesCount: r.sharesCount,
        isLiked: likedReelIds.has(r._id.toString()),
        duration: r.duration,
        audioName: r.audioName,
        createdAt: r.createdAt,
      }));

      return res.json({ reels: formatted, nextCursor, hasMore });
    } else {
      const cursorIdx = cursor ? db.reels.findIndex(r => r.id === cursor) + 1 : 0;
      const slice = db.reels.slice(cursorIdx, cursorIdx + limit);
      const hasMore = cursorIdx + limit < db.reels.length;
      const nextCursor = hasMore ? slice[slice.length - 1]?.id : null;
      return res.json({ reels: slice, nextCursor, hasMore });
    }
  } catch (err) {
    console.error('[GET REELS ERROR]', err);
    return res.status(500).json({ message: 'Failed to fetch reels' });
  }
});

// POST /v1/reels — create a new reel after Cloudinary upload
app.post('/v1/reels', requireAuth, async (req, res) => {
  const { videoUrl, thumbnailUrl, publicId, caption, audioName, duration } = req.body;
  if (!videoUrl) return res.status(400).json({ message: 'videoUrl is required' });

  try {
    let authorUser = null;
    if (isMongoConnected) {
      authorUser = await User.findById(req.user.id);
    } else {
      authorUser = db.users.find(u => (u._id || u.id) === req.user.id);
    }

    const author = authorUser ? {
      id: (authorUser._id || authorUser.id)?.toString(),
      username: authorUser.username,
      profilePicture: authorUser.profilePicture || '',
      isVerified: authorUser.isVerified || false,
    } : { id: req.user.id, username: req.user.username, profilePicture: '', isVerified: false };

    if (isMongoConnected) {
      const reel = await Reel.create({
        videoUrl, thumbnailUrl: thumbnailUrl || '', publicId: publicId || '',
        caption: caption || '', audioName: audioName || 'Original Audio',
        duration: duration || 30, author,
        likesCount: 0, commentsCount: 0, sharesCount: 0,
      });
      if (authorUser) await User.findByIdAndUpdate(req.user.id, { $inc: { postsCount: 1 } });
      return res.status(201).json({
        id: reel._id.toString(), videoUrl: reel.videoUrl, thumbnailUrl: reel.thumbnailUrl,
        caption: reel.caption, author: reel.author, likesCount: 0, commentsCount: 0,
        sharesCount: 0, isLiked: false, duration: reel.duration, audioName: reel.audioName,
        createdAt: reel.createdAt,
      });
    } else {
      const newReel = { id: `reel-${Date.now()}`, videoUrl, thumbnailUrl: thumbnailUrl || '', caption: caption || '', author, likesCount: 0, commentsCount: 0, sharesCount: 0, isLiked: false, duration: duration || 30, audioName: audioName || 'Original Audio', createdAt: new Date().toISOString() };
      db.reels.unshift(newReel);
      saveDb();
      return res.status(201).json(newReel);
    }
  } catch (err) {
    console.error('[CREATE REEL ERROR]', err);
    return res.status(500).json({ message: 'Failed to create reel' });
  }
});

// POST /v1/reels/:id/like — toggle like
app.post('/v1/reels/:id/like', requireAuth, async (req, res) => {
  const reelId = req.params.id;
  const userId = req.user.id;

  try {
    if (isMongoConnected) {
      const existing = await Like.findOne({ reelId, userId });
      if (existing) {
        await Like.deleteOne({ _id: existing._id });
        const reel = await Reel.findByIdAndUpdate(reelId, { $inc: { likesCount: -1 } }, { new: true });
        return res.json({ isLiked: false, likesCount: Math.max(0, reel?.likesCount ?? 0) });
      } else {
        await Like.create({ reelId, userId });
        const reel = await Reel.findByIdAndUpdate(reelId, { $inc: { likesCount: 1 } }, { new: true });
        return res.json({ isLiked: true, likesCount: reel?.likesCount ?? 1 });
      }
    } else {
      const reel = db.reels.find(r => r.id === reelId);
      if (reel) {
        reel.isLiked = !reel.isLiked;
        reel.likesCount = Math.max(0, reel.likesCount + (reel.isLiked ? 1 : -1));
        saveDb();
      }
      return res.json({ isLiked: reel?.isLiked ?? false, likesCount: reel?.likesCount ?? 0 });
    }
  } catch (err) {
    console.error('[LIKE ERROR]', err);
    return res.status(500).json({ message: 'Failed to update like' });
  }
});

// GET /v1/reels/:id/comments
app.get('/v1/reels/:id/comments', async (req, res) => {
  return res.json({ comments: [], nextCursor: null, hasMore: false });
});

// POST /v1/reels/:id/comments
app.post('/v1/reels/:id/comments', requireAuth, async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: 'Comment text is required' });
  if (isMongoConnected) await Reel.findByIdAndUpdate(req.params.id, { $inc: { commentsCount: 1 } });
  return res.json({ id: `comment-${Date.now()}`, text, createdAt: new Date().toISOString() });
});

// POST /v1/users/:id/follow
app.post('/v1/users/:id/follow', requireAuth, async (req, res) => {
  return res.json({ success: true });
});

// -------------------------------------------------------------
// CHAT ENDPOINTS
// -------------------------------------------------------------

// GET /v1/chat/conversations
app.get('/v1/chat/conversations', requireAuth, async (req, res) => {
  const userId = req.user.id;
  try {
    if (isMongoConnected) {
      const convos = await Conversation.find({ 'participantDetails.id': userId }).sort({ updatedAt: -1 }).limit(50);
      return res.json({ conversations: convos, nextCursor: null, hasMore: false });
    } else {
      const userConvos = db.conversations.filter(c =>
        c.participantDetails?.some(p => p.id === userId)
      );
      return res.json({ conversations: userConvos, nextCursor: null, hasMore: false });
    }
  } catch (err) {
    console.error('[GET CONVERSATIONS ERROR]', err);
    return res.status(500).json({ message: 'Failed to fetch conversations' });
  }
});

// POST /v1/chat/conversations — start or get existing conversation
app.post('/v1/chat/conversations', requireAuth, async (req, res) => {
  const { targetUserId } = req.body;
  const myId = req.user.id;
  if (!targetUserId) return res.status(400).json({ message: 'targetUserId is required' });

  try {
    if (isMongoConnected) {
      let convo = await Conversation.findOne({
        'participantDetails.id': { $all: [myId, targetUserId] },
      });

      if (!convo) {
        const me = await User.findById(myId);
        const them = await User.findById(targetUserId);
        if (!them) return res.status(404).json({ message: 'User not found' });

        convo = await Conversation.create({
          participantDetails: [
            { id: myId, username: me?.username, profilePicture: me?.profilePicture || '', fullName: me?.fullName },
            { id: targetUserId, username: them.username, profilePicture: them.profilePicture || '', fullName: them.fullName },
          ],
          lastMessage: null,
          unreadCount: {},
        });
      }
      return res.json({ conversation: convo });
    } else {
      let convo = db.conversations.find(c =>
        c.participantDetails?.some(p => p.id === myId) &&
        c.participantDetails?.some(p => p.id === targetUserId)
      );
      if (!convo) {
        const me = db.users.find(u => (u._id || u.id) === myId);
        const them = db.users.find(u => (u._id || u.id) === targetUserId);
        if (!them) return res.status(404).json({ message: 'User not found' });
        convo = {
          id: `conv-${Date.now()}`,
          participantDetails: [
            { id: myId, username: me?.username, profilePicture: me?.profilePicture || '' },
            { id: targetUserId, username: them.username, profilePicture: them.profilePicture || '' },
          ],
          lastMessage: null,
          updatedAt: new Date().toISOString(),
        };
        db.conversations.push(convo);
        saveDb();
      }
      return res.json({ conversation: convo });
    }
  } catch (err) {
    console.error('[CREATE CONVERSATION ERROR]', err);
    return res.status(500).json({ message: 'Failed to create conversation' });
  }
});

// GET /v1/chat/conversations/:id/messages
app.get('/v1/chat/conversations/:id/messages', requireAuth, async (req, res) => {
  const conversationId = req.params.id;
  const cursor = req.query.cursor || null;
  const limit = 20;

  try {
    if (isMongoConnected) {
      const query = { conversationId: new mongoose.Types.ObjectId(conversationId) };
      if (cursor) query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
      const messages = await Message.find(query).sort({ createdAt: -1 }).limit(limit + 1);
      const hasMore = messages.length > limit;
      const page = hasMore ? messages.slice(0, limit) : messages;
      const nextCursor = hasMore ? page[page.length - 1]._id.toString() : null;
      return res.json({ messages: page.reverse(), nextCursor, hasMore });
    } else {
      const messageList = db.messages.get(conversationId) || [];
      return res.json({ messages: messageList, nextCursor: null, hasMore: false });
    }
  } catch (err) {
    console.error('[GET MESSAGES ERROR]', err);
    return res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// POST /v1/chat/conversations/:id/messages
app.post('/v1/chat/conversations/:id/messages', requireAuth, async (req, res) => {
  const conversationId = req.params.id;
  const { content, localId } = req.body;
  const userId = req.user.id;

  if (!content?.trim()) return res.status(400).json({ message: 'Message content is required' });

  try {
    let senderDetails = { id: userId, username: req.user.username, profilePicture: '' };
    if (isMongoConnected) {
      const sender = await User.findById(userId);
      if (sender) senderDetails = { id: userId, username: sender.username, profilePicture: sender.profilePicture || '' };
    }

    if (isMongoConnected) {
      const msg = await Message.create({
        conversationId: new mongoose.Types.ObjectId(conversationId),
        senderId: userId, senderDetails, content: content.trim(),
        status: 'sent', localId,
      });
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: { id: msg._id.toString(), content: msg.content, senderId: userId, createdAt: msg.createdAt },
        updatedAt: new Date(),
      });
      const formatted = { id: msg._id.toString(), conversationId, sender: senderDetails, content: msg.content, status: 'sent', localId, createdAt: msg.createdAt };
      io.to(conversationId).emit('message:received', formatted);
      return res.json(formatted);
    } else {
      const newMsg = { id: `msg-${Date.now()}`, localId, conversationId, sender: senderDetails, content: content.trim(), status: 'sent', createdAt: new Date().toISOString() };
      const list = db.messages.get(conversationId) || [];
      list.push(newMsg);
      db.messages.set(conversationId, list);
      const conv = db.conversations.find(c => (c._id || c.id) === conversationId);
      if (conv) { conv.lastMessage = newMsg; conv.updatedAt = newMsg.createdAt; saveDb(); }
      io.to(conversationId).emit('message:received', newMsg);
      return res.json(newMsg);
    }
  } catch (err) {
    console.error('[SEND MESSAGE ERROR]', err);
    return res.status(500).json({ message: 'Failed to send message' });
  }
});

// GET /v1/chat/users/search?q=...
app.get('/v1/chat/users/search', requireAuth, async (req, res) => {
  const query = (req.query.q || '').trim();
  const myId = req.user.id;
  if (query.length < 2) return res.json({ users: [], nextCursor: null, hasMore: false });

  try {
    if (isMongoConnected) {
      const regex = new RegExp(query, 'i');
      const users = await User.find({
        _id: { $ne: new mongoose.Types.ObjectId(myId) },
        $or: [{ username: regex }, { fullName: regex }],
      }).limit(20);
      return res.json({ users: users.map(sanitizeUser), nextCursor: null, hasMore: false });
    } else {
      const lq = query.toLowerCase();
      const matched = db.users.filter(u =>
        (u._id || u.id) !== myId &&
        (u.username.toLowerCase().includes(lq) || (u.fullName || '').toLowerCase().includes(lq))
      );
      return res.json({ users: matched.map(u => { const s = { ...u }; delete s.password; return s; }), nextCursor: null, hasMore: false });
    }
  } catch (err) {
    console.error('[SEARCH ERROR]', err);
    return res.status(500).json({ message: 'Search failed' });
  }
});

// PUT /v1/chat/conversations/:id/read
app.put('/v1/chat/conversations/:id/read', requireAuth, async (req, res) => {
  const conversationId = req.params.id;
  if (isMongoConnected) {
    await Message.updateMany({ conversationId: new mongoose.Types.ObjectId(conversationId), senderId: { $ne: req.user.id }, status: { $ne: 'read' } }, { status: 'read' });
  }
  io.to(conversationId).emit('messages:read', { conversationId, userId: req.user.id });
  return res.json({ success: true });
});

// -------------------------------------------------------------
// SOCKET.IO REAL-TIME CHAT
// -------------------------------------------------------------

const onlineUsers = new Map();

io.on('connection', (socket) => {
  const token = socket.handshake.auth?.token;
  const decoded = token ? verifyToken(token) : null;
  const socketUserId = decoded?.id;

  if (socketUserId) {
    onlineUsers.set(socketUserId, socket.id);
    socket.broadcast.emit('user:online', { userId: socketUserId });
  }

  console.log(`[SOCKET] Connected: ${socket.id}${socketUserId ? ` (user: ${socketUserId})` : ''}`);

  socket.on('join_conversation', ({ conversationId }) => {
    socket.join(conversationId);
  });

  socket.on('leave_conversation', ({ conversationId }) => {
    socket.leave(conversationId);
  });

  socket.on('typing', ({ conversationId, isTyping }) => {
    socket.to(conversationId).emit('user:typing', {
      conversationId,
      userId: socketUserId,
      isTyping,
    });
  });

  socket.on('message:delivered', ({ messageId, conversationId }) => {
    io.to(conversationId).emit('message:delivered', { messageId, conversationId });
  });

  socket.on('disconnect', () => {
    if (socketUserId) {
      onlineUsers.delete(socketUserId);
      socket.broadcast.emit('user:offline', { userId: socketUserId });
    }
    console.log(`[SOCKET] Disconnected: ${socket.id}`);
  });
});

app.get('/v1/users/:id/online', requireAuth, (req, res) => {
  const isOnline = onlineUsers.has(req.params.id);
  return res.json({ isOnline, userId: req.params.id });
});

// -------------------------------------------------------------
// BOOT
// -------------------------------------------------------------
server.listen(PORT, '0.0.0.0', () => {
  console.log(`=========================================`);
  console.log(`🚀 LUMIGRAM BACKEND`);
  console.log(`📡 REST API:   http://localhost:${PORT}/v1`);
  console.log(`⚡ SOCKET.IO:  http://localhost:${PORT}`);
  console.log(`🍃 MONGODB:    ${isMongoConnected ? 'Connected' : 'Pending...'}`);
  console.log(`☁️  CLOUDINARY: ${cloudName ? cloudName : 'Not configured'}`);
  console.log(`=========================================`);
});
