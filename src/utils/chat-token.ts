// src/services/chat-token.ts

import Cookies from 'js-cookie';
import { deleteItemAsync, getItemAsync, setItemAsync } from 'expo-secure-store';
import { Platform } from 'react-native';

const isWebPlatform = Platform.OS === 'web';

const CHAT_SECURE_STORE_KEYS = {
  CHAT_TOKEN: 'chatToken',
};

export const getChatToken = async (): Promise<string | null> => {
  if (isWebPlatform) {
    return Cookies.get(CHAT_SECURE_STORE_KEYS.CHAT_TOKEN) ?? null;
  }

  return getItemAsync(CHAT_SECURE_STORE_KEYS.CHAT_TOKEN);
};

export const setChatToken = async (token: string): Promise<void> => {
  if (isWebPlatform) {
    Cookies.set(CHAT_SECURE_STORE_KEYS.CHAT_TOKEN, token);
    return;
  }

  await setItemAsync(CHAT_SECURE_STORE_KEYS.CHAT_TOKEN, token);
};

export const deleteChatToken = async (): Promise<void> => {
  if (isWebPlatform) {
    Cookies.remove(CHAT_SECURE_STORE_KEYS.CHAT_TOKEN);
    return;
  }

  await deleteItemAsync(CHAT_SECURE_STORE_KEYS.CHAT_TOKEN);
};
