import { useState, useEffect, useCallback } from 'react';
import { chatSocket } from '../services/chatSocketService';
import { ChatMessage, GiftedChatMessage, SocketError } from '../types/chatTypes';

interface MessagesReadResponse {
  channelKey: string;
  readBy: 'restaurant' | 'supplier' | 'attendant';
  markedCount: number;
}

const mapChatMessageToGifted = (message: ChatMessage): GiftedChatMessage => ({
  _id: message.id,
  text: message.content,
  createdAt: new Date(message.createdAt),
  user: {
    _id: message.userId,
    name: message.userName,
  },
  userType: message.userType,
  channelKey: message.channelKey,
  read: message.read,
});

export function useChatMessages() {
  const [messages, setMessages] = useState<GiftedChatMessage[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<number>(0);
  const [roomConnected, setRoomConnected] = useState<boolean>(false);

  useEffect(() => {
    function handleSocketError(err: SocketError) {
      if (err.code === 'JOIN_CHAT_FAILED') {
        setRoomConnected(false);
        return;
      }
      console.log('Erro no chat socket:', err.message);
    }

    function handleJoinChatResponse() {
      setRoomConnected(true);
    }

    function handleMessagesResponse(response: ChatMessage[]) {
      const mappedMessages = response.map(mapChatMessageToGifted);
      setMessages(mappedMessages);
    }

    function handleUnreadMessagesResponse(response: number) {
      setUnreadMessages(response);
    }

    function handleNewMessage(message: ChatMessage) {
      setMessages((currentMessages) => [mapChatMessageToGifted(message), ...currentMessages]);
      if (message.userType === 'attendant') {
        setUnreadMessages((prev) => prev + 1);
      }
    }

    function handleMessageSentSuccess(message: ChatMessage) {
      setMessages((currentMessages) => [mapChatMessageToGifted(message), ...currentMessages]);
    }

    function handleMessagesRead(response: MessagesReadResponse) {
      setMessages((currentMessages) =>
        currentMessages.map((message) => {
          if (message.channelKey !== response.channelKey) {
            return message;
          }

          if (response.readBy === 'restaurant' && message.userType === 'attendant') {
            return {
              ...message,
              read: true,
            };
          }

          if (response.readBy === 'attendant' && message.userType === 'restaurant') {
            return {
              ...message,
              read: true,
            };
          }

          return message;
        }),
      );

      if (response.readBy === 'restaurant') {
        setUnreadMessages(0);
      }
    }

    chatSocket.on('error', handleSocketError);
    chatSocket.on('join_chat_response', handleJoinChatResponse);
    chatSocket.on('messages_response', handleMessagesResponse);
    chatSocket.on('unread_messages_response', handleUnreadMessagesResponse);
    chatSocket.on('new_message', handleNewMessage);
    chatSocket.on('message_sent_success', handleMessageSentSuccess);
    chatSocket.on('messages_read', handleMessagesRead);

    return () => {
      chatSocket.off('error', handleSocketError);
      chatSocket.off('join_chat_response', handleJoinChatResponse);
      chatSocket.off('messages_response', handleMessagesResponse);
      chatSocket.off('unread_messages_response', handleUnreadMessagesResponse);
      chatSocket.off('new_message', handleNewMessage);
      chatSocket.off('message_sent_success', handleMessageSentSuccess);
      chatSocket.off('messages_read', handleMessagesRead);
    };
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const clearUnreadMessages = useCallback(() => {
    setUnreadMessages(0);
  }, []);

  return {
    messages,
    unreadMessages,
    roomConnected,
    clearMessages,
    clearUnreadMessages,
  };
}
