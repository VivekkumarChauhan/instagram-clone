# Technical Design Document — Instagram Clone

## 1. Application Architecture

The app follows a **layered architecture** with clear separation of concerns:

```
UI Layer (screens + components)
        ↕
State Layer (Zustand stores)
        ↕
Service Layer (API + Socket)
        ↕
Persistence Layer (MMKV)
```

**Principles applied:**
- No component accesses the network directly — always through a service
- No component accesses MMKV directly — always through the store or a utility
- All Zustand actions are named, pure, and testable
- Mock services implement the same interface as real API clients (drop-in replacement pattern)

---

## 2. Zustand Architecture

Four separate stores, each owning a distinct domain:

| Store | Responsibility |
|---|---|
| `authStore` | User session, tokens, auth status — persisted in encrypted MMKV |
| `reelsStore` | Reel list, pagination, like/follow, playback state, mute — partially persisted |
| `chatStore` | Conversations, messages, typing, socket state, search — not persisted at store level (MMKV managed manually) |
| `networkStore` | Online/offline status via NetInfo |
| `userPrefsStore` | Theme, mute preference, autoplay — fully persisted |

Within `reelsStore`, state is conceptually separated:
- **Server state**: `reels`, `isLoading`, `isRefreshing`, `error`
- **Pagination state**: `nextCursor`, `hasMore`, `isFetchingMore`
- **UI state**: `currentIndex`, `isMuted`, `playbackStates`

Within `chatStore`, state is conceptually separated:
- **Server state**: `conversations`, loading flags
- **Messages state**: `messagesByConversation`, cursors, hasMore flags
- **UI state**: `activeConversationId`, `typingByConversation`, `socketState`, `unreadCountByConversation`
- **Search state**: `searchResults`, `searchQuery`, `isSearching`, `recentSearches`

**Selector pattern** is used everywhere to prevent unnecessary re-renders:
```ts
const reels = useReelsStore(selectReels);          // only re-renders when reels array changes
const isMuted = useReelsStore(selectIsMuted);      // only re-renders when mute toggles
```

---

## 3. MMKV Caching Strategy & Two-Layer Architecture

