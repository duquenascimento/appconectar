import { useState, useEffect, useRef } from 'react';
import { chatSocket } from '../services/chatSocketService';
import { getChatToken, setChatToken } from '../utils/chat-token';
import { getClientCredentialsToken } from '../utils/getClientCredentialsToken';

type ChatSocketConnectError = Error & {
  data?: {
    code?: 'TOKEN_EXPIRED' | 'INVALID_TOKEN' | 'TOKEN_MISSING';
    message?: string;
  };
};

export function useChatConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(true);

  const hasRetriedTokenRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    async function connectSocket() {
      try {
        setIsLoadingChat(true);

        let currentToken = await getChatToken();

        if (!currentToken) {
          const keyCloakToken = await getClientCredentialsToken();
          console.log(keyCloakToken);
          currentToken = keyCloakToken.access_token as string;

          await setChatToken(currentToken);
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
      } catch (err) {
        console.log('Erro ao preparar conexão com o chat:', err);

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

      console.log('Chat socket conectado:', chatSocket.id);
    }

    function handleDisconnect() {
      if (isMounted) {
        setIsConnected(false);
      }

      console.log('Chat socket desconectado');
    }

    async function handleConnectError(err: ChatSocketConnectError) {
      const code = err.data?.code;
      const message = err.data?.message ?? err.message;

      if (isMounted) {
        setIsConnected(false);
      }

      if (code === 'TOKEN_EXPIRED') {
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
          console.log('Token do chat expirado. Gerando novo token...');

          if (isMounted) {
            setIsLoadingChat(true);
          }

          const keyCloakToken = await getClientCredentialsToken();
          const newToken = keyCloakToken.access_token;

          if (!newToken) {
            console.log({
              code: 'CHAT_TOKEN_REFRESH_FAILED',
              message: 'Não foi possível obter um novo token do chat.',
            });

            if (isMounted) {
              setIsLoadingChat(false);
            }

            return;
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

        return;
      }

      console.log('Erro ao conectar no chat socket:', {
        code: code ?? 'CONNECT_ERROR',
        message,
      });

      if (isMounted) {
        setIsLoadingChat(false);
      }
    }

    chatSocket.on('connect', handleConnect);
    chatSocket.on('disconnect', handleDisconnect);
    chatSocket.on('connect_error', handleConnectError);

    connectSocket();

    return () => {
      isMounted = false;

      chatSocket.off('connect', handleConnect);
      chatSocket.off('disconnect', handleDisconnect);
      chatSocket.off('connect_error', handleConnectError);

      chatSocket.disconnect();
    };
  }, []);

  return { isConnected, isLoadingChat };
}
