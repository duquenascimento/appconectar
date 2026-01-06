import { useRouter } from 'expo-router';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { clearAllStoragesData, deleteToken, getToken, setToken } from '../utils/utils';

interface AuthContextProps {
  authToken: string | null;
  saveAuthToken: (token: string) => Promise<void>;
  deleteAuthToken: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const router = useRouter();

  const saveAuthToken = useCallback(async (token: string) => {
    try {
      await setToken(token);
      setAuthToken(token);
    } catch (error) {
      console.error('Erro ao salvar token:', error);
    }
  }, []);

  const deleteAuthToken = useCallback(async () => {
    try {
      await deleteToken();
      setAuthToken(null);
    } catch (error) {
      console.error('Erro ao deletar token:', error);
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      try {
        const token = await getToken();
        if (token) {
          setAuthToken(token);
        }
      } catch (error) {
        console.error('Erro ao buscar o token:', error);
      }
    };
    initialize();
  }, []);

  const logout = useCallback(async () => {
    try {
      await deleteAuthToken();
      await clearAllStoragesData();

      if (router.canDismiss()) {
        router.dismissAll();
      }

      router.replace('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }, [deleteAuthToken]);

  const value = useMemo(
    () => ({
      authToken,
      saveAuthToken,
      deleteAuthToken,
      logout,
    }),
    [authToken, saveAuthToken, deleteAuthToken, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => useContext(AuthContext);
