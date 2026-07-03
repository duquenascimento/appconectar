import { Slot } from 'expo-router';
import { ChatProvider } from '../../src/contexts/chat.context';

function Layout() {
  return (
    <ChatProvider>
      <Slot />
    </ChatProvider>
  );
}

export default Layout;
