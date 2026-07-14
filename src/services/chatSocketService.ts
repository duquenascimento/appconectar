// src/services/socket.ts
import { io } from 'socket.io-client';

const CHAT_SOCKET_URL = process.env.EXPO_PUBLIC_CHAT_SOCKET_URL || '';

export const chatSocket = io(CHAT_SOCKET_URL, {
  transports: ['websocket'],
  autoConnect: false,
});
