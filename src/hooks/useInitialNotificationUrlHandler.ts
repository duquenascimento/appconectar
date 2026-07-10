import { useEffect } from 'react';
import { Platform } from 'react-native';

interface UseInitialNotificationUrlHandlerParams {
  onNotificationChannelId: (channelId: string) => void | Promise<void>;
}

export function useInitialNotificationUrlHandler({
  onNotificationChannelId,
}: UseInitialNotificationUrlHandlerParams) {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      return undefined;
    }

    if (typeof window === 'undefined') {
      return undefined;
    }

    const params = new URLSearchParams(window.location.search);
    const channelId = params.get('notificationChannelId');

    if (!channelId) {
      return undefined;
    }

    onNotificationChannelId(channelId);

    params.delete('notificationChannelId');

    const newSearch = params.toString();

    const newUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}`;

    window.history.replaceState({}, '', newUrl);

    return undefined;
  }, [onNotificationChannelId]);
}
