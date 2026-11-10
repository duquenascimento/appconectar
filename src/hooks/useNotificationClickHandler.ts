import { useEffect } from 'react';
import { Platform } from 'react-native';

import { PushNotificationData } from '../types/pushTypes';
import { parsePushNotificationData } from '../utils/pushNotificationData';

interface UseNotificationClickHandlerParams {
  onNotificationData: (data: PushNotificationData) => void | Promise<void>;
}

export function useNotificationClickHandler({
  onNotificationData,
}: UseNotificationClickHandlerParams) {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      return undefined;
    }

    if (typeof navigator === 'undefined') {
      return undefined;
    }

    if (!('serviceWorker' in navigator)) {
      return undefined;
    }

    function handleMessage(event: MessageEvent) {
      if (event.data?.type !== 'NOTIFICATION_CLICK') {
        return;
      }

      const notificationData = parsePushNotificationData(event.data?.payload);

      if (!notificationData) {
        return;
      }

      onNotificationData(notificationData);
    }

    navigator.serviceWorker.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [onNotificationData]);
}
