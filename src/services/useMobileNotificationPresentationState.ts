import { useEffect } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';

import {
  setActiveNotificationChannelId,
  setNotificationAppActive,
  setNotificationAppFocused,
} from './notificationPresentationState';

interface UseMobileNotificationPresentationStateParams {
  activeChannelId: string | null;
}

function isNativePlatform() {
  return Platform.OS === 'android' || Platform.OS === 'ios';
}

export function useMobileNotificationPresentationState({
  activeChannelId,
}: UseMobileNotificationPresentationStateParams) {
  useEffect(() => {
    if (!isNativePlatform()) {
      return;
    }

    function handleAppStateChange(nextAppState: AppStateStatus) {
      setNotificationAppActive(nextAppState === 'active');
    }

    setNotificationAppActive(AppState.currentState === 'active');

    setNotificationAppFocused(true);

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    const focusSubscription =
      Platform.OS === 'android'
        ? AppState.addEventListener('focus', () => {
            setNotificationAppFocused(true);
          })
        : null;

    const blurSubscription =
      Platform.OS === 'android'
        ? AppState.addEventListener('blur', () => {
            setNotificationAppFocused(false);
          })
        : null;

    return () => {
      appStateSubscription.remove();
      focusSubscription?.remove();
      blurSubscription?.remove();

      setNotificationAppActive(false);
      setNotificationAppFocused(false);
    };
  }, []);

  useEffect(() => {
    if (!isNativePlatform()) {
      return;
    }

    setActiveNotificationChannelId(activeChannelId);

    return () => {
      setActiveNotificationChannelId(null);
    };
  }, [activeChannelId]);
}
