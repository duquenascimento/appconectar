// notification.context.tsx
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  useMemo,
  useCallback,
} from 'react';
import { loadAppNotifications } from '../services/appNotificationService';
import { getStorage, setStorage } from '../utils/utils'; // Alterado para usar seus utilitários
import { useAuthContext } from './auth.context'; // Importe seu contexto de autenticação

interface AppNotification {
  id: string;
  title: string;
  message: string;
  notificationType: 'ALERT' | 'INFO' | 'WARN' | 'ERROR';
  footer: string;
}

interface NotificationContextData {
  currentNotification: AppNotification | null;
  hasNotifications: boolean;
  nextNotification: () => void;
  prevNotification: () => void;
  dismissAllNotifications: () => void;
  reloadNotifications: () => Promise<void>;
  currentIndex: number;
  totalNotifications: number;
}

const NotificationContext = createContext<NotificationContextData>({} as NotificationContextData);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Consumindo estado de autenticação do AuthContext
  const { authToken } = useAuthContext();

  const reloadNotifications = useCallback(async () => {
    // Regra: Se o usuário não está logado, não buscar notificações
    if (!authToken) {
      setNotifications([]);
      return;
    }

    try {
      const response = await loadAppNotifications();
      if (!response || !response.data || !response.data.notifications) return;

      const activeNotifications = response.data.notifications;

      const dismissedIdsRaw = await getStorage('@app:dismissed_notifications');
      const dismissedIds: string[] = dismissedIdsRaw ? JSON.parse(dismissedIdsRaw) : [];

      const unseenNotifications = activeNotifications.filter(
        (notification: AppNotification) => !dismissedIds.includes(notification.id),
      );

      setNotifications(unseenNotifications);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Erro ao buscar notificações da home:', error);
    }
  }, [authToken]);

  useEffect(() => {
    reloadNotifications();
  }, [authToken, reloadNotifications]);

  const hasNotifications = notifications.length > 0;
  const totalNotifications = notifications.length;
  const currentNotification = hasNotifications ? notifications[currentIndex] : null;

  const nextNotification = useCallback(() => {
    if (currentIndex < notifications.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, notifications.length]);

  const prevNotification = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const dismissAllNotifications = useCallback(async () => {
    if (notifications.length === 0) return;

    try {
      // 1. Busca os IDs que já foram fechados no passado
      const dismissedIdsRaw = await getStorage('@app:dismissed_notifications');
      const dismissedIds: string[] = dismissedIdsRaw ? JSON.parse(dismissedIdsRaw) : [];

      // 2. Adiciona o ID de TODAS as notificações atuais da fila no array
      notifications.forEach((notification) => {
        if (!dismissedIds.includes(notification.id)) {
          dismissedIds.push(notification.id);
        }
      });

      // 3. Salva a lista atualizada no Storage usando seu utilitário
      await setStorage('@app:dismissed_notifications', JSON.stringify(dismissedIds));

      // 4. Limpa o estado local para fechar o modal
      setNotifications([]);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Erro ao salvar notificações lidas:', error);
    }
  }, [notifications]);

  const value = useMemo(
    () => ({
      currentIndex,
      currentNotification,
      hasNotifications,
      nextNotification,
      prevNotification,
      dismissAllNotifications,
      reloadNotifications,
      totalNotifications,
    }),
    [
      currentIndex,
      currentNotification,
      hasNotifications,
      nextNotification,
      prevNotification,
      dismissAllNotifications,
      reloadNotifications,
      totalNotifications,
    ],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export const useNotifications = () => useContext(NotificationContext);
