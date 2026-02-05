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
import { UserRole } from '../types/userRoleTypes';
import {
  clearAllStoragesData,
  deleteToken,
  getStorage,
  getToken,
  setStorage,
  setToken,
  STORAGE_DEFAULT_KEYS,
} from '../utils/utils';

interface AuthContextProps {
  authToken: string | null;
  userRoles: UserRole[] | null;
  isAdmin: boolean;
  saveLogin: (token: string, userRoles: UserRole[]) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[] | null>(null);
  const router = useRouter();

  const getAuthToken = async () => {
    try {
      const token = await getToken();
      if (token) {
        setAuthToken(token);
      }
    } catch (error) {
      console.error('Erro ao buscar o token:', error);
    }
  };

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

  const getUserRoles = useCallback(async () => {
    if (userRoles) {
      return userRoles;
    }

    try {
      const rolesString = await getStorage(STORAGE_DEFAULT_KEYS.USER_ROLES);
      if (rolesString) {
        const roles: UserRole[] = JSON.parse(rolesString);
        setUserRoles(roles);
        return roles;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar roles do usuário:', error);
      return null;
    }
  }, [userRoles]);

  const saveUserRoles = useCallback(async (userRoles: UserRole[] | null) => {
    try {
      await setStorage(STORAGE_DEFAULT_KEYS.USER_ROLES, JSON.stringify(userRoles));
      setUserRoles(userRoles);
    } catch (error) {
      console.error('Erro ao salvar roles do usuário:', error);
    }
  }, []);

  const isAdmin = useMemo(() => {
    return userRoles?.includes('admin') || false;
  }, [userRoles]);

  const saveLogin = useCallback(
    async (token: string, userRoles: UserRole[]) => {
      await Promise.all([saveAuthToken(token), saveUserRoles(userRoles)]);
    },
    [saveAuthToken, saveUserRoles, setStorage],
  );

  useEffect(() => {
    const initialize = async () => {
      await Promise.all([getAuthToken(), getUserRoles()]);
    };
    initialize();
  }, []);

  const logout = useCallback(async () => {
    try {
      await Promise.all([deleteAuthToken(), saveUserRoles(null), clearAllStoragesData()]);

      if (router.canDismiss()) {
        router.dismissAll();
      }

      router.replace('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }, [deleteAuthToken, saveUserRoles, router]);

  const value = useMemo(
    () => ({
      authToken,
      userRoles,
      isAdmin,
      saveLogin,
      logout,
    }),
    [authToken, userRoles, isAdmin, saveLogin, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => useContext(AuthContext);
