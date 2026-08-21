import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from '@navigation/AppNavigator';
import { ErrorBoundary } from '@components/common/ErrorBoundary';
import { useNetworkStore } from '@store/networkStore';
import { useAuthStore } from '@store/authStore';

const App: React.FC = () => {
  const startMonitoring = useNetworkStore(s => s.startMonitoring);
  const hydrateSession = useAuthStore(s => s.hydrateSession);

  useEffect(() => {
    hydrateSession();
    const stopMonitoring = startMonitoring();
    return stopMonitoring;
  }, [hydrateSession, startMonitoring]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <AppNavigator />
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
