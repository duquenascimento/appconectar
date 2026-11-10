import { useEffect, useRef, useState } from 'react';

import { chatSocket } from '../services/chatSocketService';
import { ChatSocketConnectError } from '../types/chatTypes';
import { getChatToken, setChatToken } from '../utils/chat-token';
import { getClientCredentialsToken } from '../utils/getClientCredentialsToken';

export function useChatConnection() {
  const [isConnected, setIsConnected] = useState(chatSocket.connected);
  const [isLoadingChat, setIsLoadingChat] = useState(!chatSocket.connected);

  const hasRetriedTokenRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    async function connectSocket() {
      try {
        if (isMounted) {
          setIsLoadingChat(true);
        }

        let currentToken = await getChatToken();

        if (!currentToken) {
          const keycloakToken = await getClientCredentialsToken();
          currentToken = keycloakToken.access_token as string | null;

          if (currentToken) {
            await setChatToken(currentToken);
          }
        }

        if (!currentToken) {
          if (isMounted) {
            setIsLoadingChat(false);
          }

          return;
        }

        chatSocket.auth = {
          token: currentToken,
        };

        if (!chatSocket.connected) {
          chatSocket.connect();
        }
      } catch {
        if (isMounted) {
          setIsLoadingChat(false);
        }
      }
    }

    function handleConnect() {
      hasRetriedTokenRef.current = false;

      if (isMounted) {
        setIsConnected(true);
        setIsLoadingChat(false);
      }
    }

    function handleDisconnect(_reason: string) {
      if (isMounted) {
        setIsConnected(false);
      }
    }

    async function handleConnectError(err: ChatSocketConnectError) {
      const code = err.data?.code;

      if (isMounted) {
        setIsConnected(false);
      }

      if (code !== 'TOKEN_EXPIRED') {
        if (isMounted) {
          setIsLoadingChat(false);
        }

        return;
      }

      if (hasRetriedTokenRef.current) {
        if (isMounted) {
          setIsLoadingChat(false);
        }

        return;
      }

      hasRetriedTokenRef.current = true;

      try {
        if (isMounted) {
          setIsLoadingChat(true);
        }

        const keycloakToken = await getClientCredentialsToken();
        const newToken = keycloakToken.access_token;

        if (!newToken) {
          throw new Error('Não foi possível obter um novo token do chat.');
        }

        await setChatToken(newToken);

        chatSocket.auth = {
          token: newToken,
        };

        chatSocket.connect();
      } catch {
        if (isMounted) {
          setIsLoadingChat(false);
        }
      }
    }

    chatSocket.on('connect', handleConnect);
    chatSocket.on('disconnect', handleDisconnect);
    chatSocket.on('connect_error', handleConnectError);

    if (chatSocket.connected) {
      handleConnect();
    } else {
      void connectSocket();
    }

    return () => {
      isMounted = false;

      chatSocket.off('connect', handleConnect);
      chatSocket.off('disconnect', handleDisconnect);
      chatSocket.off('connect_error', handleConnectError);

      chatSocket.disconnect();
    };
  }, []);

  return {
    isConnected,
    isLoadingChat,
  };
}
