import axios from 'axios';
import { getToken } from '../utils/utils';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const loadAppNotifications = async () => {
  try {
    const token = await getToken();
    if (!token) {
      return { authorized: false };
    }
    const response = await axios.get(`${API_URL}/notifications/active`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Falha ao buscar notificações:', error);
    throw error;
  }
};
