import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { deleteToken, getToken, setToken } from "../utils/utils";

interface AuthContextProps {
  authToken: string | null;
  saveAuthToken: (token: string) => Promise<void>;
  deleteAuthToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [authToken, setAuthToken] = useState<string | null>(null);

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

    const value = useMemo(
        () => ({
            authToken,
            saveAuthToken,
            deleteAuthToken,
        }),
        [authToken, saveAuthToken, deleteAuthToken],
      );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => useContext(AuthContext);