import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '..';

type AuthState = {
  access_token: string | null;
};

const initialState: AuthState = {
  access_token: localStorage.getItem('access_token') || null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<string>) => {
      state.access_token = action.payload;
      localStorage.setItem('access_token', action.payload);
    },
    logout: (state) => {
      state.access_token = null;
      localStorage.removeItem('access_token');
    },
  },
});

export const { login, logout } = authSlice.actions;
export const getToken = (state: RootState) => state.auth.access_token;

export default authSlice.reducer;
