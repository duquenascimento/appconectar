import axios from 'axios';

import { PushRegisterPayload } from '../types/pushTypes';

const PUSH_NOTIFICATION_API_URL = process.env.EXPO_PUBLIC_PUSH_NOTIFICATION_API_URL;
const KEYCLOAK_URL = process.env.EXPO_PUBLIC_KEYCLOAK_URL;
const PUSH_KEYCLOAK_ID = process.env.EXPO_PUBLIC_PUSH_KEYCLOAK_ID;
const PUSH_KEYCLOAK_SECRET = process.env.EXPO_PUBLIC_PUSH_KEYCLOAK_SECRET;

async function getPushApiToken(): Promise<string> {
  const body = new URLSearchParams();
  body.append('grant_type', 'client_credentials');
  body.append('client_id', PUSH_KEYCLOAK_ID || '');
  body.append('client_secret', PUSH_KEYCLOAK_SECRET || '');

  const response = await axios.post(KEYCLOAK_URL || '', body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  return response.data.access_token;
}

export const registerPushSubscription = async (payload: PushRegisterPayload): Promise<void> => {
  try {
    const token = await getPushApiToken();

    await axios.post(`${PUSH_NOTIFICATION_API_URL}/push-subscriptions`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data?.error?.message || 'Não foi possível registrar o push no servidor.',
      );
    }
    throw error;
  }
};
