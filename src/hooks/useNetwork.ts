import { useEffect } from 'react';
import { useNetworkStore, selectIsOnline, selectNetworkStatus } from '@store/networkStore';

export function useNetwork() {
  const startMonitoring = useNetworkStore(s => s.startMonitoring);
  const isOnline = useNetworkStore(selectIsOnline);
  const status = useNetworkStore(selectNetworkStatus);

  useEffect(() => {
    const unsubscribe = startMonitoring();
    return unsubscribe;
  }, [startMonitoring]);

  return { isOnline, status };
}
