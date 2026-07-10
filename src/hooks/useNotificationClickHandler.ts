import { useEffect } from 'react';
import { Platform } from 'react-native';

interface UseNotificationClickHandlerParams {
  onNotificationChannelId: (channelId: string) => void | Promise<void>;
}

export function useNotificationClickHandler({
  onNotificationChannelId,
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
      const { data } = event;

      const channelId = data?.payload?.channelId || data?.channelId || data?.data?.channelId;

      if (!channelId) {
        return;
      }

      onNotificationChannelId(channelId);
    }

    navigator.serviceWorker.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [onNotificationChannelId]);
}
