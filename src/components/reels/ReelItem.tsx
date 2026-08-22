import React, { memo, useCallback, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  PanResponder,
  Image,
  Platform,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Video, { OnLoadData, OnProgressData } from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import { ReelOverlay } from './ReelOverlay';
import { DoubleTapHeart } from '@components/common/DoubleTapHeart';
import { useReelsStore } from '@store/reelsStore';
import type { Reel } from '@appTypes/reels';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ReelItemProps {
  reel: Reel;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const ReelItem: React.FC<ReelItemProps> = memo(({
  reel,
  isActive,
  isMuted,
  onToggleMute,
}) => {
  const [isBuffering, setIsBuffering] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [is2xSpeed, setIs2xSpeed] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubPreviewTime, setScrubPreviewTime] = useState<number | null>(null);

  const videoRef = useRef<any>(null);
  const toggleLike = useReelsStore(s => s.toggleLike);
  const toggleFollow = useReelsStore(s => s.toggleFollow);

  const handleSingleTap = useCallback(() => {
    if (isActive) {
      setIsPaused(p => !p);
    }
  }, [isActive]);

  const handleDoubleTap = useCallback(() => {
    if (!reel.isLiked) {
      toggleLike(reel.id);
    }
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 900);
  }, [reel.isLiked, reel.id, toggleLike]);

  const handleHoldStart = useCallback((touchX: number) => {
    if (isActive && !isPaused) {
      const leftThird = SCREEN_WIDTH / 3;
      const rightThird = (SCREEN_WIDTH * 2) / 3;
      if (touchX <= leftThird || touchX >= rightThird) {
        setIs2xSpeed(true);
      }
    }
  }, [isActive, isPaused]);

  const handleHoldEnd = useCallback(() => {
    setIs2xSpeed(false);
  }, []);

  const durationRef = useRef(0);
  durationRef.current = duration;

  const handleLoad = useCallback((data: OnLoadData) => {
    setIsBuffering(false);
    setDuration(data.duration);
    durationRef.current = data.duration;
  }, []);

  const handleProgress = useCallback((data: OnProgressData) => {
    if (!isScrubbing && data.seekableDuration > 0) {
      setProgress(data.currentTime / data.seekableDuration);
    }
  }, [isScrubbing]);

  const handleBuffer = useCallback(({ isBuffering: buffering }: { isBuffering: boolean }) => {
    setIsBuffering(buffering);
  }, []);

  const handleSeekPercentage = (pct: number) => {
    const dur = durationRef.current;
    const clamped = Math.max(0, Math.min(1, pct));
    setProgress(clamped);
    if (videoRef.current && dur > 0) {
      const seekTime = clamped * dur;
      videoRef.current.seek(seekTime);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        setIsScrubbing(true);
        const touchX = evt.nativeEvent.pageX;
        const pct = Math.max(0, Math.min(1, touchX / SCREEN_WIDTH));
        const dur = durationRef.current;
        setProgress(pct);
        setScrubPreviewTime(pct * dur);
      },
      onPanResponderMove: (evt) => {
        const touchX = evt.nativeEvent.pageX;
        const pct = Math.max(0, Math.min(1, touchX / SCREEN_WIDTH));
        const dur = durationRef.current;
        setProgress(pct);
        setScrubPreviewTime(pct * dur);
      },
      onPanResponderRelease: (evt) => {
        const touchX = evt.nativeEvent.pageX;
        const pct = Math.max(0, Math.min(1, touchX / SCREEN_WIDTH));
        handleSeekPercentage(pct);
        setIsScrubbing(false);
        setScrubPreviewTime(null);
      },
    })
  ).current;

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(250)
    .runOnJS(true)
    .onEnd((_e, success) => {
      if (success) {
        handleDoubleTap();
      }
    });

  const singleTapGesture = Gesture.Tap()
    .numberOfTaps(1)
    .maxDuration(250)
    .runOnJS(true)
    .onEnd((_e, success) => {
      if (success) {
        handleSingleTap();
      }
    });

  const longPressGesture = Gesture.LongPress()
    .minDuration(250)
    .runOnJS(true)
    .onStart((e) => {
      handleHoldStart(e.x);
    })
    .onEnd(() => {
      handleHoldEnd();
    })
    .onFinalize(() => {
      handleHoldEnd();
    });

  const composedGestures = Gesture.Race(
    doubleTapGesture,
    Gesture.Exclusive(longPressGesture, singleTapGesture)
  );

  const handleLike = useCallback(() => toggleLike(reel.id), [toggleLike, reel.id]);
  const handleFollow = useCallback(() => toggleFollow(reel.author.id), [toggleFollow, reel.author.id]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const videoStyle = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: SCREEN_WIDTH,
    height: '100%' as const,
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: reel.thumbnailUrl || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400' }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      {isActive && !hasError ? (
        <Video
          ref={videoRef}
          source={{ uri: reel.videoUrl }}
          style={videoStyle}
          resizeMode="cover"
          repeat
          paused={!isActive || isPaused}
          muted={isMuted}
          rate={is2xSpeed ? 2.0 : 1.0}
          onLoad={(d) => {
            handleLoad(d);
            setIsBuffering(false);
          }}
          onReadyForDisplay={() => setIsBuffering(false)}
          onProgress={handleProgress}
          onBuffer={handleBuffer}
          onError={(e) => {
            console.warn('[Video Error]', reel.videoUrl, e);
            setHasError(true);
            setIsBuffering(false);
          }}
          ignoreSilentSwitch="ignore"
          playInBackground={false}
          playWhenInactive={false}
          progressUpdateInterval={250}
          useTextureView={Platform.OS === 'android'}
          disableFocus={true}
        />
      ) : (
        <View style={styles.videoPlaceholder}>
          {hasError && (
            <TouchableOpacity
              style={styles.errorInfo}
              onPress={() => {
                setHasError(false);
                setIsBuffering(true);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.errorText}>⚠️ Failed to load. Tap to retry</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {isBuffering && isActive && !hasError && (
        <View style={styles.bufferingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}

      {is2xSpeed && isActive && (
        <View style={styles.speedPill} pointerEvents="none">
          <Icon name="flash" size={16} color="#FEE440" />
          <Text style={styles.speedPillText}>2X Speed</Text>
        </View>
      )}

      {isScrubbing && scrubPreviewTime !== null && (
        <View style={styles.scrubPill} pointerEvents="none">
          <Text style={styles.scrubPillText}>{formatTime(scrubPreviewTime)} / {formatTime(duration)}</Text>
        </View>
      )}

      <DoubleTapHeart visible={showHeartAnim} />

      <GestureDetector gesture={composedGestures}>
        <View style={styles.gestureCatchLayer} />
      </GestureDetector>

      {isPaused && isActive && (
        <View style={styles.pausedControlsContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSingleTap}
            style={styles.centerPlayBtn}
          >
            <Icon name="play" size={42} color="#FFFFFF" style={{ marginLeft: 4 }} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onToggleMute}
            style={styles.pausedMuteBtn}
          >
            <Icon
              name={isMuted ? 'volume-mute' : 'volume-high'}
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      )}

      <ReelOverlay
        reel={reel}
        onLike={handleLike}
        onComment={() => {}}
        onShare={() => {}}
        onFollow={handleFollow}
        onMuteToggle={onToggleMute}
        isMuted={isMuted}
      />

      {isActive && (
        <View style={styles.progressContainer} {...panResponder.panHandlers}>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(progress * 100, 100)}%` },
                isScrubbing && styles.progressBarFillActive,
              ]}
            />
            {isScrubbing && (
              <View
                style={[
                  styles.scrubberThumb,
                  { left: `${Math.min(progress * 100, 98)}%` },
                ]}
              />
            )}
          </View>
        </View>
      )}
    </View>
  );
});

ReelItem.displayName = 'ReelItem';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    position: 'relative',
    overflow: 'hidden',
  },
  gestureCatchLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 5,
  },
  videoPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0D0D0D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorInfo: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  bufferingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 10,
  },
  speedPill: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    gap: 6,
    zIndex: 20,
  },
  speedPillText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  scrubPill: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    zIndex: 20,
  },
  scrubPillText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  pausedControlsContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 15,
  },
  centerPlayBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  pausedMuteBtn: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 36,
    justifyContent: 'flex-end',
    zIndex: 50,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  progressBarFillActive: {
    backgroundColor: '#FFFFFF',
    height: 6,
  },
  scrubberThumb: {
    position: 'absolute',
    top: -4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
});
