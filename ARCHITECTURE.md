# Lumigram — Technical Architecture & Engineering Document

This document provides an in-depth breakdown of the technical design, data flows, state management, offline-first strategies, and scalability considerations for the **Lumigram** mobile application.

---

## 1. Application Architecture

Lumigram is structured following clean architectural boundaries:
- **Presentation Layer**: React Native UI components built with React Native Reanimated v3, React Native Gesture Handler, and themed tokens.
- **Navigation Layer**: Type-safe stack and bottom-tab navigation using `@react-navigation/native` and `@react-navigation/bottom-tabs`.
- **State Management Layer**: Domain-separated Zustand stores managing server, persistent, and UI state slices.
- **Data & Persistence Layer**: Fast key-value synchronous persistence using `react-native-mmkv`.
- **Network Layer**: Dual-channel communication:
  - **REST API (Axios)** for transactional operations, pagination, authentication, and media uploads.
  - **WebSocket / Socket.IO** for real-time messaging, typing indicators, presence, and read receipts.
- **Media Cloud Layer**: Direct video streaming and presigned media uploads powered by **Cloudinary**.

---

## 2. Zustand Architecture

Rather than relying on a single monolithic global store, state is segregated into modular domain stores:

1. **`authStore`**: Manages authentication status (`idle`, `loading`, `authenticated`, `unauthenticated`), tokens, and current user profile. Employs `persist` middleware backed by MMKV for instant session restoration.
2. **`reelsStore`**: Handles cursor pagination, reel collections, playback indices, mute states, and optimistic like/follow counters.
3. **`chatStore`**: Controls active conversations, message queues, typing indicators, search states, and real-time socket events.

### State Separation Principles
- **Server State**: Reels pages, conversation messages, remote user search results.
- **Persistent State**: User tokens, last viewed reels cache, user preferences (e.g. mute state).
- **UI State**: Active reel index, speed multiplier (2X hold), scrub preview timestamps.
- **Ephemeral State**: Double-tap heart animations, gestures, and active video frame updates (kept in component refs to avoid unnecessary re-renders).

---

## 3. MMKV Caching Strategy

### Why MMKV?
- **Speed**: Over 30x faster than standard `AsyncStorage` (~0.2ms vs ~15ms).
- **Synchronous Execution**: Eliminates the flash of unstyled/empty content (FOUC) on cold app launch by rehydrating the feed before the first frame paint.
- **Thread Safety**: Multithreaded C++ core accessible across threads.

### Cache Versioning (`reels_cache_version`)
To prevent users from experiencing stale or broken video URLs across schema changes or CDN migrations, the store implements a **cache-busting version**:
```ts
const CACHE_VERSION = 2;

hydrateFromCache: () => {
  const storedVersion = getItem<number>('reels_cache_version');
  if (storedVersion !== CACHE_VERSION) {
    setItem('reels_cache', null);
    setItem('reels_pagination', null);
    setItem('reels_cache_version', CACHE_VERSION);
    return;
  }
  const cached = getItem<Reel[]>('reels_cache');
  if (cached?.length) set({ reels: cached });
}
```

---

## 4. Reels Pagination Strategy

Pagination uses a **cursor-based mechanism** rather than static offset/page numbers to prevent content drift when new reels are uploaded concurrently:
1. **Initial Load**: Fetches 5 reels (`GET /v1/reels?limit=5`).
2. **Prefetch Trigger**: When the user scrolls to reel index `N - 2` (where `N` is the total count in memory), `checkAndFetchMore` automatically requests the next batch of 5 reels in the background.
3. **Deduplication**: Newly fetched pages are merged using a `Set` of unique reel IDs, preventing duplicate entries.
4. **Race-Condition Guards**: Guard checks (`isFetchingMore`, `hasMore`) prevent duplicate simultaneous API calls while a fetch is in-flight.

---

## 5. Offline-First Approach

