import { Slot } from 'expo-router';
import { useCallback } from 'react';
import { ChatProvider } from '../../src/contexts/chat.context';
import { useNotificationClickHandler } from '../../src/hooks/useNotificationClickHandler';
import { useInitialNotificationUrlHandler } from '../../src/hooks/useInitialNotificationUrlHandler';

function Layout() {
  const handleNotificationChannelId = useCallback(async (channelId: string) => {
    console.log('Notificação clicada. ChannelId:', channelId);

    /**
     * Aqui entra a lógica real do seu projeto.
     *
     * Exemplo:
     *
     * await selectRestaurantById(channelId);
     * await getRestaurantInfo(channelId);
     * router.navigate('/chat');
     */
  }, []);

  useNotificationClickHandler({
    onNotificationChannelId: handleNotificationChannelId,
  });

  useInitialNotificationUrlHandler({
    onNotificationChannelId: handleNotificationChannelId,
  });

  return (
    <ChatProvider>
      <Slot />
    </ChatProvider>
  );
}

export default Layout;
