import { Slot, useRouter, usePathname } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChatProvider } from '../../src/contexts/chat.context';
import { useRestaurantContext } from '../../src/contexts/restaurant.context';
import { usePushRegistration } from '../../src/hooks/usePushRegistration';
import { useNotificationClickHandler } from '../../src/hooks/useNotificationClickHandler';
import { useInitialNotificationUrlHandler } from '../../src/hooks/useInitialNotificationUrlHandler';
// eslint-disable-next-line max-len
import { useMobileNotificationClickHandler } from '../../src/hooks/useMobileNotificationClickHandler';
import { chatSocket } from '../../src/services/chatSocketService';
import { useActiveChannelResponder } from '../../src/hooks/useActiveChannelResponder';
// eslint-disable-next-line max-len
import { useMobileNotificationPresentationState } from '../../src/services/useMobileNotificationPresentationState';
import { PushNotificationData } from '../../src/types/pushTypes';
// import { ChatProvider } from '../../src/contexts/chat.context';

function LayoutContent() {
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

        if (notification.type === 'order_confirmed') {
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

  return <Slot />;
}

export default function Layout() {
  return (
    <ChatProvider>
      <LayoutContent />
    </ChatProvider>
  );
}
