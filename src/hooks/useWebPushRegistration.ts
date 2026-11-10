import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Platform } from 'react-native';

import { registerPushSubscription } from '../services/pushNotificationService';
import { WebPushRegisterPayload, WebPushSubscriptionPayload } from '../types/pushTypes';
import { getCurrentDeviceId, getWebPushSyncState, markWebPushAsSynced } from '../utils/pushStorage';
import {
  getWebPushPublicKey,
  isLastSyncExpired,
  makePushRegistrationHash,
  normalizeChannelIds,
  PushChannelType,
  PushUserType,
  urlBase64ToUint8Array,
  WEB_PUSH_SERVICE_WORKER_PATH,
} from '../utils/pushRegistration';

interface UseWebPushRegistrationParams {
  enabled: boolean;
  userType: PushUserType;
  userId: string | null;
  channelType: PushChannelType;
  channelIds: string[];
}

function isWebPushSupported(): boolean {
  return (
    Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    window.isSecureContext &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

async function requestWebNotificationPermission(): Promise<boolean> {
  if (!isWebPushSupported()) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

async function getWebServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
  await navigator.serviceWorker.register(WEB_PUSH_SERVICE_WORKER_PATH);

  return navigator.serviceWorker.ready;
}

function normalizeWebPushSubscription(
  subscription: PushSubscription,
): WebPushSubscriptionPayload | null {
  const subscriptionJson = subscription.toJSON() as {
    endpoint?: string;
    expirationTime?: number | null;
    keys?: {
      p256dh?: string;
      auth?: string;
    };
  };

  if (
    !subscriptionJson.endpoint ||
    !subscriptionJson.keys?.p256dh ||
    !subscriptionJson.keys?.auth
  ) {
    return null;
  }

  return {
    endpoint: subscriptionJson.endpoint,
    expirationTime: subscriptionJson.expirationTime ?? null,
    keys: {
      p256dh: subscriptionJson.keys.p256dh,
      auth: subscriptionJson.keys.auth,
    },
  };
}

export function useWebPushRegistration({
  enabled,
  userType,
  userId,
  channelType,
  channelIds,
}: UseWebPushRegistrationParams): void {
  const isSyncingRef = useRef(false);

  const normalizedChannelIds = useMemo(() => normalizeChannelIds(channelIds), [channelIds]);

  const normalizedChannelIdsKey = JSON.stringify(normalizedChannelIds);

  const syncWebPush = useCallback(async (): Promise<void> => {
    if (
      !enabled ||
      !isWebPushSupported() ||
      !userId ||
      normalizedChannelIds.length === 0 ||
      isSyncingRef.current
    ) {
      return;
    }

    isSyncingRef.current = true;

    try {
      const hasPermission = await requestWebNotificationPermission();

      if (!hasPermission) {
        return;
      }

      const [deviceId, registration] = await Promise.all([
        getCurrentDeviceId(),
        getWebServiceWorkerRegistration(),
      ]);

      if (!deviceId) {
        return;
      }

      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(getWebPushPublicKey()),
        });
      }

      const webPushSubscription = normalizeWebPushSubscription(subscription);

      if (!webPushSubscription) {
        return;
      }

      const payload: WebPushRegisterPayload = {
        userType,
        userId,
        channelType,
        channelIds: normalizedChannelIds,
        platform: 'web',
        deviceId,
        pushProvider: 'web-push',
        webPushSubscription,
      };

      const lastSync = getWebPushSyncState();
      const registrationHash = makePushRegistrationHash({
        userType,
        userId,
        channelType,
        channelIds: normalizedChannelIds,
      });
      const serializedSubscription = JSON.stringify(webPushSubscription);

      const shouldSync =
        lastSync.serializedSubscription !== serializedSubscription ||
        lastSync.registrationHash !== registrationHash ||
        isLastSyncExpired(lastSync.lastSyncAt);

      if (!shouldSync) {
        return;
      }

      await registerPushSubscription(payload);
      markWebPushAsSynced(payload);
    } catch (error) {
      console.log('Erro ao sincronizar Web Push:', error);
    } finally {
      isSyncingRef.current = false;
    }
  }, [channelType, enabled, normalizedChannelIdsKey, userId, userType]);

  useEffect(() => {
    void syncWebPush();
  }, [syncWebPush]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }

    function handleOnline() {
      void syncWebPush();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        void syncWebPush();
      }
    }

    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [syncWebPush]);
}
