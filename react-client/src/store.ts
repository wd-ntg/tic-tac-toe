// src/store.ts

import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './features/chat/chatSlice';
import gameReducer from './features/game/gameSlice';
import { socketMiddleware } from './middleware/socketMiddleware';
import { Socket, io } from 'socket.io-client';
import socketReducer from './features/socketConnect/socketSlice';


interface SocketIOExtraArgument {
  socket: Socket;
}

// Khai báo kiểu cho `extraArgument` trong middleware
const socket: Socket = io('http://localhost:9000');

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    game: gameReducer,
    socket: socketReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        extraArgument: { socket } as SocketIOExtraArgument,
      },
    }).concat(socketMiddleware),
     
});

export type RootState = ReturnType<ReturnType<typeof configureStore>['getState']>;
export type AppDispatch = typeof store.dispatch;
