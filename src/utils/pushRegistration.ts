import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { UserType } from '../types/pushTypes';

export const PUSH_SYNC_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;
export const WEB_PUSH_SERVICE_WORKER_PATH = '/service-worker.js';
export const ANDROID_PUSH_NOTIFICATION_CHANNEL_ID = 'chat-messages';

export type PushUserType = 'restaurant' | 'supplier';
export type PushChannelType = 'restaurant' | 'supplier';

export interface PushRegistrationIdentity {
  userType: UserType;
  userId: string;
  channelType: PushChannelType;
  channelIds: string[];
}

export function isNativePushPlatform(): boolean {
  return Platform.OS === 'android' || Platform.OS === 'ios';
}

export function normalizeChannelIds(channelIds: string[]): string[] {
  return Array.from(
    new Set(
      channelIds
        .filter((channelId) => typeof channelId === 'string')
        .map((channelId) => channelId.trim())
        .filter(Boolean),
    ),
  ).sort();
}

export function makePushRegistrationHash(identity: PushRegistrationIdentity): string {
  return JSON.stringify({
    userType: identity.userType,
    userId: identity.userId,
    channelType: identity.channelType,
    channelIds: normalizeChannelIds(identity.channelIds),
  });
}

export function isLastSyncExpired(lastSyncAt: string | null): boolean {
  if (!lastSyncAt) {
    return true;
  }

  const lastSyncTime = new Date(lastSyncAt).getTime();

  if (Number.isNaN(lastSyncTime)) {
    return true;
  }

  return Date.now() - lastSyncTime > PUSH_SYNC_INTERVAL_MS;
}

export function getExpoProjectId(): string {
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

  if (!projectId) {
    throw new Error('EAS projectId não encontrado na configuração do Expo.');
  }

  return projectId;
}

export function getWebPushPublicKey(): string {
  const publicKey = Constants.expoConfig?.extra?.webPush?.vapidPublicKey;

  if (!publicKey) {
    throw new Error(
      'VAPID public key não encontrada. Configure extra.webPush.vapidPublicKey no app.json/app.config.ts.',
    );
  }

  return publicKey;
}

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = `${base64String}${padding}`.replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}
