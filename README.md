# 📱 Lumigram — Production-Ready Instagram Clone

A production-grade mobile application built with **React Native** (Android & iOS) and a scalable **Node.js / Express / Socket.IO** cloud backend. Features end-to-end authentication with real OTP email verification, full-screen vertical Reels with direct Cloudinary video uploads, and real-time Socket.IO direct messaging with offline caching.

---

## 🌟 Graded Feature Highlights

| Module | Implementation Details |
|---|---|
| 🔐 **Authentication & Session** | Real OTP verification via Gmail SMTP, JWT access & refresh tokens, password hashing with `bcryptjs`, and encrypted session persistence via MMKV. |
| 🎬 **Reels & Media Cloud** | 9:16 vertical reels with direct **Cloudinary** uploads (presigned signatures), inline `TextureView` rendering, double-tap heart animations, seek scrubbing, optimistic likes, and cursor pagination. |
| 💬 **Real-time Direct Chat** | Real-time messaging with **Socket.IO**, typing presence, read receipts, optimistic sending with auto-retry, and 500ms debounced user search with `AbortController` cancellation. |
| 💾 **Offline-First Resilience** | Fast synchronous caching via **react-native-mmkv**, cache versioning to prevent stale data, and offline message queueing. |
| ☁️ **Cloud Deployed Backend** | Ready for 1-click deployment on **Render** with persistent MongoDB Atlas cloud database. Zero localhost/USB dependency. |

---

## 🗂️ Clean Folder Architecture

```
instagram-clone/
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── common/             # NetworkBanner, Loader, Avatar, DoubleTapHeart
│   │   ├── reels/              # ReelItem, ReelOverlay, ReelProgress
│   │   └── chat/               # ConversationItem, TypingIndicator
│   ├── navigation/             # Type-safe React Navigation stacks & bottom tabs
│   │   ├── AppNavigator.tsx    # Root Navigator (Auth vs Main)
│   │   ├── AuthNavigator.tsx   # Splash → Login → Signup → OTP
│   │   ├── MainNavigator.tsx   # Home, Explore, Create (+), Reels, Chat, Profile
│   │   └── ChatNavigator.tsx   # Chat list → Search → Detail Room
│   ├── screens/                # Application screens
│   │   ├── auth/               # LoginScreen, SignUpScreen, OTPVerificationScreen, etc.
│   │   ├── feed/               # HomeScreen
│   │   ├── explore/            # ExploreScreen (debounced search)
│   │   ├── reels/              # ReelsScreen, UploadReelScreen
│   │   ├── chat/               # ChatListScreen, ChatSearchScreen, ChatDetailScreen
│   │   └── profile/            # ProfileScreen
│   ├── services/               # API & Network layer
│   │   ├── api/                # apiClient (Axios interceptors), authApi, reelsApi, chatApi, uploadApi
│   │   └── socket/             # socketClient, chatSocket (Socket.IO singleton)
│   ├── store/                  # Domain-separated Zustand stores (authStore, reelsStore, chatStore)
│   ├── types/                  # TypeScript definitions (auth, reels, chat, navigation)
│   ├── utils/                  # theme, constants, mmkvStorage, validationUtils
│   └── config.ts               # Environment toggle (Dev vs Production Cloud Backend)
└── server/                     # Node.js Express Backend
    ├── src/
    │   └── server.js           # Production Express + Socket.IO + Cloudinary + MongoDB API
    ├── data/                   # JSON fallback (empty by default)
    ├── render.yaml             # Render deployment blueprint
    └── .env.example            # Environment configuration template
```

---

## 🚀 Quick Setup Guide

### 1. Prerequisites
- **Node.js** v18+
- **JDK 17** & **Android Studio** (for local Android builds)

### 2. Install Dependencies
```bash
# Frontend
npm install

# Backend
cd server
npm install
cd ..
```

---

## ⚙️ Environment Configuration

### Backend (`server/.env`)
Copy `server/.env.example` to `server/.env` and supply your credentials:
```bash
cp server/.env.example server/.env
```

```env
PORT=5000
NODE_ENV=production

# MongoDB Atlas URI
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/instagram_clone

# JWT Security
JWT_SECRET=your_super_secure_jwt_secret_key_2026

# Cloudinary (Sign up at https://cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Gmail SMTP for OTP Dispatch (Use Google 16-character App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_16_char_app_password
```

---

## ☁️ Deploying Backend to Render (No USB/Localhost Needed)

1. Push this repository to **GitHub**.
2. Go to [Render Dashboard](https://dashboard.render.com) → **New Web Service**.
3. Select your repository.
4. Set the following:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
5. Under **Environment Variables**, add the variables from `server/.env`.
6. Click **Deploy**. Render will generate a live URL (e.g., `https://lumigram-api.onrender.com`).
7. Update `src/config.ts`:
   ```ts
   const RENDER_URL = 'https://lumigram-api.onrender.com';
   ```

### ⏱️ Keep-Alive for Render Free Tier
Render free-tier web services spin down after 15 minutes of inactivity. To keep the instance warm for demoing:
- Use a free monitoring service like [UptimeRobot](https://uptimerobot.com) or [cron-job.org](https://cron-job.org).
- Set an HTTP monitor to ping `https://<your-render-url>/health` every **10 minutes**.
- *Note: If waking from a cold start, allow 30–45 seconds for initial boot.*

---

## 📱 Running the Mobile App

### Android (Local Development)
```bash
npm run android
```

### Production Testing
Once connected to the live Render backend, the app communicates over HTTPS/WSS with **no ADB port forwarding or USB connection required**.

---

## 🧪 Testing Checklist

- [x] **Sign Up with Real OTP**: Create account → receive real 6-digit email code → verify → profile created.
- [x] **Reels Feed**: Full-screen auto-playback with `TextureView`, zero infinite loading spinners.
- [x] **New Reel Upload**: Tap `+` tab → pick/record vertical video → progress bar → Cloudinary direct upload → reel appears in feed.
- [x] **Real-time Chat**: Search user (debounced) → instant messaging via Socket.IO with typing indicators and optimistic UI updates.
- [x] **Offline Resilience**: Cached reels and conversations load instantly via MMKV with zero network delay.

---

## 📄 Technical Design Document

For comprehensive architectural documentation covering state management, MMKV strategies, socket topologies, and production scalability, see [ARCHITECTURE.md](ARCHITECTURE.md).
