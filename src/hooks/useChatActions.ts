import { useCallback, useEffect, useRef } from 'react';
import { chatSocket } from '../services/chatSocketService';
import { JoinChatPayload, LeaveChatPayload, SendMessagePayload } from '../types/chatTypes';

export interface MarkMessagesAsReadPayload {
  channelType: 'restaurant' | 'supplier';
  channelId: string;
}

export function useChatActions() {
  const markMessagesAsReadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (markMessagesAsReadTimeoutRef.current) {
        clearTimeout(markMessagesAsReadTimeoutRef.current);
      }
    };
  }, []);

  const joinChat = useCallback((payload: JoinChatPayload) => {
    return new Promise<void>((resolve) => {
      if (!chatSocket.connected) {
        console.log({
          code: 'SOCKET_NOT_CONNECTED',
          message: 'Socket do chat não está conectado.',
        });
        return resolve();
      }

      const onResponse = () => {
        chatSocket.off('join_chat_response', onResponse);
        resolve();
      };

      chatSocket.on('join_chat_response', onResponse);
      chatSocket.emit('join_chat', payload);

      setTimeout(() => {
        chatSocket.off('join_chat_response', onResponse);
        resolve();
      }, 5000);
    });
  }, []);

  const leaveChat = useCallback((payload: LeaveChatPayload) => {
    if (!chatSocket.connected) return;

    chatSocket.emit('leave_chat', payload);
  }, []);

  const getMessages = useCallback((payload: LeaveChatPayload) => {
    if (!chatSocket.connected) {
      console.log({
        code: 'SOCKET_NOT_CONNECTED',
        message: 'Socket do chat não está conectado.',
      });
      return;
    }

    chatSocket.emit('get_messages', payload);
  }, []);

  const getUnreadMessages = useCallback((payload: LeaveChatPayload) => {
    if (!chatSocket.connected) {
      console.log({
        code: 'SOCKET_NOT_CONNECTED',
        message: 'Socket do chat não está conectado.',
      });
      return;
    }

    chatSocket.emit('get_unread_messages', payload);
  }, []);

  const sendMessage = useCallback((payload: SendMessagePayload) => {
    if (!chatSocket.connected) {
      console.log({
        code: 'SOCKET_NOT_CONNECTED',
        message: 'Socket do chat não está conectado.',
      });
      return;
    }

    chatSocket.emit('send_message', payload);
  }, []);

  const markMessagesAsRead = useCallback((payload: MarkMessagesAsReadPayload) => {
    if (!chatSocket.connected) {
      console.log({
        code: 'SOCKET_NOT_CONNECTED',
        message: 'Socket do chat não está conectado.',
      });
      return;
    }

    chatSocket.emit('mark_messages_as_read', payload);
  }, []);

  const markMessagesAsReadDebounced = useCallback((payload: MarkMessagesAsReadPayload) => {
    if (markMessagesAsReadTimeoutRef.current) {
      clearTimeout(markMessagesAsReadTimeoutRef.current);
    }

    markMessagesAsReadTimeoutRef.current = setTimeout(() => {
      if (!chatSocket.connected) {
        console.log({
          code: 'SOCKET_NOT_CONNECTED',
          message: 'Socket do chat não está conectado.',
        });
        return;
      }

      chatSocket.emit('mark_messages_as_read', payload);
    }, 500);
  }, []);

  return {
    joinChat,
    leaveChat,
    getMessages,
    getUnreadMessages,
    sendMessage,
    markMessagesAsRead,
    markMessagesAsReadDebounced,
  };
}
