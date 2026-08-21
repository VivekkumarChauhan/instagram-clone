import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { User } from '../models/User';
import { Reel } from '../models/Reel';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/instagram_clone';

const DEMO_USERS = [
  {
    username: 'johndoe',
    email: 'user@example.com',
    password: 'Password1',
    fullName: 'John Doe',
    profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    bio: 'Living my best life 📸 | Lumigram Creator 🌍',
    followersCount: 1247,
    followingCount: 384,
    postsCount: 56,
    isVerified: false,
  },
  {
    username: 'alex_photo',
    email: 'alex@example.com',
    password: 'Password1',
    fullName: 'Alex Vance',
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    bio: 'Visual storyteller & wanderer 📸 • Tokyo / NYC',
    followersCount: 153700,
    followingCount: 268,
    postsCount: 358,
    isVerified: true,
  },
  {
    username: 'elena_vibe',
    email: 'elena@example.com',
    password: 'Password1',
    fullName: 'Elena Rostova',
    profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    bio: 'Travel • Design • Aesthetics ✨',
    followersCount: 42300,
    followingCount: 512,
    postsCount: 120,
    isVerified: false,
  },
];

const SEED_REELS = [
  {
    videoUrl: 'http://localhost:5000/videos/VID_20260821_135436_638.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400',
    caption: 'Official Instagram Reel Spotlight 🎬🔥 #trending #viral #lumigram',
    author: {
      id: 'user-002',
      username: 'alex_photo',
      profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      isVerified: true,
      isFollowing: false,
    },
    likesCount: 184500,
    commentsCount: 4920,
    sharesCount: 3810,
    isLiked: false,
    duration: 45,
    audioName: 'Original Instagram Audio • Trending Track',
  },
  {
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400',
    caption: 'Neon dreams in Tokyo streets 🌃 #tokyo #streetstyle #vibes',
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
    duration: 60,
    audioName: 'Chill Beats - LoFi Sunset',
  },
  {
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
    caption: 'Full Sci-Fi Short Film — Tears of Steel 🤖⚔️ #scifi #film #animation',
    author: {
      id: 'user-001',
      username: 'johndoe',
      profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      isVerified: false,
      isFollowing: false,
    },
    likesCount: 98800,
    commentsCount: 4940,
    sharesCount: 3610,
    isLiked: false,
    duration: 60,
    audioName: 'Sci-Fi Orchestral Score',
  },
  {
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400',
    caption: 'Golden leaves dancing in the autumn wind 🍂🍁 #nature #calm',
    author: {
      id: 'user-002',
      username: 'alex_photo',
      profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      isVerified: true,
      isFollowing: false,
    },
    likesCount: 38700,
    commentsCount: 1200,
    sharesCount: 750,
    isLiked: false,
    duration: 18,
    audioName: 'Autumn Breeze Sound',
  },
  {
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400',
    caption: 'Golden hour hike in the mountains 🏔️🔥 #adventure #hiking',
    author: {
      id: 'user-003',
      username: 'elena_vibe',
      profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      isVerified: false,
      isFollowing: true,
    },
    likesCount: 88400,
    commentsCount: 4200,
    sharesCount: 3100,
    isLiked: false,
    duration: 45,
    audioName: 'Trending Cinematic Sound',
  },
  {
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400',
    caption: 'Escaping the ordinary. Where are you heading this weekend? 🚗🏕️',
    author: {
      id: 'user-001',
      username: 'johndoe',
      profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      isVerified: false,
      isFollowing: false,
    },
    likesCount: 51200,
    commentsCount: 1980,
    sharesCount: 1420,
    isLiked: false,
    duration: 35,
    audioName: 'Road Trip Beats Vol. 1',
  },
  {
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400',
    caption: 'Pure weekend festival energy! Turn up the volume 🔊🎉',
    author: {
      id: 'user-002',
      username: 'alex_photo',
      profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      isVerified: true,
      isFollowing: true,
    },
    likesCount: 94200,
    commentsCount: 5600,
    sharesCount: 4200,
    isLiked: false,
    duration: 50,
    audioName: 'Festival Anthem 2026',
  },
  {
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400',
    caption: 'Good morning from the forest 🌲🐰 Happy vibes only!',
    author: {
      id: 'user-003',
      username: 'elena_vibe',
      profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      isVerified: false,
      isFollowing: false,
    },
    likesCount: 120500,
    commentsCount: 6800,
    sharesCount: 5100,
    isLiked: false,
    duration: 60,
    audioName: 'Forest Morning Soundscape',
  },
];

async function seed() {
  console.log('🌱 [SEED] Initializing seed data...');
  const DB_FILE = path.join(__dirname, '../../data/db.json');

  const payload = {
    users: DEMO_USERS.map((u, i) => ({ id: `user-00${i + 1}`, ...u })),
    reels: SEED_REELS.map((r, i) => ({ id: `reel-${i + 1}`, ...r })),
    conversations: [
      {
        id: 'conv-1',
        participants: [
          {
            id: 'user-002',
            username: 'alex_photo',
            fullName: 'Alex Vance',
            profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
            isVerified: true,
          },
        ],
        lastMessage: {
          id: 'msg-2',
          content: 'Looks incredible! Loved the color grading 🎬',
          createdAt: new Date().toISOString(),
          sender: {
            id: 'user-001',
            username: 'johndoe',
            profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
          },
          status: 'read',
        },
        unreadCount: 1,
      },
    ],
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2));
  console.log(`✅ [SEED] Seed data written to ${DB_FILE}`);

  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000, dbName: 'instagram_clone' });
    console.log('🌱 [SEED] Connected to MongoDB Atlas (instagram_clone)');
    await User.deleteMany({});
    await Reel.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    await User.insertMany(DEMO_USERS);
    await Reel.insertMany(SEED_REELS);
    console.log('✅ [SEED] MongoDB collections seeded successfully with 8-10 sample reels!');
  } catch (err: any) {
    console.log('ℹ️ [SEED] MongoDB connection note:', err.message);
  }

  process.exit(0);
}

seed();
