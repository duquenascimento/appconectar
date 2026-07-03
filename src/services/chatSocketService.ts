// src/services/socket.ts
import { io } from 'socket.io-client';

export const chatSocket = io('http://localhost:4000', {
  transports: ['websocket'],
  autoConnect: false,
});
