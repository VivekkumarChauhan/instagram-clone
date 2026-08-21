import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export function useAppState(
  onForeground?: () => void,
  onBackground?: () => void,
): void {
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const prev = appState.current;
      appState.current = nextState;

      if (prev !== 'active' && nextState === 'active') {
        onForeground?.();
      } else if (prev === 'active' && nextState !== 'active') {
        onBackground?.();
      }
    });

    return () => subscription.remove();
  }, [onForeground, onBackground]);
}
