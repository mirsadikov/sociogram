import { configureStore } from '@reduxjs/toolkit';
// import Logger from 'redux-logger';
import authReducer from './slices/auth-slice';
import globalsReducer from './slices/globals-slice';
import chatsSlice from './slices/chats-slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    globals: globalsReducer,
    chats: chatsSlice,
  },
  // middleware: getDefaultMiddleware => getDefaultMiddleware().concat(Logger),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
