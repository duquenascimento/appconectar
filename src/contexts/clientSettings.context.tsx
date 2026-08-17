// clientSettings.context.tsx
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  useMemo,
  useCallback,
} from 'react';
import { getCachedClientSettings, getClientSettings } from '../services/clientSettingsService';
import { ClientSettings } from '../types/clientSettingsTypes';
import { useAuthContext } from './auth.context';

interface ClientSettingsContextData {
  clientSettings: ClientSettings;
  isLoadingClientSettings: boolean;
  reloadClientSettings: () => Promise<void>;
}

/**
 * ÚLTIMO RECURSO. Só é usado quando o backend E o cache local estão indisponíveis —
 * primeiro acesso sem rede, ou backend antigo que ainda não tem GET /client-settings.
 *
 * A fonte de verdade é a tabela `app_setting` no backend. NÃO altere estes números para
 * mudar comportamento em produção: mude a linha no banco. Nenhum componente deve
 * importar este objeto — consuma `useClientSettings()`.
 */
export const FALLBACK_CLIENT_SETTINGS: ClientSettings = {
  maxRetroactiveQuotationDays: 90,
};

const ClientSettingsContext = createContext<ClientSettingsContextData>(
  {} as ClientSettingsContextData,
);

export function ClientSettingsProvider({ children }: { children: ReactNode }) {
  const [clientSettings, setClientSettings] = useState<ClientSettings>(FALLBACK_CLIENT_SETTINGS);
  const [isLoadingClientSettings, setIsLoadingClientSettings] = useState<boolean>(false);

  const { authToken } = useAuthContext();

  // 1) Cache primeiro: o seletor de data já abre com o último valor conhecido.
  useEffect(() => {
    let isActive = true;

    const loadCached = async () => {
      const cached = await getCachedClientSettings();
      if (isActive && cached) setClientSettings((prev) => ({ ...prev, ...cached }));
    };

    loadCached();

    return () => {
      isActive = false;
    };
  }, []);

  // 2) Servidor depois: sobrescreve cache/fallback quando responde.
  const reloadClientSettings = useCallback(async () => {
    // Sem token não há o que buscar. Diferente das notificações, NÃO limpamos o estado:
    // estas são configurações globais, não dados do usuário — zerar aqui faria o app
    // voltar ao fallback. O `clearAllStoragesData()` do logout já limpa o cache.
    if (!authToken) return;

    setIsLoadingClientSettings(true);
    try {
      const fetched = await getClientSettings();
      // `null` significa "sem novidade" (rede falhou), então preserva o valor atual.
      if (fetched) setClientSettings((prev) => ({ ...prev, ...fetched }));
    } finally {
      setIsLoadingClientSettings(false);
    }
  }, [authToken]);

  useEffect(() => {
    reloadClientSettings();
  }, [authToken, reloadClientSettings]);

  const value = useMemo(
    () => ({
      clientSettings,
      isLoadingClientSettings,
      reloadClientSettings,
    }),
    [clientSettings, isLoadingClientSettings, reloadClientSettings],
  );

  return <ClientSettingsContext.Provider value={value}>{children}</ClientSettingsContext.Provider>;
}

export const useClientSettings = () => useContext(ClientSettingsContext);
