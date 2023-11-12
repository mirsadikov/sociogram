import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

type GlobalsState = {
  user_search: string;
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
  },
  extraReducers(builder) {
    builder.addCase('logout', (state) => {
      state.user_search = '';
    });
  },
});

export const { setUserSearch } = globalsSlice.actions;

export default globalsSlice.reducer;
