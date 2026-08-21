# 📱 Lumigram — Instagram Clone

A full-stack Instagram-style mobile application built with **React Native** (Android & iOS) and a **Node.js/TypeScript Express** backend. Features real-time chat, vertical reels feed, OTP email verification, MongoDB Atlas storage, and a premium dark-mode UI.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Authentication** | Email signup/login with real OTP verification via Gmail SMTP |
| 🎬 **Reels Feed** | Vertical swipeable video player with double-tap like, seek scrubber, 2× speed |
| 🏠 **Home Feed** | Post feed with story rings, likes, and comments |
| 🔍 **Explore** | Search with live filtering and category chips |
| 💬 **Direct Messages** | Real-time chat via Socket.IO with typing indicators |
| 👤 **Profile** | Stats, grid posts, story highlights, follow/unfollow |
| 🍃 **MongoDB Atlas** | Cloud database with local JSON fallback |
| 🔥 **Firebase** | Admin SDK for push notification support |
| 📧 **Gmail SMTP** | Real email OTP delivery (no Ethereal test accounts) |

---

## 🗂️ Project Structure

```
instagram-clone/
├── android/                    # Android native project
├── ios/                        # iOS native project (not configured)
├── src/                        # React Native app source
│   ├── components/             # Reusable UI components
│   │   ├── common/             # Loader, NetworkBanner, etc.
│   │   └── reels/              # ReelItem, ReelOverlay
│   ├── navigation/             # React Navigation stack & tab navigators
│   ├── screens/                # All app screens
│   │   ├── auth/               # Onboarding, SignUp, Login, OTPVerification
│   │   ├── feed/               # HomeScreen
│   │   ├── explore/            # ExploreScreen
│   │   ├── reels/              # ReelsScreen
│   │   ├── profile/            # ProfileScreen
│   │   └── chat/               # ChatList, ChatRoom
│   ├── services/               # API clients and mock services
│   ├── store/                  # Zustand global state stores
│   ├── types/                  # TypeScript type definitions
│   └── utils/                  # Constants, theme, helpers
└── server/                     # Express backend
    ├── src/
    │   ├── controllers/        # Route handlers (auth, reels, chat)
    │   ├── models/             # Mongoose MongoDB models
    │   ├── services/           # EmailService, etc.
    │   ├── scripts/            # Database seed script
    │   └── server.ts           # Entry point
    ├── data/                   # Local JSON database fallback
    └── public/videos/          # Static video file hosting
```

---

## 🛠️ Prerequisites

Make sure you have the following installed:

