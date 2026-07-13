// src/services/socket.ts
import { io } from 'socket.io-client';

export const chatSocket = io('https://chat-dev.conectarhortifruti.com.br', {
  transports: ['websocket'],
  autoConnect: false,
});