Lumigram delivers an uninterrupted Instagram experience when network connectivity drops:
1. **Instant Launch**: On cold boot, `hydrateFromCache()` pulls cached reels and conversations from MMKV synchronously.
2. **Network State Awareness**: `NetInfo` monitors connectivity. When offline, a non-intrusive `NetworkBanner` informs the user while existing content remains fully interactive.
3. **Optimistic Mutations**: Likes and sent messages update the UI immediately with temporary local identifiers, reconciling or retrying once the network is restored.

---

## 6. Socket Architecture & Lifecycle

- **Singleton Pattern**: A single managed `SocketClient` instance manages the Socket.IO lifecycle.
- **Handshake Authentication**: Tokens are passed via the socket `auth` payload (`{ auth: { token } }`).
- **Connection Recovery**: Automatic exponential backoff with reconnection attempts (`SOCKET_RECONNECT_ATTEMPTS = 5`).
- **Background/Foreground Transition**: Event listeners are cleaned up and re-registered upon room changes and app state transitions to prevent duplicate socket listeners.

---

## 7. Chat Synchronization Strategy

- **Dual-Channel Harmony**:
  - `GET /v1/chat/conversations` and `GET /v1/chat/conversations/:id/messages` fetch historical data on demand.
  - Socket.IO emits real-time `new_message`, `user:typing`, `message:delivered`, and `messages:read` events.
- **Message State Progression**:
  `sending (optimistic)` ➔ `sent (server ack)` ➔ `delivered` ➔ `read`.
- **Auto-Retry**: Messages that fail due to network interruptions offer a 1-tap retry mechanism.

---

## 8. Search Implementation & Debouncing Strategy

To prevent API flooding and race conditions on rapid user typing:
1. **500ms Debounce**: Custom `useDebounce` hook gates outgoing search requests.
2. **Minimum Threshold**: Queries under 2 characters clear the result list immediately without dispatching API calls.
3. **Request Cancellation (`AbortController`)**: Each new keystroke aborts previous in-flight requests:
```ts
abortControllerRef.current?.abort();
abortControllerRef.current = new AbortController();
searchUsers(query, abortControllerRef.current.signal);
```
4. **Recent Searches**: Persisted in MMKV to provide instant search history.

---

## 9. Performance Optimizations

1. **Single Active Video Player**: Only the visible reel mounts an active `react-native-video` player; off-screen reels render static lightweight poster thumbnails.
2. **Android `TextureView` Integration**: Configured `useTextureView={Platform.OS === 'android'}` on the video component to bypass Android `SurfaceView` clipping inside scroll containers.
3. **FlatList Layout Caching**: Strict `getItemLayout` eliminates layout computation overhead during vertical scrolling.
4. **Zustand Selectors**: Components subscribe to narrow state slices (`selectIsMuted`, `selectCurrentIndex`) rather than entire store objects, preventing extraneous re-renders.

---

## 10. App Restart Behavior

On app cold start:
1. `authStore` rehydrates tokens and user session synchronously from MMKV.
2. `AppNavigator` routes to `MainNavigator` if an authenticated session exists; otherwise displays `AuthNavigator`.
3. `reelsStore` loads cached reels from MMKV in 0ms, then silently refreshes with fresh reels if online.
4. `socketClient` connects and registers real-time listeners for active rooms.

---

## 11. Large-Scale Production Roadmap

For scaling to millions of concurrent users:
- **Embedded Database (WatermelonDB / SQLite)**: Replace MMKV message storage with WatermelonDB (SQLite-backed) for indexed SQL queries across hundreds of thousands of historical messages.
- **Adaptive Bitrate Streaming (HLS/DASH)**: Transcode uploaded MP4s into multi-bitrate HLS streams via Cloudinary / AWS MediaConvert for adaptive streaming across varying mobile bandwidths.
- **Horizontal Socket Scaling**: Introduce **Redis Pub/Sub adapter** for Socket.IO cluster nodes.
- **Video Preloading**: Implement an ExoPlayer caching pipeline to buffer the next 2-3 seconds of the upcoming reel before the user swipes.
