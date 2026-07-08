import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

import { chatSocket } from '../services/chatSocketService';
import { getChatToken, setChatToken } from '../utils/chat-token';
import { getClientCredentialsToken } from '../utils/getClientCredentialsToken';
import getDeviceId from '../utils/getDeviceId';
import {
  ChatSocketConnectError,
  ExpoPushRegisterPayload,
  NativePushPlatform,
  PushRegisterPayload,
  PushRegisterResponse,
  WebPushRegisterPayload,
  WebPushSubscriptionPayload,
} from '../types/chatTypes';
import { useAuthContext } from '../contexts/auth.context';

const PUSH_LAST_EXPO_TOKEN_STORAGE_KEY = '@chat/push/last-expo-token';
const PUSH_LAST_EXPO_SYNC_AT_STORAGE_KEY = '@chat/push/last-expo-sync-at';
const PUSH_LAST_EXPO_REGISTRATION_HASH_STORAGE_KEY = '@chat/push/last-expo-registration-hash';

const PUSH_LAST_WEB_SUBSCRIPTION_STORAGE_KEY = '@chat/push/last-web-subscription';
const PUSH_LAST_WEB_SYNC_AT_STORAGE_KEY = '@chat/push/last-web-sync-at';
const PUSH_LAST_WEB_REGISTRATION_HASH_STORAGE_KEY = '@chat/push/last-web-registration-hash';

const WEB_DEVICE_ID_STORAGE_KEY = '@chat/push/web-device-id';

const PUSH_SYNC_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;
const WEB_PUSH_SERVICE_WORKER_PATH = '/service-worker.js';

function isNativePushPlatform(): boolean {
  return Platform.OS === 'android' || Platform.OS === 'ios';
}

function isLastSyncExpired(lastSyncAt: string | null) {
  if (!lastSyncAt) {
    return true;
  }

  const lastSyncTime = new Date(lastSyncAt).getTime();

  if (Number.isNaN(lastSyncTime)) {
    return true;
  }

  return Date.now() - lastSyncTime > PUSH_SYNC_INTERVAL_MS;
}

function normalizeChannelIds(channelIds: string[]) {
  return Array.from(
    new Set(
      channelIds
        .filter((channelId) => typeof channelId === 'string')
        .map((channelId) => channelId.trim())
        .filter(Boolean),
    ),
  ).sort();
}

function makePushRegistrationHash(params: {
  app: string;
  userId: string;
  channelType: string;
  channelIds: string[];
}) {
  return JSON.stringify({
    app: params.app,
    userId: params.userId,
    channelType: params.channelType,
    channelIds: normalizeChannelIds(params.channelIds),
  });
}

function getRestaurantChannelIds(tokenPayload: { restaurant?: unknown }): string[] | null {
  if (!Array.isArray(tokenPayload.restaurant)) {
    console.log({
      code: 'INVALID_PUSH_CHANNELS',
      message: 'Lista de restaurantes inválida ou não encontrada para registrar push.',
    });

    return null;
  }

  const channelIds = normalizeChannelIds(tokenPayload.restaurant);

  if (channelIds.length === 0) {
    console.log({
      code: 'NO_PUSH_CHANNELS_FOUND',
      message: 'Nenhum restaurante encontrado para registrar push.',
    });

    return null;
  }

  return channelIds;
}

function getExpoProjectId() {
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

  if (!projectId) {
    throw new Error('EAS projectId não encontrado na configuração do Expo.');
  }

  return projectId;
}

function getWebPushPublicKey() {
  console.log('Constants.expoConfig?.extra:', Constants.expoConfig?.extra);
  console.log('Constants.easConfig:', Constants.easConfig);

  const publicKey = Constants.expoConfig?.extra?.webPush?.vapidPublicKey;

  if (!publicKey) {
    throw new Error(
      'VAPID public key não encontrada. Configure extra.webPush.vapidPublicKey no app.json/app.config.ts.',
    );
  }

  return publicKey;
}

async function configureAndroidNotificationChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync('chat-messages', {
    name: 'Mensagens do chat',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    sound: 'default',
  });
}

async function requestExpoNotificationPermission() {
  const currentPermission = await Notifications.getPermissionsAsync();

  if (currentPermission.status === 'granted') {
    return true;
  }

  const requestedPermission = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });

  return requestedPermission.status === 'granted';
}

