import axios from 'axios';

import { PushRegisterPayload } from '../types/pushTypes';

const PUSH_NOTIFICATION_API_URL = process.env.EXPO_PUBLIC_PUSH_NOTIFICATION_API_URL;

export const registerPushSubscription = async (payload: PushRegisterPayload): Promise<void> => {
  try {
    await axios.post(`${PUSH_NOTIFICATION_API_URL}/push-subscriptions`, payload);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data?.error?.message || 'Não foi possível registrar o push no servidor.',
      );
    }
    throw error;
  }
};
