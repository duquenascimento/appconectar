import axios from 'axios';

import {
  GetUserNotificationSettingsResponseDTO,
  UpdateUserNotificationSettingsResponseDTO,
  UserNotificationSettings,
} from '../types/userNotificationSettingsTypes';
import { getToken } from '../utils/utils';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const getUserNotificationSettings = async (): Promise<UserNotificationSettings> => {
  try {
    const response = await axios.get(`${API_URL}/user/notification-settings`, {
      headers: { Authorization: `Bearer ${await getToken()}` },
    });

    const dto: GetUserNotificationSettingsResponseDTO = response.data;
    return dto.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.msg || 'Erro ao buscar preferências de notificação.');
    }
    throw error;
  }
};

export const updateUserNotificationSettings = async (
  data: Partial<UserNotificationSettings>,
): Promise<UserNotificationSettings> => {
  try {
    const response = await axios.patch(`${API_URL}/user/notification-settings`, data, {
      headers: { Authorization: `Bearer ${await getToken()}` },
    });

    const dto: UpdateUserNotificationSettingsResponseDTO = response.data;
    return dto.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.msg || 'Erro ao atualizar preferências de notificação.');
    }
    throw error;
  }
};
