// socketSlice.js
import { createSlice } from '@reduxjs/toolkit';
import io from 'socket.io-client';

const socket = io('https://tic-tac-toe-server-bdfp.onrender.com'); // Thay bằng URL server của bạn

const socketSlice = createSlice({
  name: 'socket',
  initialState: {
    socket: socket,
    isConnected: false,
  },
  reducers: {
    connect(state) {
      state.isConnected = true;
    },
    disconnect(state) {
      state.isConnected = false;
    },
  },
});

export const { connect, disconnect } = socketSlice.actions;
export default socketSlice.reducer;
