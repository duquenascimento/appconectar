import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import { PushNotificationData } from '../types/pushTypes';
import { parsePushNotificationData } from '../utils/pushNotificationData';

interface UseMobileNotificationClickHandlerParams {
  onNotificationOpen: (data: PushNotificationData) => void | Promise<void>;
}

export function useMobileNotificationClickHandler({
  onNotificationOpen,
}: UseMobileNotificationClickHandlerParams): void {
  const onNotificationOpenRef = useRef(onNotificationOpen);
  const handledNotificationIdsRef = useRef(new Set<string>());

  useEffect(() => {
    onNotificationOpenRef.current = onNotificationOpen;
  }, [onNotificationOpen]);

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

      const notificationData = parsePushNotificationData(
        response.notification.request.content.data,
      );

      if (!notificationData) {
        console.log({
          code: 'INVALID_PUSH_NOTIFICATION_DATA',
          message: 'Dados da notificação push são inválidos.',
        });
        return;
      }

      handledNotificationIdsRef.current.add(notificationId);

      try {
        await onNotificationOpenRef.current(notificationData);
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
