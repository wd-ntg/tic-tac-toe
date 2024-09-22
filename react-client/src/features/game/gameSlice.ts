import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface GameState {
  data: any[]; 
  namePlayer: any;
  symbol: string,
  timeOut: number, // Sửa lại kiểu của data thành mảng
}

const initialState: GameState = {
  data: [],
  namePlayer: "",
  symbol: "",
  timeOut: 0  // Khởi tạo data là mảng rỗng
};

const GameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setDataGame: (state, action: PayloadAction<any>) => {
      state.data.push(action.payload); 
    },
    setDataNamePlayer: (state, action: PayloadAction<any>) => {
      state.namePlayer = action.payload;
    },
    setSymbol: (state, action: PayloadAction<any>) => {
      state.symbol = action.payload;
    },
    setTimeOutPlayer : (state, action: PayloadAction<any>) => {
      state.timeOut = action.payload;
    }
  },
});

export const { setDataGame, setDataNamePlayer, setSymbol, setTimeOutPlayer } = GameSlice.actions;

export default GameSlice.reducer;
