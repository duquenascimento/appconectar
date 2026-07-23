import { Slot, useRouter, usePathname } from 'expo-router';
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
import { useActiveChannelResponder } from '../../src/hooks/useActiveChannelResponder';
// eslint-disable-next-line max-len
import { useMobileNotificationPresentationState } from '../../src/services/useMobileNotificationPresentationState';

function LayoutContent() {
  const router = useRouter();
  const pathname = usePathname();

  const { handleRestaurantChange, restaurants, selectedRestaurant } = useRestaurantContext();

  const { isConnected } = useChatConnection();

  const [pendingNotificationChannelId, setPendingNotificationChannelId] = useState<string | null>(
    null,
  );

  const isProcessingNotificationRef = useRef(false);

  usePushRegistration({
    isConnected,
  });

  const isChatScreen = pathname === '/chat';

  const activeNotificationChannelId = isChatScreen ? (selectedRestaurant?.id ?? null) : null;

  useActiveChannelResponder({
    activeChannelId: activeNotificationChannelId,
  });

  useMobileNotificationPresentationState({
    activeChannelId: activeNotificationChannelId,
  });

  const handleNotificationChannelId = useCallback(async (channelId: string) => {
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

    if (!restaurants?.length) {
      return;
    }

    const restaurant = restaurants.find((item) => item.id === pendingNotificationChannelId);

    if (!restaurant) {
      setPendingNotificationChannelId(null);
      return;
    }

    isProcessingNotificationRef.current = true;

    const previousRestaurantId = selectedRestaurant?.id;

    async function processNotification() {
      try {
        if (previousRestaurantId !== restaurant.id) {
          if (chatSocket.connected && previousRestaurantId) {
            chatSocket.emit('leave_chat', {
              channelId: previousRestaurantId,
              channelType: 'restaurant',
            });
          }

          await handleRestaurantChange(restaurant);
        }

        router.navigate('/chat');

        setPendingNotificationChannelId(null);
      } catch {
        setPendingNotificationChannelId(null);
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
