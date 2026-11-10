import { Slot } from 'expo-router';
import { ChatProvider } from '../../src/contexts/chat.context';
import { useNotificationRouting } from '../../src/hooks/useNotificationRouting';

function LayoutContent() {
  useNotificationRouting();

  return <Slot />;
}

export default function Layout() {
  return (
    <ChatProvider>
      <LayoutContent />
    </ChatProvider>
  );
}
