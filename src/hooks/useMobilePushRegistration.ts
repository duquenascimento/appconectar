import { useCallback, useEffect, useMemo, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import { registerPushSubscription } from '../services/pushNotificationService';
import { ExpoPushRegisterPayload, NativePushPlatform } from '../types/pushTypes';
import {
  getCurrentDeviceId,
  getExpoPushSyncState,
  markExpoPushAsSynced,
} from '../utils/pushStorage';
import {
  ANDROID_PUSH_NOTIFICATION_CHANNEL_ID,
  getExpoProjectId,
  isLastSyncExpired,
  isNativePushPlatform,
  makePushRegistrationHash,
  normalizeChannelIds,
  PushChannelType,
  PushUserType,
} from '../utils/pushRegistration';

interface UseMobilePushRegistrationParams {
  enabled: boolean;
  userType: PushUserType;
  userId: string | null;
  channelType: PushChannelType;
  channelIds: string[];
}

async function configureAndroidNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(ANDROID_PUSH_NOTIFICATION_CHANNEL_ID, {
    name: 'Mensagens do chat',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    sound: 'default',
  });
}

function hasNativeNotificationPermission(
  permission: Notifications.NotificationPermissionsStatus,
): boolean {
  if (Platform.OS !== 'ios') {
    return permission.status === 'granted';
  }

  const iosStatus = permission.ios?.status;

  return (
    iosStatus === Notifications.IosAuthorizationStatus.AUTHORIZED ||
    iosStatus === Notifications.IosAuthorizationStatus.PROVISIONAL ||
    iosStatus === Notifications.IosAuthorizationStatus.EPHEMERAL
  );
}

async function requestNativeNotificationPermission(): Promise<boolean> {
  const currentPermission = await Notifications.getPermissionsAsync();

  if (hasNativeNotificationPermission(currentPermission)) {
    return true;
  }

  const requestedPermission = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });

  return hasNativeNotificationPermission(requestedPermission);
}

export function useMobilePushRegistration({
  enabled,
  userType,
  userId,
  channelType,
  channelIds,
}: UseMobilePushRegistrationParams): void {
  const isSyncingRef = useRef(false);

  const normalizedChannelIds = useMemo(() => normalizeChannelIds(channelIds), [channelIds]);

  const normalizedChannelIdsKey = JSON.stringify(normalizedChannelIds);

  const syncExpoPush = useCallback(
    async (force = false): Promise<void> => {
      if (
        !enabled ||
        !isNativePushPlatform() ||
        !userId ||
        normalizedChannelIds.length === 0 ||
        isSyncingRef.current
      ) {
        return;
      }

      isSyncingRef.current = true;

      try {
        await configureAndroidNotificationChannel();

        const hasPermission = await requestNativeNotificationPermission();

        if (!hasPermission) {
          console.log({
            code: 'PUSH_PERMISSION_DENIED',
            message: 'Permissão de push notification não concedida.',
          });
          return;
        }

        const [deviceId, expoPushTokenResponse] = await Promise.all([
          getCurrentDeviceId(),
          Notifications.getExpoPushTokenAsync({
            projectId: getExpoProjectId(),
          }),
        ]);

        if (!deviceId) {
          console.log({
            code: 'DEVICE_ID_NOT_FOUND',
            message: 'Não foi possível obter o deviceId.',
          });
          return;
        }

        const expoPushToken = expoPushTokenResponse.data;

        if (!expoPushToken) {
          console.log({
            code: 'EXPO_PUSH_TOKEN_NOT_FOUND',
            message: 'Não foi possível obter o ExpoPushToken.',
          });
          return;
        }

        const payload: ExpoPushRegisterPayload = {
          userType,
          userId,
          channelType,
          channelIds: normalizedChannelIds,
          platform: Platform.OS as NativePushPlatform,
          deviceId,
          pushProvider: 'expo',
          expoPushToken,
        };

        if (!force) {
          const lastSync = await getExpoPushSyncState();
          const registrationHash = makePushRegistrationHash({
            userType,
            userId,
            channelType,
            channelIds: normalizedChannelIds,
          });

          const shouldSync =
            lastSync.expoPushToken !== expoPushToken ||
            lastSync.registrationHash !== registrationHash ||
            isLastSyncExpired(lastSync.lastSyncAt);

          if (!shouldSync) {
            return;
          }
        }

        await registerPushSubscription(payload);
        await markExpoPushAsSynced(payload);

        console.log({
          code: 'EXPO_PUSH_REGISTERED',
          message: 'Expo Push Token registrado com sucesso.',
        });
      } catch (error) {
        console.log('Erro ao sincronizar Expo Push Token:', error);
      } finally {
        isSyncingRef.current = false;
      }
    },
    [channelType, enabled, normalizedChannelIdsKey, userId, userType],
  );

  useEffect(() => {
    void syncExpoPush();
  }, [syncExpoPush]);

  useEffect(() => {
    if (!isNativePushPlatform()) {
      return;
    }

    // Esse listener informa que o token nativo mudou.
    // Por isso buscamos novamente o ExpoPushToken em syncExpoPush().
    const subscription = Notifications.addPushTokenListener(() => {
      void syncExpoPush(true);
    });

    return () => {
      subscription.remove();
    };
  }, [syncExpoPush]);

  useEffect(() => {
    if (!isNativePushPlatform()) {
      return;
    }

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void syncExpoPush();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [syncExpoPush]);
}
