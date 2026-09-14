import axios from 'axios';
import { ClientSettings, GetClientSettingsResponseDTO } from '../types/clientSettingsTypes';
import { getStorage, getToken, setStorage, STORAGE_DEFAULT_KEYS } from '../utils/utils';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const sanitizeClientSettings = (raw: unknown): Partial<ClientSettings> => {
  const received = (raw ?? {}) as Partial<ClientSettings>;
  const sanitized: Partial<ClientSettings> = {};

  const maxDays = received.maxRetroactiveQuotationDays;
  if (typeof maxDays === 'number' && Number.isFinite(maxDays) && maxDays >= 0) {
    sanitized.maxRetroactiveQuotationDays = maxDays;
  }

  return sanitized;
};

export const getClientSettings = async (): Promise<Partial<ClientSettings> | null> => {
  try {
    const response = await axios.get(`${API_URL}/client-settings`, {
      headers: { Authorization: `Bearer ${await getToken()}` },
    });

    const clientSettingsResponse: GetClientSettingsResponseDTO = response.data;
    const settings = sanitizeClientSettings(clientSettingsResponse?.data);

    if (Object.keys(settings).length === 0) return null;

    await setStorage(STORAGE_DEFAULT_KEYS.CLIENT_SETTINGS, JSON.stringify(settings));

    return settings;
  } catch (error) {
    console.error('Erro ao buscar configurações do app:', error);
    return null;
  }
};

export const getCachedClientSettings = async (): Promise<Partial<ClientSettings> | null> => {
  try {
    const cached = await getStorage(STORAGE_DEFAULT_KEYS.CLIENT_SETTINGS);
    if (!cached) return null;

    const settings = sanitizeClientSettings(JSON.parse(cached));

    return Object.keys(settings).length > 0 ? settings : null;
  } catch (error) {
    console.error('Erro ao ler configurações do app do storage:', error);
    return null;
  }
};
