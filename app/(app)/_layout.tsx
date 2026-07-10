import { Slot, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChatProvider } from '../../src/contexts/chat.context';
import { useRestaurantContext } from '../../src/contexts/restaurant.context';
import { useChatConnection } from '../../src/hooks/useChatConnection';
import { usePushRegistration } from '../../src/hooks/usePushRegistration';
import { useNotificationClickHandler } from '../../src/hooks/useNotificationClickHandler';
import { useInitialNotificationUrlHandler } from '../../src/hooks/useInitialNotificationUrlHandler';
// eslint-disable-next-line max-len
import { useMobileNotificationClickHandler } from '../../src/hooks/useMobileNotificationClickHandler';
import { chatSocket } from '../../src/services/chatSocketService';

function LayoutContent() {
  const router = useRouter();

  const { handleRestaurantChange, restaurants, selectedRestaurant } = useRestaurantContext();

  const { isConnected } = useChatConnection();

  const [pendingNotificationChannelId, setPendingNotificationChannelId] = useState<string | null>(
    null,
  );

  const isProcessingNotificationRef = useRef(false);

  usePushRegistration({
    isConnected,
  });

  const handleNotificationChannelId = useCallback(async (channelId: string) => {
    console.log('Notificação clicada. ChannelId:', channelId);

    if (!channelId) {
      return;
    }

    setPendingNotificationChannelId(channelId);
  }, []);

  useNotificationClickHandler({
    onNotificationChannelId: handleNotificationChannelId,
  });

  useInitialNotificationUrlHandler({
    onNotificationChannelId: handleNotificationChannelId,
  });

  const handleMobileNotification = useCallback(
    async ({ channelId }: { channelId: string }) => {
      await handleNotificationChannelId(channelId);
    },
    [handleNotificationChannelId],
  );

  useMobileNotificationClickHandler({
    onOpenChat: handleMobileNotification,
  });

  useEffect(() => {
    if (!pendingNotificationChannelId) {
      return;
    }

    if (isProcessingNotificationRef.current) {
      return;
    }

    if (!restaurants.length) {
      return;
    }

    const restaurant = restaurants.find((item) => item.id === pendingNotificationChannelId);

    if (!restaurant) {
      console.log({
        code: 'NOTIFICATION_RESTAURANT_NOT_FOUND',
        message: 'O restaurante da notificação não foi encontrado para o usuário.',
        channelId: pendingNotificationChannelId,
      });

      setPendingNotificationChannelId(null);
      return;
    }

    isProcessingNotificationRef.current = true;

    const previousRestaurantId = selectedRestaurant?.id;

    async function processNotification() {
      try {
        if (
          chatSocket.connected &&
          previousRestaurantId &&
          previousRestaurantId !== restaurant.id
        ) {
          chatSocket.emit('leave_chat', {
            channelId: previousRestaurantId,
            channelType: 'restaurant',
          });
        }

        await handleRestaurantChange(restaurant);

        router.navigate('/chat');

        setPendingNotificationChannelId(null);
      } catch (error) {
        console.log('Erro ao abrir chat pela notificação:', error);
      } finally {
        isProcessingNotificationRef.current = false;
      }
    }

    void processNotification();
  }, [
    pendingNotificationChannelId,
    restaurants,
    selectedRestaurant?.id,
    handleRestaurantChange,
    router,
  ]);

  return <Slot />;
}

export default function Layout() {
  return (
    <ChatProvider>
      <LayoutContent />
    </ChatProvider>
  );
}