- **Node.js** v18+ → [nodejs.org](https://nodejs.org)
- **Java JDK 17** → [adoptium.net](https://adoptium.net)
- **Android Studio** with Android SDK (API 31+)
- **ADB (Android Debug Bridge)** — included with Android SDK
- **Git**

---

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/lumigram.git
cd lumigram
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

---

## 🔧 Environment Configuration

### Backend (`server/.env`)

Copy the example file and fill in your credentials:

```bash
cp server/.env.example server/.env
```

Then edit `server/.env`:

```env
# Server
PORT=5000

# MongoDB Atlas URI (get from cloud.mongodb.com)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/instagram_clone

# JWT Secret (use a long random string)
JWT_SECRET=your_super_secret_jwt_key

# Token Expiry
JWT_ACCESS_EXPIRATION=7d
JWT_REFRESH_EXPIRATION=30d
OTP_EXPIRATION_MINUTES=10

# Firebase Admin SDK (from Firebase Console → Project Settings → Service Accounts)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"

# Gmail SMTP (use a Google App Password, NOT your real password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_16_char_app_password
ALERT_EMAIL_FROM=your_email@gmail.com
ALERT_EMAIL_TO=your_email@gmail.com
```

> **How to get a Google App Password:**
> 1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
> 2. Enable **2-Step Verification**
> 3. Search for **"App passwords"** and generate one for "Mail"
> 4. Copy the 16-character password into `SMTP_PASSWORD`

---

## 🗄️ Seed the Database

Run the seed script to populate demo users, reels, and conversations:

```bash
cd server
npm run seed
```

Expected output:
```
🌱 [SEED] Initializing seed data...
✅ [SEED] Seed data written to server/data/db.json
🌱 [SEED] Connected to MongoDB Atlas
✅ [SEED] MongoDB collections seeded successfully with 8-10 sample reels!
```

---

## 📱 Running on Android

### Step 1 — Start the Backend Server

Open **Terminal 1**:

```bash
cd server
npm start
```

You should see:
```
🚀 LUMIGRAM BACKEND running on http://localhost:5000
🍃 [MONGODB ATLAS] Connected successfully!
```

### Step 2 — Connect Your Android Phone

1. Enable **Developer Options** on your phone:
   - Go to **Settings → About Phone**
   - Tap **Build Number** 7 times
2. Enable **USB Debugging** in Developer Options
3. Connect phone via USB
4. Accept the debugging prompt on your phone

### Step 3 — Set Up ADB Port Forwarding

Open **Terminal 2** and run:

```powershell
# Windows — add platform-tools to PATH
$env:PATH = "$env:LOCALAPPDATA\Android\Sdk\platform-tools;" + $env:PATH

# Forward backend and Metro ports to phone
adb reverse tcp:5000 tcp:5000
adb reverse tcp:8081 tcp:8081

# Verify device is connected
adb devices
```

> ⚠️ **Note:** You must run `adb reverse` every time you reconnect your phone or restart ADB.

### Step 4 — Build & Install the App

```bash
npm run android
```

This will:
- Build the native Android APK
- Install it on your connected device
- Start Metro bundler

> The `npm run android` script automatically runs `adb reverse` for port forwarding.

---

## 🍎 Running on iOS (Mac only)

```bash
cd ios && pod install && cd ..
npx react-native run-ios
```

---

## 🔄 Development Workflow

### Hot Reload (After First Install)

Once the app is installed, you only need to:

1. Start the backend: `cd server && npm start`
2. Start Metro: `npm start` (in root)
3. Press **`r`** in Metro terminal to reload JavaScript

### Add New Reels

Edit [`server/src/scripts/seed.ts`](server/src/scripts/seed.ts) and run:

```bash
cd server && npm run seed
```

---

## 🧪 Testing

### Run Backend API Tests

```bash
cd server
node test_all_endpoints.js
```

Expected: **8/8 tests passing** ✅

### TypeScript Type Check

```bash
npx tsc --noEmit
```

Expected: **0 errors**

---

## 🏛️ Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   React Native App                   │
│                                                     │
│  Zustand Stores ──── REST API (Axios) ──────────┐   │
│  (Auth, Reels,        Socket.IO Client           │   │
│   Chat, UI)                                      │   │
└──────────────────────────────────────────────────┼──┘
                                                   │
                    ┌──────────────────────────────▼──┐
                    │        Express Backend            │
                    │                                  │
                    │  /v1/auth     → AuthController   │
                    │  /v1/reels    → ReelsController  │
                    │  /v1/chat     → ChatController   │
                    │  /videos      → Static MP4 files │
                    │  Socket.IO    → Real-time chat   │
                    └──────────┬───────────────────────┘
                               │
               ┌───────────────┴──────────────┐
               │                              │
     ┌─────────▼──────────┐      ┌────────────▼──────────┐
     │   MongoDB Atlas     │      │   Gmail SMTP Server   │
     │   (instagram_clone) │      │   (OTP Delivery)      │
     └────────────────────┘      └───────────────────────┘
```

---

## 🔑 Test Credentials

After seeding, you can log in with:

| Field | Value |
|---|---|
| Email | `user@example.com` |
| Password | `Password1` |
| Master OTP | `123456` (works for any account) |

---

## 🐛 Troubleshooting

### Videos not loading (black screen)
- Ensure `android:usesCleartextTraffic="true"` is in [`AndroidManifest.xml`](android/app/src/main/AndroidManifest.xml)
- Run `npm run android` to do a full native rebuild (not just `r` reload)

### OTP email not received
- Check your Gmail **Promotions**, **Updates**, or **Spam** folders
- Verify `SMTP_PASSWORD` is a Google App Password (16 chars), not your Gmail login password
- The server terminal always prints the OTP code instantly — use that for testing

### `EADDRINUSE :::8081` — Metro port in use
```bash
# Kill the process on port 8081
npx kill-port 8081
npm start
```

### `EADDRINUSE :::5000` — Backend port in use
```bash
npx kill-port 5000
cd server && npm start
```

### ADB device not found
```bash
adb kill-server
adb start-server
adb devices
```

### MongoDB not connecting
The app has a local JSON fallback at `server/data/db.json`. If MongoDB Atlas connection fails:
- Whitelist your IP in [MongoDB Atlas Network Access](https://cloud.mongodb.com)
- Or use a local MongoDB URI: `MONGODB_URI=mongodb://127.0.0.1:27017/instagram_clone`

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| **Mobile App** | React Native 0.74 |
| **Language** | TypeScript |
| **Navigation** | React Navigation v6 |
| **State Management** | Zustand + MMKV |
| **Video Player** | react-native-video v6 |
| **Animations** | React Native Reanimated v3 |
| **Gestures** | React Native Gesture Handler v2 |
| **Backend** | Node.js + Express + TypeScript |
| **Database** | MongoDB Atlas + Mongoose |
| **Real-time** | Socket.IO v4 |
| **Authentication** | JWT + bcrypt |
| **Email** | Nodemailer + Gmail SMTP |
| **Storage (Mobile)** | react-native-mmkv |

---

## 📄 License

MIT License — free to use for personal and educational projects.

---

## 🙏 Acknowledgements

- Video assets from [Google Cloud Storage Sample Videos](https://goo.gl/nPzbbg)
- Avatar images from [Unsplash](https://unsplash.com) and [Pravatar](https://pravatar.cc)
- Icons by [Ionicons](https://ionic.io/ionicons)
