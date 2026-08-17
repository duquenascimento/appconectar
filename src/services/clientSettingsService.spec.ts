import axios from 'axios';
import { getCachedClientSettings, getClientSettings } from './clientSettingsService';
import { getStorage, setStorage } from '../utils/utils';

jest.mock('axios');

// Mock completo de propósito: `requireActual` arrastaria expo-secure-store e js-cookie.
// STORAGE_DEFAULT_KEYS é usado como valor, então a factory precisa fornecê-lo.
jest.mock('../utils/utils', () => ({
  getToken: jest.fn().mockResolvedValue('fake-token'),
  getStorage: jest.fn(),
  setStorage: jest.fn(),
  STORAGE_DEFAULT_KEYS: { CLIENT_SETTINGS: 'clientSettings' },
}));

const axiosGetMock = axios.get as jest.MockedFunction<typeof axios.get>;
const getStorageMock = getStorage as jest.MockedFunction<typeof getStorage>;
const setStorageMock = setStorage as jest.MockedFunction<typeof setStorage>;

describe('clientSettingsService - getClientSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve desempacotar o envelope e salvar em cache', async () => {
    axiosGetMock.mockResolvedValue({
      data: { status: 200, data: { maxRetroactiveQuotationDays: 5 } },
    });

    await expect(getClientSettings()).resolves.toEqual({ maxRetroactiveQuotationDays: 5 });

    expect(setStorageMock).toHaveBeenCalledWith(
      'clientSettings',
      JSON.stringify({ maxRetroactiveQuotationDays: 5 }),
    );
  });

  it('deve aceitar 0 como janela válida', async () => {
    axiosGetMock.mockResolvedValue({
      data: { status: 200, data: { maxRetroactiveQuotationDays: 0 } },
    });

    await expect(getClientSettings()).resolves.toEqual({ maxRetroactiveQuotationDays: 0 });
  });

  it('deve retornar null sem lançar quando a rota falha, preservando o cache', async () => {
    // Cenário real: backend antigo sem a rota (404), offline ou timeout.
    axiosGetMock.mockRejectedValue(new Error('Network Error'));

    await expect(getClientSettings()).resolves.toBeNull();

    expect(setStorageMock).not.toHaveBeenCalled();
  });

  it('deve retornar null quando o payload é inválido', async () => {
    axiosGetMock.mockResolvedValue({
      data: { status: 200, data: { maxRetroactiveQuotationDays: 'sessenta' } },
    });

    await expect(getClientSettings()).resolves.toBeNull();
    expect(setStorageMock).not.toHaveBeenCalled();
  });
});

describe('clientSettingsService - getCachedClientSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve ler o último valor conhecido do storage', async () => {
    getStorageMock.mockResolvedValue(JSON.stringify({ maxRetroactiveQuotationDays: 5 }));

    await expect(getCachedClientSettings()).resolves.toEqual({ maxRetroactiveQuotationDays: 5 });
  });

  it('deve retornar null quando não há cache', async () => {
    getStorageMock.mockResolvedValue(null);

    await expect(getCachedClientSettings()).resolves.toBeNull();
  });

  it('deve retornar null quando o cache está corrompido', async () => {
    getStorageMock.mockResolvedValue('{ not json');

    await expect(getCachedClientSettings()).resolves.toBeNull();
  });
});
