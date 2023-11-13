import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';

type Notification = {
  content: string;
  sender: User
  created_at: string;
  type: string;
}

type GlobalsState = {
  user_search: string;
  notifications?: Notification[];
};

const initialState: GlobalsState = {
  user_search: '',
};

export const globalsSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUserSearch: (state, action: PayloadAction<string>) => {
      state.user_search = action.payload;
    },
    setNotifications: (state, action: PayloadAction<Notification>) => {
      state.notifications = [action.payload, ...(state.notifications || [])];
    }
  },
  extraReducers(builder) {
    builder.addCase('logout', (state) => {
      state.user_search = '';
    });
  },
});

export const { setUserSearch, setNotifications } = globalsSlice.actions;

export default globalsSlice.reducer;