function isWebPushSupported() {
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

async function requestWebNotificationPermission() {
  if (!isWebPushSupported()) {
    console.log({
      code: 'WEB_PUSH_NOT_SUPPORTED',
      message:
        'Push notification web não é suportado neste navegador ou o app não está em HTTPS/localhost.',
    });

    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.log({
      code: 'WEB_PUSH_PERMISSION_DENIED',
      message: 'Permissão de push notification web já foi negada.',
    });

    return false;
  }

  const permission = await Notification.requestPermission();

  return permission === 'granted';
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);

  const base64 = `${base64String}${padding}`.replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}

function getWebStorageItem(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setWebStorageItem(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch (err) {
    console.log('Erro ao salvar item no localStorage:', err);
  }
}

function createWebDeviceId() {
  const randomId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `WEB_${randomId}`;
}

async function getCurrentDeviceId() {
  if (Platform.OS !== 'web') {
    return getDeviceId();
  }

  const existingDeviceId = getWebStorageItem(WEB_DEVICE_ID_STORAGE_KEY);

  if (existingDeviceId) {
    return existingDeviceId;
  }

  const newDeviceId = createWebDeviceId();

  setWebStorageItem(WEB_DEVICE_ID_STORAGE_KEY, newDeviceId);

  return newDeviceId;
}

async function getWebServiceWorkerRegistration() {
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

async function getWebPushSubscriptionPayloadIfNeeded(
  app: 'restaurant' | 'supplier',
  userId: string,
  channelIds: string[],
): Promise<WebPushRegisterPayload | null> {
  if (!isWebPushSupported()) {
    return null;
  }

  const hasPermission = await requestWebNotificationPermission();

  if (!hasPermission) {
    console.log({
      code: 'WEB_PUSH_PERMISSION_NOT_GRANTED',
      message: 'Permissão de push notification web não concedida.',
    });

    return null;
  }

  const deviceId = await getCurrentDeviceId();

  if (!deviceId) {
    console.log({
      code: 'DEVICE_ID_NOT_FOUND',
      message: 'Não foi possível obter o deviceId.',
    });

    return null;
  }

  const vapidPublicKey = getWebPushPublicKey();
  const registration = await getWebServiceWorkerRegistration();

  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
  }

  const webPushSubscription = normalizeWebPushSubscription(subscription);

  if (!webPushSubscription) {
    console.log({
      code: 'WEB_PUSH_SUBSCRIPTION_INVALID',
      message: 'PushSubscription web inválida.',
    });

    return null;
  }

  const serializedSubscription = JSON.stringify(webPushSubscription);

  const currentRegistrationHash = makePushRegistrationHash({
    app,
    userId,
    channelType: 'restaurant',
    channelIds,
  });

  const lastWebSubscription = getWebStorageItem(PUSH_LAST_WEB_SUBSCRIPTION_STORAGE_KEY);

  const lastRegistrationHash = getWebStorageItem(PUSH_LAST_WEB_REGISTRATION_HASH_STORAGE_KEY);

  const lastSyncAt = getWebStorageItem(PUSH_LAST_WEB_SYNC_AT_STORAGE_KEY);

  const shouldSync =
    lastWebSubscription !== serializedSubscription ||
    lastRegistrationHash !== currentRegistrationHash ||
    isLastSyncExpired(lastSyncAt);

  if (!shouldSync) {
    return null;
  }

  return {
    userType: app,
    userId,
    channelType: 'restaurant',
    channelIds,
    platform: 'web',
    deviceId,
    pushProvider: 'web-push',
    webPushSubscription,
  };
}

async function getExpoPushTokenPayloadIfNeeded(
  app: 'restaurant' | 'supplier',
  userId: string,
  channelIds: string[],
): Promise<ExpoPushRegisterPayload | null> {
  if (!isNativePushPlatform()) {
    return null;
  }

  await configureAndroidNotificationChannel();

  const hasPermission = await requestExpoNotificationPermission();

  if (!hasPermission) {
    console.log({
      code: 'PUSH_PERMISSION_DENIED',
      message: 'Permissão de push notification não concedida.',
    });

    return null;
  }

  const deviceId = await getCurrentDeviceId();

  if (!deviceId) {
    console.log({
      code: 'DEVICE_ID_NOT_FOUND',
      message: 'Não foi possível obter o deviceId.',
    });

    return null;
  }

  const projectId = getExpoProjectId();

  const expoPushTokenResponse = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  const expoPushToken = expoPushTokenResponse.data;

  if (!expoPushToken) {
    console.log({
      code: 'EXPO_PUSH_TOKEN_NOT_FOUND',
      message: 'Não foi possível obter o ExpoPushToken.',
    });

    return null;
  }

  const currentRegistrationHash = makePushRegistrationHash({
    app,
    userId,
    channelType: 'restaurant',
    channelIds,
  });

  const [lastExpoPushToken, lastRegistrationHash, lastSyncAt] = await Promise.all([
    SecureStore.getItemAsync(PUSH_LAST_EXPO_TOKEN_STORAGE_KEY),
    SecureStore.getItemAsync(PUSH_LAST_EXPO_REGISTRATION_HASH_STORAGE_KEY),
    SecureStore.getItemAsync(PUSH_LAST_EXPO_SYNC_AT_STORAGE_KEY),
  ]);

  const shouldSync =
    lastExpoPushToken !== expoPushToken ||
    lastRegistrationHash !== currentRegistrationHash ||
    isLastSyncExpired(lastSyncAt);

  if (!shouldSync) {
    return null;
  }

  return {
    userType: app,
    userId,
    channelType: 'restaurant',
    channelIds,
    platform: Platform.OS as NativePushPlatform,
    deviceId,
    pushProvider: 'expo',
    expoPushToken,
  };
}

async function getPushPayloadIfNeeded(
  app: 'restaurant' | 'supplier',
  userId: string,
  channelIds: string[],
): Promise<PushRegisterPayload | null> {
  if (Platform.OS === 'web') {
    return getWebPushSubscriptionPayloadIfNeeded(app, userId, channelIds);
  }

  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    return getExpoPushTokenPayloadIfNeeded(app, userId, channelIds);
  }

  return null;
}

