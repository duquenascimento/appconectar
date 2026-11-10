import { useEffect } from 'react';
import { Platform } from 'react-native';

interface UseActiveChannelResponderParams {
  activeChannelId: string | null;
}

export function useActiveChannelResponder({ activeChannelId }: UseActiveChannelResponderParams) {
  useEffect(() => {
    if (
      Platform.OS !== 'web' ||
      typeof navigator === 'undefined' ||
      !('serviceWorker' in navigator)
    ) {
      return;
    }

    function handleServiceWorkerMessage(event: MessageEvent) {
      if (event.data?.type !== 'GET_ACTIVE_CHANNEL') {
        return;
      }

      const responsePort = event.ports?.[0];

      if (!responsePort) {
        return;
      }

      responsePort.postMessage({
        channelId: activeChannelId,
      });
    }

    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, [activeChannelId]);
}
