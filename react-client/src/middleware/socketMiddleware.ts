// src/middleware/socketMiddleware.ts

import { Middleware } from '@reduxjs/toolkit';
import { io, Socket } from 'socket.io-client';
import { RootState } from '../store';
import { messageReceived, sendMessage } from '../features/chat/chatSlice';
import { setDataGame } from '../features/game/gameSlice';

// Khởi tạo socket client
const socket: Socket = io('http://localhost:9000');

export const socketMiddleware: Middleware<{}, RootState> = ({ dispatch }) => {
  // Lắng nghe sự kiện 'message' từ server và dispatch hành động messageReceived
  socket.on('message', (message: string) => {
    dispatch(messageReceived(message));
  });
  
  return next => action => {
    if (sendMessage.match(action)) {
      // Gửi tin nhắn qua socket khi action 'sendMessage' được dispatch
      socket.emit('message', action.payload);
    }

    return next(action);
  };

  
};
