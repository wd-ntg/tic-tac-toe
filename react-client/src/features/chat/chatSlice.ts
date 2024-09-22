// src/features/chat/chatSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChatState {
  messages: string[];
}

const initialState: ChatState = {
  messages: [],
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    messageReceived: (state, action: PayloadAction<string>) => {
      state.messages.push(action.payload);
    },
    sendMessage: (state, action: PayloadAction<string>) => {
      // Tin nhắn sẽ được xử lý bởi middleware và không cần phải xử lý trực tiếp ở đây.
    },
  },
});

export const { messageReceived, sendMessage } = chatSlice.actions;

export default chatSlice.reducer;
