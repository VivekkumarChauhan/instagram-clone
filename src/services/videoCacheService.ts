import RNFS from 'react-native-fs';
import { getItem, setItem } from '@utils/mmkvStorage';

const VIDEO_CACHE_MAP_KEY = 'video_cache_map';
const REELS_CACHE_DIR = `${RNFS.CachesDirectoryPath}/reels`;
const MAX_CACHED_VIDEOS = 15;

export interface CachedVideoMeta {
  localPath: string;
  cachedAt: number;
  size?: number;
}

export type VideoCacheMap = Record<string, CachedVideoMeta>;

class VideoCacheService {
  private inProgressDownloads: Map<string, Promise<string>> = new Map();
  private dirInitialized = false;

  private async ensureCacheDir(): Promise<void> {
    if (this.dirInitialized) return;
    try {
      const exists = await RNFS.exists(REELS_CACHE_DIR);
      if (!exists) {
        await RNFS.mkdir(REELS_CACHE_DIR);
      }
      this.dirInitialized = true;
    } catch (e) {
      console.warn('[VideoCacheService] Failed to create cache directory:', e);
    }
  }

  public getCacheMap(): VideoCacheMap {
    try {
      return getItem<VideoCacheMap>(VIDEO_CACHE_MAP_KEY) || {};
    } catch {
      return {};
    }
  }

  private saveCacheMap(map: VideoCacheMap): void {
    try {
      setItem(VIDEO_CACHE_MAP_KEY, map);
    } catch (e) {
      console.warn('[VideoCacheService] Failed to save video cache map:', e);
    }
  }

  /**
   * Synchronous check against MMKV map to get cached local file path
   */
  public getCachedVideoPath(reelId: string): string | null {
    const map = this.getCacheMap();
    const entry = map[reelId];
    if (entry && entry.localPath) {
      return entry.localPath;
    }
    return null;
  }

  /**
   * Checks if video file is already cached in MMKV
   */
  public isVideoCached(reelId: string): boolean {
    return Boolean(this.getCachedVideoPath(reelId));
  }

  /**
   * Downloads a video file in background and stores it on disk, updating MMKV
   */
  public async downloadAndCacheVideo(reelId: string, remoteUrl: string): Promise<string> {
    if (!remoteUrl || !remoteUrl.startsWith('http')) {
      return remoteUrl;
    }

    // Return if already cached
    const existing = this.getCachedVideoPath(reelId);
    if (existing) {
      try {
        const fileExists = await RNFS.exists(existing.replace('file://', ''));
        if (fileExists) {
          return existing;
        }
      } catch {
        // file check failed, re-download
      }
    }

    // Deduplicate in-flight downloads for the same reel
    if (this.inProgressDownloads.has(reelId)) {
      return this.inProgressDownloads.get(reelId)!;
    }

    const downloadPromise = (async () => {
      try {
        await this.ensureCacheDir();
        const safeReelId = reelId.replace(/[^a-zA-Z0-9_-]/g, '_');
        const localFilePath = `${REELS_CACHE_DIR}/${safeReelId}.mp4`;
        const localFileUri = `file://${localFilePath}`;

        const downloadResult = await RNFS.downloadFile({
          fromUrl: remoteUrl,
          toFile: localFilePath,
          background: true,
          discretionary: true,
          connectionTimeout: 15000,
          readTimeout: 30000,
        }).promise;

        if (downloadResult.statusCode === 200 || downloadResult.statusCode === 0) {
          const map = this.getCacheMap();
          map[reelId] = {
            localPath: localFileUri,
            cachedAt: Date.now(),
            size: downloadResult.bytesWritten,
          };
          this.saveCacheMap(map);

          // Evict oldest if exceeding limit
          this.evictOldestCachedVideos(MAX_CACHED_VIDEOS).catch(() => {});

          return localFileUri;
        }
        return remoteUrl;
      } catch (err) {
        console.warn(`[VideoCacheService] Download failed for reel ${reelId}:`, err);
        return remoteUrl;
      } finally {
        this.inProgressDownloads.delete(reelId);
      }
    })();

    this.inProgressDownloads.set(reelId, downloadPromise);
    return downloadPromise;
  }

  /**
   * Evicts oldest cached videos to prevent unbounded disk usage
   */
  public async evictOldestCachedVideos(maxCount: number = MAX_CACHED_VIDEOS): Promise<void> {
    const map = this.getCacheMap();
    const entries = Object.entries(map);

    if (entries.length <= maxCount) return;

    // Sort ascending by cachedAt (oldest first)
    entries.sort((a, b) => a[1].cachedAt - b[1].cachedAt);
    const toRemove = entries.slice(0, entries.length - maxCount);

    for (const [id, meta] of toRemove) {
      try {
        const path = meta.localPath.replace('file://', '');
        const exists = await RNFS.exists(path);
        if (exists) {
          await RNFS.unlink(path);
        }
      } catch (e) {
        console.warn(`[VideoCacheService] Failed to delete file for ${id}:`, e);
      }
      delete map[id];
    }

    this.saveCacheMap(map);
  }

  /**
   * Clears all cached reel videos from disk and MMKV
   */
  public async clearVideoCache(): Promise<void> {
    try {
      const exists = await RNFS.exists(REELS_CACHE_DIR);
      if (exists) {
        await RNFS.unlink(REELS_CACHE_DIR);
      }
      this.saveCacheMap({});
      this.dirInitialized = false;
    } catch (e) {
      console.warn('[VideoCacheService] Failed to clear video cache:', e);
    }
  }
}

export const videoCacheService = new VideoCacheService();
