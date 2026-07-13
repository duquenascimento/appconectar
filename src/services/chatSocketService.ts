// src/services/socket.ts
import { io } from 'socket.io-client';

export const chatSocket = io('https://fossilisable-overreliant-brunilda.ngrok-free.dev', {
  transports: ['websocket'],
  autoConnect: false,
});
