import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '..';
import { User } from '../../types';

type AuthState = {
  access_token: string | null;
  profile: User | null;
};

const initialState: AuthState = {
  access_token: localStorage.getItem('access_token') || null,
  profile: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<string>) => {
      state.access_token = action.payload;
      localStorage.setItem('access_token', action.payload);
    },
    setProfile: (state, action: PayloadAction<User>) => {
      state.profile = action.payload;
    }
  },
  extraReducers(builder) {
    builder.addCase('logout', (state) => {
      state.access_token = null;
      localStorage.removeItem('access_token');
    });
  },
});

export const { login,setProfile } = authSlice.actions;
export const getToken = (state: RootState) => state.auth.access_token;
export const getProfile = (state: RootState) => state.auth.profile;

export default authSlice.reducer;
