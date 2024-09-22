// socketSlice.js
import { createSlice } from '@reduxjs/toolkit';
import io from 'socket.io-client';

const socket = io('http://localhost:9000'); // Thay bằng URL server của bạn

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
