import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export interface ChatNotificationData {
  type: 'chat_message';
  channelType: 'restaurant' | 'supplier';
  channelId: string;
}

interface UseMobileNotificationClickHandlerParams {
  onOpenChat: (data: ChatNotificationData) => void | Promise<void>;
}

function parseChatNotificationData(data: Record<string, unknown>): ChatNotificationData | null {
  if (data.type !== 'chat_message') {
    return null;
  }

  if (data.channelType !== 'restaurant' && data.channelType !== 'supplier') {
    return null;
  }

  if (typeof data.channelId !== 'string' || !data.channelId.trim()) {
    return null;
  }

  return {
    type: 'chat_message',
    channelType: data.channelType,
    channelId: data.channelId.trim(),
  };
}

export function useMobileNotificationClickHandler({
  onOpenChat,
}: UseMobileNotificationClickHandlerParams): void {
  const onOpenChatRef = useRef(onOpenChat);
  const handledNotificationIdsRef = useRef(new Set<string>());

  useEffect(() => {
    onOpenChatRef.current = onOpenChat;
  }, [onOpenChat]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    let isMounted = true;

    async function handleResponse(response: Notifications.NotificationResponse): Promise<void> {
      if (!isMounted || response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) {
        return;
      }

      const notificationId = response.notification.request.identifier;

      if (handledNotificationIdsRef.current.has(notificationId)) {
        return;
      }

      const notificationData = parseChatNotificationData(
        response.notification.request.content.data,
      );

      if (!notificationData) {
        console.log({
          code: 'INVALID_CHAT_NOTIFICATION_DATA',
          message: 'Dados da notificação de chat são inválidos.',
        });
        return;
      }

      handledNotificationIdsRef.current.add(notificationId);

      try {
        await onOpenChatRef.current(notificationData);
        await Notifications.clearLastNotificationResponseAsync();
      } catch (error) {
        handledNotificationIdsRef.current.delete(notificationId);
        console.log('Erro ao processar clique na notificação:', error);
      }
    }

    async function handleInitialNotification(): Promise<void> {
      try {
        const response = await Notifications.getLastNotificationResponseAsync();

        if (response) {
          await handleResponse(response);
        }
      } catch (error) {
        console.log('Erro ao obter a notificação que abriu o app:', error);
      }
    }

    void handleInitialNotification();

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      void handleResponse(response);
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);
}
