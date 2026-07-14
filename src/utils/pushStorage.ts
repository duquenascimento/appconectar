import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import getDeviceId from './getDeviceId';
import { ExpoPushRegisterPayload, WebPushRegisterPayload } from '../types/chatTypes';
import { makePushRegistrationHash } from './pushRegistration';

const PUSH_LAST_EXPO_TOKEN_STORAGE_KEY = 'chat.push.last-expo-token';
const PUSH_LAST_EXPO_SYNC_AT_STORAGE_KEY = 'chat.push.last-expo-sync-at';
const PUSH_LAST_EXPO_REGISTRATION_HASH_STORAGE_KEY = 'chat.push.last-expo-registration-hash';

const PUSH_LAST_WEB_SUBSCRIPTION_STORAGE_KEY = '@chat/push/last-web-subscription';
const PUSH_LAST_WEB_SYNC_AT_STORAGE_KEY = '@chat/push/last-web-sync-at';
const PUSH_LAST_WEB_REGISTRATION_HASH_STORAGE_KEY = '@chat/push/last-web-registration-hash';

const WEB_DEVICE_ID_STORAGE_KEY = '@chat/push/web-device-id';

export interface ExpoPushSyncState {
  expoPushToken: string | null;
  registrationHash: string | null;
  lastSyncAt: string | null;
}

export interface WebPushSyncState {
  serializedSubscription: string | null;
  registrationHash: string | null;
  lastSyncAt: string | null;
}

function getWebStorageItem(key: string): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setWebStorageItem(key: string, value: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.log('Erro ao salvar item no localStorage:', error);
  }
}

function removeWebStorageItem(key: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.log('Erro ao remover item do localStorage:', error);
  }
}

function createWebDeviceId(): string {
  const randomId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `WEB_${randomId}`;
}

export async function getCurrentDeviceId(): Promise<string | null> {
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

export async function getExpoPushSyncState(): Promise<ExpoPushSyncState> {
  const [expoPushToken, registrationHash, lastSyncAt] = await Promise.all([
    SecureStore.getItemAsync(PUSH_LAST_EXPO_TOKEN_STORAGE_KEY),
    SecureStore.getItemAsync(PUSH_LAST_EXPO_REGISTRATION_HASH_STORAGE_KEY),
    SecureStore.getItemAsync(PUSH_LAST_EXPO_SYNC_AT_STORAGE_KEY),
  ]);

  return {
    expoPushToken,
    registrationHash,
    lastSyncAt,
  };
}

export async function markExpoPushAsSynced(payload: ExpoPushRegisterPayload): Promise<void> {
  const registrationHash = makePushRegistrationHash({
    userType: payload.userType,
    userId: payload.userId,
    channelType: payload.channelType,
    channelIds: payload.channelIds,
  });

  await Promise.all([
    SecureStore.setItemAsync(PUSH_LAST_EXPO_TOKEN_STORAGE_KEY, payload.expoPushToken),
    SecureStore.setItemAsync(PUSH_LAST_EXPO_REGISTRATION_HASH_STORAGE_KEY, registrationHash),
    SecureStore.setItemAsync(PUSH_LAST_EXPO_SYNC_AT_STORAGE_KEY, new Date().toISOString()),
  ]);
}

export function getWebPushSyncState(): WebPushSyncState {
  return {
    serializedSubscription: getWebStorageItem(PUSH_LAST_WEB_SUBSCRIPTION_STORAGE_KEY),
    registrationHash: getWebStorageItem(PUSH_LAST_WEB_REGISTRATION_HASH_STORAGE_KEY),
    lastSyncAt: getWebStorageItem(PUSH_LAST_WEB_SYNC_AT_STORAGE_KEY),
  };
}

export function markWebPushAsSynced(payload: WebPushRegisterPayload): void {
  const registrationHash = makePushRegistrationHash({
    userType: payload.userType,
    userId: payload.userId,
    channelType: payload.channelType,
    channelIds: payload.channelIds,
  });

  setWebStorageItem(
    PUSH_LAST_WEB_SUBSCRIPTION_STORAGE_KEY,
    JSON.stringify(payload.webPushSubscription),
  );
  setWebStorageItem(PUSH_LAST_WEB_REGISTRATION_HASH_STORAGE_KEY, registrationHash);
  setWebStorageItem(PUSH_LAST_WEB_SYNC_AT_STORAGE_KEY, new Date().toISOString());
}

export async function clearPushRegistrationStorage(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(PUSH_LAST_EXPO_TOKEN_STORAGE_KEY),
    SecureStore.deleteItemAsync(PUSH_LAST_EXPO_REGISTRATION_HASH_STORAGE_KEY),
    SecureStore.deleteItemAsync(PUSH_LAST_EXPO_SYNC_AT_STORAGE_KEY),
  ]);

  removeWebStorageItem(PUSH_LAST_WEB_SUBSCRIPTION_STORAGE_KEY);
  removeWebStorageItem(PUSH_LAST_WEB_REGISTRATION_HASH_STORAGE_KEY);
  removeWebStorageItem(PUSH_LAST_WEB_SYNC_AT_STORAGE_KEY);
}
