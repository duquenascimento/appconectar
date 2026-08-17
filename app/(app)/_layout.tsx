import { Slot } from 'expo-router';
// import { ChatProvider } from '../../src/contexts/chat.context';

function Layout() {
  return (
    // OBS: CHAT REMOVIDO TEMPORARIAMENTE
    //    <ChatProvider>
    <Slot />
    //    </ChatProvider>
  );
}

export default Layout;
