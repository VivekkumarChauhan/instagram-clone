import {
  useReelsStore,
  selectReels,
  selectCurrentIndex,
  selectIsMuted,
  selectIsReelsLoading,
  selectReelsPagination,
  selectReelsError,
} from '@store/reelsStore';

export function useReels() {
  const reels = useReelsStore(selectReels);
  const currentIndex = useReelsStore(selectCurrentIndex);
  const isMuted = useReelsStore(selectIsMuted);
  const isLoading = useReelsStore(selectIsReelsLoading);
  const pagination = useReelsStore(selectReelsPagination);
  const error = useReelsStore(selectReelsError);
  const loadInitialReels = useReelsStore(s => s.loadInitialReels);
  const fetchMoreReels = useReelsStore(s => s.fetchMoreReels);
  const refreshReels = useReelsStore(s => s.refreshReels);
  const toggleLike = useReelsStore(s => s.toggleLike);
  const toggleFollow = useReelsStore(s => s.toggleFollow);
  const setCurrentIndex = useReelsStore(s => s.setCurrentIndex);
  const toggleMute = useReelsStore(s => s.toggleMute);
  const checkAndFetchMore = useReelsStore(s => s.checkAndFetchMore);

  return {
    reels,
    currentIndex,
    isMuted,
    isLoading,
    pagination,
    error,
    loadInitialReels,
    fetchMoreReels,
    refreshReels,
    toggleLike,
    toggleFollow,
    setCurrentIndex,
    toggleMute,
    checkAndFetchMore,
  };
}
