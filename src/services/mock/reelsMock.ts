import { mockDelay } from '@utils/mockDelay';
import { REELS_PAGE_SIZE } from '@utils/constants';
import type { Reel, ReelsPage } from '@appTypes/reels';

const VIDEO_URLS = [
  'http://localhost:5000/videos/VID_20260821_135436_638.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
];

const THUMBNAIL_URLS = [
  'https://picsum.photos/seed/reel1/400/700',
  'https://picsum.photos/seed/reel2/400/700',
  'https://picsum.photos/seed/reel3/400/700',
  'https://picsum.photos/seed/reel4/400/700',
  'https://picsum.photos/seed/reel5/400/700',
  'https://picsum.photos/seed/reel6/400/700',
  'https://picsum.photos/seed/reel7/400/700',
  'https://picsum.photos/seed/reel8/400/700',
  'https://picsum.photos/seed/reel9/400/700',
  'https://picsum.photos/seed/reel10/400/700',
];

const CAPTIONS = [
  'Living life one frame at a time 🎬 #reels #vibes',
  'This view though 😍 #nature #beautiful',
  'Good times with great people 🙌 #friends #memories',
  'Making every second count ⏱️ #motivation #hustle',
  'When the beat drops just right 🎵 #music #dance',
  'Explore more, worry less 🌍 #travel #adventure',
  'Sunrise hits different from up here 🌅 #morning #golden',
  'Caffeinated and ready to go ☕ #coffee #vibes',
  'This one goes out to the dreamers 💭 #inspiration',
  'Golden hour magic ✨ #photography #sunset',
];

const AUDIO_NAMES = [
  'Original Audio',
  'Trending Sound - DJ Remix',
  'Chill Beats Vol. 3',
  'Viral Dance Track',
  'Epic Cinematic Sounds',
  'Lo-fi Hip Hop Radio',
];

const AUTHORS = [
  { id: 'u1', username: 'alex.captures', profilePicture: 'https://i.pravatar.cc/150?img=2', isVerified: true },
  { id: 'u2', username: 'sarah.travels', profilePicture: 'https://i.pravatar.cc/150?img=3', isVerified: false },
  { id: 'u3', username: 'mike.adventure', profilePicture: 'https://i.pravatar.cc/150?img=4', isVerified: true },
  { id: 'u4', username: 'emma.creates', profilePicture: 'https://i.pravatar.cc/150?img=5', isVerified: false },
  { id: 'u5', username: 'david.vibes', profilePicture: 'https://i.pravatar.cc/150?img=6', isVerified: false },
  { id: 'u6', username: 'lisa.moments', profilePicture: 'https://i.pravatar.cc/150?img=7', isVerified: true },
];

let reelIdCounter = 0;

function generateReel(index: number): Reel {
  reelIdCounter += 1;
  const author = AUTHORS[index % AUTHORS.length];
  return {
    id: `reel-${reelIdCounter}`,
    videoUrl: VIDEO_URLS[index % VIDEO_URLS.length],
    thumbnailUrl: THUMBNAIL_URLS[index % THUMBNAIL_URLS.length],
    caption: CAPTIONS[index % CAPTIONS.length],
    author: {
      ...author,
      isFollowing: Math.random() > 0.5,
    },
    likesCount: Math.floor(Math.random() * 50000) + 100,
    commentsCount: Math.floor(Math.random() * 2000) + 10,
    sharesCount: Math.floor(Math.random() * 500) + 5,
    isLiked: Math.random() > 0.6,
    duration: Math.floor(Math.random() * 45) + 15,
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    audioName: AUDIO_NAMES[index % AUDIO_NAMES.length],
  };
}

const MAX_REELS = 30;

export const reelsMock = {
  async fetchReels(cursor: string | null, limit = REELS_PAGE_SIZE): Promise<ReelsPage> {
    await mockDelay(400, 900);

    const startIndex = cursor ? parseInt(cursor, 10) : 0;
    if (startIndex >= MAX_REELS) {
      return { reels: [], nextCursor: null, hasMore: false };
    }

    const endIndex = Math.min(startIndex + limit, MAX_REELS);
    const reels: Reel[] = [];
    for (let i = startIndex; i < endIndex; i++) {
      reels.push(generateReel(i));
    }

    const nextCursor = endIndex < MAX_REELS ? String(endIndex) : null;
    return { reels, nextCursor, hasMore: nextCursor !== null };
  },

  async likeReel(reelId: string, isLiked: boolean): Promise<void> {
    await mockDelay(100, 300);
  },

  async followUser(userId: string, isFollowing: boolean): Promise<void> {
    await mockDelay(100, 300);
  },
};