async function markPushPayloadAsSynced(payload: PushRegisterPayload) {
  const registrationHash = makePushRegistrationHash({
    app: payload.userType,
    userId: payload.userId,
    channelType: payload.channelType,
    channelIds: payload.channelIds,
  });

  if (payload.pushProvider === 'expo') {
    await SecureStore.setItemAsync(PUSH_LAST_EXPO_TOKEN_STORAGE_KEY, payload.expoPushToken);

    await SecureStore.setItemAsync(PUSH_LAST_EXPO_REGISTRATION_HASH_STORAGE_KEY, registrationHash);

    await SecureStore.setItemAsync(PUSH_LAST_EXPO_SYNC_AT_STORAGE_KEY, new Date().toISOString());

    return;
  }

  setWebStorageItem(
    PUSH_LAST_WEB_SUBSCRIPTION_STORAGE_KEY,
    JSON.stringify(payload.webPushSubscription),
  );

  setWebStorageItem(PUSH_LAST_WEB_REGISTRATION_HASH_STORAGE_KEY, registrationHash);

  setWebStorageItem(PUSH_LAST_WEB_SYNC_AT_STORAGE_KEY, new Date().toISOString());
}

function registerPushWithSocket(payload: PushRegisterPayload) {
  chatSocket.emit('push_register', payload, async (response?: PushRegisterResponse) => {
    if (!response?.ok) {
      console.log({
        code: response?.error ?? 'PUSH_REGISTER_FAILED',
        message: 'Não foi possível registrar o push token/subscription no servidor.',
      });

      return;
    }

    await markPushPayloadAsSynced(payload);

    console.log({
      code: 'PUSH_REGISTERED',
      message: 'Push registrado com sucesso.',
      pushProvider: payload.pushProvider,
    });
  });
}