The app uses a strict **two-layer caching architecture** to separate lightweight JSON metadata from heavy video binary streams:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. MMKV Layer (Metadata & Indexing)                          │
│    - Reel metadata JSON (id, caption, likes, author, etc.)   │
│    - Pagination cursor & hasMore state                      │
│    - video_cache_map (reelId -> local file:// path)         │
├─────────────────────────────────────────────────────────────┤
│ 2. Device Video Disk Cache (Binary Stream Storage)          │
│    - Downloaded .mp4 video files on app cache disk          │
│    - LRU Cache eviction (capped at max 15 videos)           │
│    - Background predictive preloading of next 1-2 reels     │
└─────────────────────────────────────────────────────────────┘
```

| Data | Storage | Key | Eviction |
|---|---|---|---|
| Auth tokens | Encrypted MMKV | `access_token`, `refresh_token` | On logout / 401 |
| User profile | Encrypted MMKV (via Zustand persist) | `auth_state` | On logout |
| Reel list | MMKV | `reels_cache` | On refresh (replaced) |
| Pagination metadata | MMKV | `reels_pagination` | On refresh (replaced) |
| Video Cache Map | MMKV | `video_cache_map` | LRU eviction with disk files |
| Video .mp4 files | Device Disk Cache | `RNFS.CachesDirectoryPath/reels/` | Oldest evicted past 15 files |
| Conversations | MMKV | `conversations_cache` | On new load (replaced) |
| Messages per conversation | MMKV | `messages_{conversationId}` | Rolling window of last 50 messages |
| User preferences | MMKV (via Zustand persist) | `user_preferences` | Never evicted |
| Recent searches | Zustand in-memory only | — | App session only |

**What is NOT persisted in MMKV:**
- Large binary blobs (video files are stored on disk, NEVER as raw strings in MMKV)
- Playback states (ephemeral per session)
- Typing indicators (real-time only)
- Socket connection state
- Search results (always fresh)

**Synchronous hydration** advantage: MMKV is JSI-based and synchronous. On app launch, `hydrateFromCache()` runs synchronously before the first render, eliminating the "flash of empty content" problem that AsyncStorage would cause.

---

## 4. Reels Pagination Strategy

```
App Launch
    → hydrateFromCache() — show cached reels instantly (frame 0)
    → loadInitialReels() — fetch page 1 (5 reels) from API & trigger background caching
    → Store in Zustand + persist to MMKV

User scrolls to reel (REELS_PREFETCH_THRESHOLD = 3 from end)
    → checkAndFetchMore() detects threshold crossed
    → fetchMoreReels() called — guarded by isFetchingMore flag
    → cacheReelVideos() predicts and preloads next 1–2 reels ahead of current index
    → New reels appended with deduplication (Set-based ID check)
    → MMKV updated (accumulated reels)
```

**Guard conditions prevent:**
- Duplicate API calls: `isFetchingMore` flag + `isLoading` check
- Duplicate reels: `Set<id>` filter before appending
- Over-fetching: `hasMore` flag from server response
- Multiple simultaneous calls: single boolean guard

---

## 5. Offline-First Approach

**Reels offline flow:**
1. On launch: `hydrateFromCache()` loads cached reels synchronously from MMKV and resolves `source={{ uri }}` to local `file://` paths where cached.
2. If online: fetch fresh reels, update MMKV cache, background-preload adjacent `.mp4` video files.
3. If offline: cached reels are displayed immediately — no blank screen. Cached videos play locally with 0ms latency.
4. If a reel's metadata is in MMKV but the video was not yet cached before going offline, a graceful "Offline Mode — Video not cached" state is displayed with the cached poster rather than an infinite spinner.
5. `NetworkBanner` component shows "You're offline" banner when `status === 'offline'`.

**Chat offline flow:**
1. Conversations loaded from MMKV at chat list mount
2. Messages per conversation cached (last 50 per conversation)
3. If message send fails due to network: status = `failed`, retry button shown
4. On network return: user manually retries via `retryFailedMessage()`
5. Background auto-retry (with queue) would be added for production

**Network detection:** `useNetworkStore` subscribes to `NetInfo.addEventListener` — drives UI banner, prevents unnecessary API calls, and determines socket reconnection behavior.

---

## 6. Socket Architecture

`socketClient.ts` is a **singleton wrapper** around `socket.io-client`:

```
socketClient
    → Single instance shared across the app
    → connect() — idempotent (skips if already connected)
    → on(event, handler) — registers and tracks event handlers
    → Reconnects on disconnect (Socket.IO built-in + configured attempts)
    → reRegisterEvents() — re-registers all handlers after reconnect
    → Prevents duplicate listeners by doing socket.off(event) before socket.on(event)
```

**Token refresh on reconnect:**
- `updateToken()` updates the auth object before reconnect
- If 401 received, `authStore.logout()` is triggered

**App lifecycle handling:**
- `useAppState` hook in ReelsScreen pauses video on background
- Socket reconnects automatically when app returns to foreground (Socket.IO handles this via OS network events)
- `disconnectSocket()` is called in `ChatListScreen` cleanup to avoid ghost connections

---

## 7. Chat Synchronization Strategy

**Three-source merge model:**

| Source | Data |
|---|---|
| REST API | Initial conversation list, message history, older messages |
| Socket | New messages, typing events, presence, read receipts |
| MMKV | Offline fallback for previously loaded conversations |

**Message lifecycle:**
1. User sends → optimistic message added (`status: 'sending'`)
2. API returns → replace optimistic with server message (`status: 'sent'`)
3. Socket emits `read_receipt` → update to `status: 'read'`
4. If API fails → `status: 'failed'`, retry button shown

**Deduplication:**
- New socket messages are checked against existing message IDs before adding
- Conversations fetched from API replace MMKV cache (not merged) to prevent stale data

---

## 8. Search Implementation and Debouncing

```
User types "r"   → query = "r"   → debouncedQuery (500ms not elapsed) = ""
User types "ro"  → query = "ro"  → debounce timer resets
User types "ros" → query = "ros" → debounce timer resets
500ms passes     → debouncedQuery = "ros" (>= 2 chars min)
                 → AbortController created, previous controller aborted
                 → searchUsers("ros", signal) called
Results returned → Zustand state updated → UI renders results
```

**Guards implemented:**
- `SEARCH_DEBOUNCE_MS = 500` — prevents per-keystroke requests
- `SEARCH_MIN_CHARS = 2` — prevents too-broad searches
- `AbortController.abort()` — cancels in-flight request when user types again
- `signal.aborted` check — prevents stale response from updating state
- `clearSearch()` on unmount — prevents memory leaks

---

## 9. Performance Optimizations

| Optimization | Implementation |
|---|---|
| Efficient list rendering | FlashList with `estimatedItemSize = SCREEN_HEIGHT`, `getItemType`, `removeClippedSubviews` |
| No multiple simultaneous video players | `ReelItem` renders `<Video>` only when `isActive` — others render `<View style={{backgroundColor: '#0D0D0D'}}/>` |
| Selector-based subscriptions | Every Zustand consumer uses a selector function — no full-store subscriptions |
| Memoized list items | `React.memo` on `ReelItem`, `ReelOverlay`, `ConversationItem`, `MessageBubble` |
| Debounced search | 500ms debounce + AbortController |
| Pagination guard | `isFetchingMore` boolean prevents simultaneous requests |
| MMKV synchronous I/O | No async hydration flicker |
| Socket listener deduplication | `socket.off(event)` before `socket.on(event)` in all registrations |
| Typing indicator timeout | `clearTimeout` + reset on each keystroke to prevent spam events |
| Video buffer config | Optimized `bufferConfig` (minBufferMs: 2500) for smooth playback |

---

## 10. How the App Handles Restart

```
App killed and reopened:

1. App.tsx useEffect runs:
   → hydrateSession() — reads user from MMKV synchronously
   → startMonitoring() — begins NetInfo subscription

2. AppNavigator renders:
   → If user found in MMKV → status = 'authenticated' → MainNavigator shown
   → If no user → status = 'unauthenticated' → AuthNavigator shown

3. ReelsScreen mounts:
   → hydrateFromCache() — reads cached reels from MMKV synchronously
   → Shows cached reels immediately (no blank screen)
   → If online: loadInitialReels() → fetches fresh reels

4. ChatListScreen mounts:
   → hydrateFromCache() — reads cached conversations
   → Shows stale conversations while fetching fresh data
```

---

## 11. What Would Change for a Large-Scale Production App

### Database: SQLite/WatermelonDB/Realm instead of MMKV for messages

**Why MMKV is not suitable for large message history:**
- MMKV stores everything as string key-value pairs — no indexing, no queries
- Loading 10,000 messages means deserializing the entire JSON blob
- No support for partial updates (must serialize entire array on every message)
- Memory pressure increases linearly with message count

**Recommendation: WatermelonDB**
- Built specifically for React Native, synchronous on JS thread
- Lazy loading — only loads records you query
- Indexed columns for fast `conversationId` lookups
- Designed for sync-heavy apps (offline-first with backend sync protocol)
- SQLite under the hood — battle-tested

**Realm** is also excellent but has a more complex licensing model (post-MongoDB acquisition).

**SQLite directly** (via `react-native-sqlite-storage` or `expo-sqlite`) is the most flexible but requires writing all query logic manually.

### Other production changes:
- **Token refresh flow**: Implement proper refresh-token rotation with Axios interceptor queue (prevent multiple simultaneous refresh calls)
- **Message queue**: Use a persistent queue (SQLite table) for offline-pending messages with background sync on reconnect
- **Push notifications**: FCM/APNs integration for background message delivery
- **CDN video delivery**: HLS streams from a CDN (e.g., Cloudflare Stream or AWS CloudFront) instead of public sample videos
- **Image caching**: `react-native-fast-image` with CDN URLs and cache-control headers
- **Error tracking**: Sentry integration in ErrorBoundary
- **Analytics**: Amplitude/Mixpanel event tracking on key actions
- **End-to-end encryption**: Signal Protocol for secure DMs
- **Pagination cursor validation**: Server-side cursor expiry handling
- **Background task**: `react-native-background-fetch` for periodic sync
- **Security**: Certificate pinning, jailbreak/root detection
