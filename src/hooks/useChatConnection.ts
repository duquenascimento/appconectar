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
          console.log({
            code: 'CHAT_TOKEN_NOT_FOUND',
            message: 'Token do chat não encontrado.',
          });

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
      } catch (error) {
        console.log('Erro ao preparar conexão com o chat:', error);

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

      console.log('Conexão estabelecida com o servidor:', chatSocket.id);
    }

    function handleDisconnect(reason: string) {
      if (isMounted) {
        setIsConnected(false);
      }

      console.log('Chat socket desconectado:', reason);
    }

    async function handleConnectError(err: ChatSocketConnectError) {
      console.log('=== CONNECT ERROR COMPLETO ===');
      console.log(err);
      console.log('message:', err.message);
      console.log('data:', err.data);

      const code = err.data?.code;
      const message = err.data?.message ?? err.message;

      if (isMounted) {
        setIsConnected(false);
      }

      if (code !== 'TOKEN_EXPIRED') {
        console.log('Erro ao conectar no chat socket:', {
          code: code ?? 'CONNECT_ERROR',
          message,
        });

        if (isMounted) {
          setIsLoadingChat(false);
        }

        return;
      }

      if (hasRetriedTokenRef.current) {
        console.log({
          code: 'TOKEN_REFRESH_ALREADY_RETRIED',
          message: 'O token expirou, uma nova tentativa já foi feita e falhou.',
        });

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
      } catch (refreshError) {
        console.log('Erro ao gerar novo token do chat:', refreshError);

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