export function useChatConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(true);
  const { getTokenPayload } = useAuthContext();
  const hasRetriedTokenRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    async function syncPushIfNeeded() {
      try {
        if (!chatSocket.connected) {
          return;
        }

        const tokenPayload = await getTokenPayload();

        if (!tokenPayload) {
          console.log({
            code: 'TOKEN_PAYLOAD_NOT_FOUND',
            message: 'Token não encontrado.',
          });

          return;
        }

        const channelIds = getRestaurantChannelIds(tokenPayload);

        if (!channelIds) {
          return;
        }

        const payload = await getPushPayloadIfNeeded('restaurant', tokenPayload.id, channelIds);

        if (!payload) {
          return;
        }

        registerPushWithSocket(payload);
      } catch (err) {
        console.log('Erro ao sincronizar push:', err);
      }
    }

    async function connectSocket() {
      try {
        setIsLoadingChat(true);

        let currentToken = await getChatToken();

        if (!currentToken) {
          const keyCloakToken = await getClientCredentialsToken();
          currentToken = keyCloakToken.access_token as string;

          await setChatToken(currentToken);
        }

        if (!currentToken) {
          console.log({
            code: 'CHAT_TOKEN_NOT_FOUND',
            message: 'Token do chat não encontrado.',
          });

          if (isMounted) {
            setIsLoadingChat(false);
          }

          return;
        }

        chatSocket.auth = {
          token: currentToken,
        };

        if (!chatSocket.connected) {
          chatSocket.connect();
        }
      } catch (err) {
        console.log('Erro ao preparar conexão com o chat:', err);

        if (isMounted) {
          setIsLoadingChat(false);
        }
      }
    }

    function handleConnect() {
      hasRetriedTokenRef.current = false;

      if (isMounted) {
        setIsConnected(true);
        setIsLoadingChat(false);
      }

      console.log('Conexão estabelecida com o servidor:', chatSocket.id);

      syncPushIfNeeded();
    }

    function handleDisconnect() {
      if (isMounted) {
        setIsConnected(false);
      }

      console.log('Chat socket desconectado');
    }

    async function handleConnectError(err: ChatSocketConnectError) {
      const code = err.data?.code;
      const message = err.data?.message ?? err.message;

      if (isMounted) {
        setIsConnected(false);
      }

      if (code === 'TOKEN_EXPIRED') {
        if (hasRetriedTokenRef.current) {
          console.log({
            code: 'TOKEN_REFRESH_ALREADY_RETRIED',
            message: 'O token expirou, uma nova tentativa já foi feita e falhou.',
          });

          if (isMounted) {
            setIsLoadingChat(false);
          }

          return;
        }

        hasRetriedTokenRef.current = true;

        try {
          console.log('Token do chat expirado. Gerando novo token...');

          if (isMounted) {
            setIsLoadingChat(true);
          }

          const keyCloakToken = await getClientCredentialsToken();
          const newToken = keyCloakToken.access_token;

          if (!newToken) {
            console.log({
              code: 'CHAT_TOKEN_REFRESH_FAILED',
              message: 'Não foi possível obter um novo token do chat.',
            });

            if (isMounted) {
              setIsLoadingChat(false);
            }

            return;
          }

          await setChatToken(newToken);

          chatSocket.auth = {
            token: newToken,
          };

          chatSocket.connect();
        } catch (refreshError) {
          console.log('Erro ao gerar novo token do chat:', refreshError);

          if (isMounted) {
            setIsLoadingChat(false);
          }
        }

        return;
      }

      console.log('Erro ao conectar no chat socket:', {
        code: code ?? 'CONNECT_ERROR',
        message,
      });

      if (isMounted) {
        setIsLoadingChat(false);
      }
    }

    let pushTokenSubscription: { remove: () => void } | null = null;

    if (isNativePushPlatform()) {
      pushTokenSubscription = Notifications.addPushTokenListener(async (token) => {
        const tokenPayload = await getTokenPayload();

        if (!tokenPayload) {
          console.log({
            code: 'TOKEN_PAYLOAD_NOT_FOUND',
            message: 'Token não encontrado.',
          });

          return;
        }

        try {
          if (!chatSocket.connected) {
            return;
          }

          const channelIds = getRestaurantChannelIds(tokenPayload);

          if (!channelIds) {
            return;
          }

          const deviceId = await getCurrentDeviceId();

          if (!deviceId) {
            return;
          }

          const payload: ExpoPushRegisterPayload = {
            userType: 'restaurant',
            userId: tokenPayload.id,
            channelType: 'restaurant',
            channelIds,
            platform: Platform.OS as NativePushPlatform,
            deviceId,
            pushProvider: 'expo',
            expoPushToken: token.data,
          };

          registerPushWithSocket(payload);
        } catch (err) {
          console.log('Erro ao atualizar ExpoPushToken:', err);
        }
      });
    }

    chatSocket.on('connect', handleConnect);
    chatSocket.on('disconnect', handleDisconnect);
    chatSocket.on('connect_error', handleConnectError);

    connectSocket();

    return () => {
      isMounted = false;

      chatSocket.off('connect', handleConnect);
      chatSocket.off('disconnect', handleDisconnect);
      chatSocket.off('connect_error', handleConnectError);

      pushTokenSubscription?.remove();

      chatSocket.disconnect();
    };
  }, []);

  return { isConnected, isLoadingChat };
}
