import { create } from 'zustand';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import type { NetworkStatus } from '@appTypes/common';

interface NetworkStore {
  status: NetworkStatus;
  isInternetReachable: boolean | null;
  startMonitoring: () => () => void;
}

export const useNetworkStore = create<NetworkStore>()((set) => ({
  status: 'unknown',
  isInternetReachable: null,

  startMonitoring: () => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const isConnected = state.isConnected ?? false;
      set({
        status: isConnected ? 'online' : 'offline',
        isInternetReachable: state.isInternetReachable,
      });
    });
    return unsubscribe;
  },
}));

export const selectNetworkStatus = (s: NetworkStore) => s.status;
export const selectIsOnline = (s: NetworkStore) => s.status === 'online';
