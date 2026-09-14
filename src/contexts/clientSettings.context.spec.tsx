import React from 'react';
import { Text } from 'react-native';
import { render, screen, waitFor } from '@testing-library/react-native';
import { ClientSettingsProvider, useClientSettings } from './clientSettings.context';
import { getCachedClientSettings, getClientSettings } from '../services/clientSettingsService';

jest.mock('../services/clientSettingsService');
jest.mock('./auth.context', () => ({
  useAuthContext: () => ({ authToken: 'fake-token' }),
}));

const getClientSettingsMock = getClientSettings as jest.MockedFunction<typeof getClientSettings>;
const getCachedClientSettingsMock = getCachedClientSettings as jest.MockedFunction<
  typeof getCachedClientSettings
>;

function Probe() {
  const { clientSettings } = useClientSettings();
  return <Text testID="max-days">{String(clientSettings.maxRetroactiveQuotationDays)}</Text>;
}

const renderProvider = () =>
  render(
    <ClientSettingsProvider>
      <Probe />
    </ClientSettingsProvider>,
  );

describe('ClientSettingsProvider - ordem de resolução', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve usar o fallback 90 quando não há cache nem resposta do servidor', async () => {
    getCachedClientSettingsMock.mockResolvedValue(null);
    getClientSettingsMock.mockResolvedValue(null);

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('max-days')).toHaveTextContent('90');
    });
  });

  it('deve preservar o valor em cache quando a busca falha', async () => {
    // Regressão importante: se o service passar a devolver o fallback no erro em vez de
    // null, uma atualização falha sobrescreveria o cache e o piso do seletor voltaria a 90.
    getCachedClientSettingsMock.mockResolvedValue({ maxRetroactiveQuotationDays: 5 });
    getClientSettingsMock.mockResolvedValue(null);

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('max-days')).toHaveTextContent('5');
    });
  });

  it('deve priorizar a resposta do servidor sobre o cache', async () => {
    getCachedClientSettingsMock.mockResolvedValue({ maxRetroactiveQuotationDays: 5 });
    getClientSettingsMock.mockResolvedValue({ maxRetroactiveQuotationDays: 10 });

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('max-days')).toHaveTextContent('10');
    });
  });
});
