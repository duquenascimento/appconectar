import React, { createContext, useContext, useMemo } from 'react';

import {
  GetMessagesPayload,
  GiftedChatMessage,
  JoinChatPayload,
  LeaveChatPayload,
  SendMessagePayload,
} from '../types/chatTypes';

import { useChatConnection } from '../hooks/useChatConnection';
import { useChatMessages } from '../hooks/useChatMessages';
import { MarkMessagesAsReadPayload, useChatActions } from '../hooks/useChatActions';

type ChatContextData = {
  isConnected: boolean;
  isLoadingChat: boolean;
  messages: GiftedChatMessage[];
  unreadMessages: number;
  roomConnected: boolean;
  joinChat: (payload: JoinChatPayload) => Promise<void>;
  leaveChat: (payload: LeaveChatPayload) => void;
  getMessages: (payload: GetMessagesPayload) => void;
  getUnreadMessages: (payload: LeaveChatPayload) => void;
  sendMessage: (payload: SendMessagePayload) => void;
  markMessagesAsRead: (payload: MarkMessagesAsReadPayload) => void;
  markMessagesAsReadDebounced: (payload: MarkMessagesAsReadPayload) => void;
  clearMessages: () => void;
  clearUnreadMessages: () => void;
};

const ChatContext = createContext<ChatContextData | null>(null);

type Props = {
  children: React.ReactNode;
};

export function ChatProvider({ children }: Props) {
  const { isConnected, isLoadingChat } = useChatConnection();
  const { messages, unreadMessages, clearMessages, clearUnreadMessages, roomConnected } =
    useChatMessages();
  const {
    joinChat,
    leaveChat,
    getMessages,
    getUnreadMessages,
    sendMessage,
    markMessagesAsRead,
    markMessagesAsReadDebounced,
  } = useChatActions();

  const value = useMemo(
    () => ({
      isConnected,
      isLoadingChat,

      messages,
      unreadMessages,
      roomConnected,

      joinChat,
      leaveChat,
      getMessages,
      getUnreadMessages,
      sendMessage,

      markMessagesAsRead,
      markMessagesAsReadDebounced,

      clearMessages,
      clearUnreadMessages,
    }),
    [
      isConnected,
      isLoadingChat,
      messages,
      unreadMessages,
      roomConnected,
      joinChat,
      leaveChat,
      getMessages,
      getUnreadMessages,
      sendMessage,
      markMessagesAsRead,
      markMessagesAsReadDebounced,
      clearMessages,
      clearUnreadMessages,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error('useChat must be used inside ChatProvider');
  }

  return context;
}
