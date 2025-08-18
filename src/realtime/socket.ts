// src/realtime/socket.ts
import { io } from 'socket.io-client';

export const socket = io(import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3001', {
  autoConnect: false,
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};