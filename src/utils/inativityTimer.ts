import { useRef, useEffect, useCallback } from 'react';
import { AppState, Platform } from 'react-native';
import { useRouter } from 'expo-router';

interface UseInactivityOptions {
  timeout?: number;
  redirectPath?: string;
  enabled?: boolean;
}

export const useInactivityRedirect = (options: UseInactivityOptions = {}) => {
  const {
    timeout = 120000, // 2 minutos
    redirectPath = '/products',
    enabled = true,
  } = options;

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const appStateRef = useRef<string>(AppState.currentState);
  const router = useRouter();

  const resetTimer = useCallback(() => {
    if (!enabled) return;

    lastActivityRef.current = Date.now();

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      const currentTime = Date.now();
      const timeDiff = currentTime - lastActivityRef.current;

      if (timeDiff >= timeout && appStateRef.current === 'active') {
        console.log(
          `Usuário inativo por ${timeout / 1000} segundos. Redirecionando para ${redirectPath}...`,
        );
        router.push(redirectPath);
      }
    }, timeout);
  }, [timeout, redirectPath, enabled, router]);

  const handleAppStateChange = useCallback(
    (nextAppState: string) => {
      appStateRef.current = nextAppState;

      if (nextAppState === 'active') {
        resetTimer();
      }
    },
    [resetTimer],
  );

  useEffect(() => {
    if (!enabled) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'touchstart', 'scroll', 'click'];

    const handleActivity = () => {
      resetTimer();
    };

    events.forEach((event) => {
      if (typeof document !== 'undefined') {
        document.addEventListener(event, handleActivity, true);
      }
    });

    let subscription: any;
    if (Platform.OS !== 'web') {
      subscription = AppState.addEventListener('change', handleAppStateChange);
    }

    resetTimer();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      events.forEach((event) => {
        if (typeof document !== 'undefined') {
          document.removeEventListener(event, handleActivity, true);
        }
      });

      if (subscription) {
        subscription.remove();
      }
    };
  }, [resetTimer, handleAppStateChange, enabled]);

  return { resetTimer };
};
