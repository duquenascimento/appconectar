import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'expo-router';

import { useRestaurantContext } from '../contexts/restaurant.context';
import { chatSocket } from '../services/chatSocketService';
// eslint-disable-next-line max-len
import { useMobileNotificationPresentationState } from '../services/useMobileNotificationPresentationState';
import { PushNotificationData } from '../types/pushTypes';
import { isOrderNotification } from '../utils/pushNotificationData';
import { usePushRegistration } from './usePushRegistration';
import { useNotificationClickHandler } from './useNotificationClickHandler';
import { useInitialNotificationUrlHandler } from './useInitialNotificationUrlHandler';
import { useMobileNotificationClickHandler } from './useMobileNotificationClickHandler';
import { useActiveChannelResponder } from './useActiveChannelResponder';

export function useNotificationRouting(): void {
  const router = useRouter();
  const pathname = usePathname();

  const { handleRestaurantChange, restaurants, selectedRestaurant } = useRestaurantContext();

  const [pendingNotification, setPendingNotification] = useState<PushNotificationData | null>(null);

  const isProcessingNotificationRef = useRef(false);

  usePushRegistration();

  const isChatScreen = pathname === '/chat';

  const activeNotificationChannelId = isChatScreen ? (selectedRestaurant?.id ?? null) : null;

  useActiveChannelResponder({
    activeChannelId: activeNotificationChannelId,
  });

  useMobileNotificationPresentationState({
    activeChannelId: activeNotificationChannelId,
  });

  const handleNotificationData = useCallback((data: PushNotificationData) => {
    if (!data?.channelId) {
      return;
    }

    setPendingNotification(data);
  }, []);

  useNotificationClickHandler({
    onNotificationData: handleNotificationData,
  });

  useInitialNotificationUrlHandler({
    onNotificationData: handleNotificationData,
  });

  useMobileNotificationClickHandler({
    onNotificationOpen: handleNotificationData,
  });

  useEffect(() => {
    if (!pendingNotification) {
      return;
    }

    if (isProcessingNotificationRef.current) {
      return;
    }

    if (!restaurants?.length) {
      return;
    }

    const restaurant = restaurants.find((item) => item.id === pendingNotification.channelId);

    if (!restaurant) {
      setPendingNotification(null);
      return;
    }

    isProcessingNotificationRef.current = true;

    const previousRestaurantId = selectedRestaurant?.id;
    const notification = pendingNotification;
    const targetRestaurant = restaurant;

    async function processNotification() {
      try {
        if (previousRestaurantId !== targetRestaurant.id) {
          if (chatSocket.connected && previousRestaurantId) {
            chatSocket.emit('leave_chat', {
              channelId: previousRestaurantId,
              channelType: 'restaurant',
            });
          }

          await handleRestaurantChange(targetRestaurant);
        }

        if (isOrderNotification(notification)) {
          router.navigate({
            pathname: '/orderDetailsScreen',
            params: { orderId: notification.orderId },
          });
        } else {
          router.navigate('/chat');
        }

        setPendingNotification(null);
      } catch {
        setPendingNotification(null);
      } finally {
        isProcessingNotificationRef.current = false;
      }
    }

    void processNotification();
  }, [pendingNotification, restaurants, selectedRestaurant?.id, handleRestaurantChange, router]);
}
