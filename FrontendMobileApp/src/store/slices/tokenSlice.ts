import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface TokenState {
  activeToken: any | null;
  queueStatus: {
    ahead: number;
    estimatedWait: number;
  } | null;
}

const initialState: TokenState = {
  activeToken: null,
  queueStatus: null,
};

const tokenSlice = createSlice({
  name: 'tokens',
  initialState,
  reducers: {
    setActiveToken: (state, action: PayloadAction<any>) => {
      state.activeToken = action.payload;
    },
    setQueueStatus: (
      state,
      action: PayloadAction<{ahead: number; estimatedWait: number}>,
    ) => {
      state.queueStatus = action.payload;
    },
    clearTokenData: state => {
      state.activeToken = null;
      state.queueStatus = null;
    },
  },
});

export const {setActiveToken, setQueueStatus, clearTokenData} =
  tokenSlice.actions;
export default tokenSlice.reducer;
