import { configureStore } from '@reduxjs/toolkit';
// import Logger from 'redux-logger';
import authReducer from './slices/auth-slice';
import globalsReducer from './slices/globals-slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    globals: globalsReducer,
  },
  // middleware: getDefaultMiddleware => getDefaultMiddleware().concat(Logger),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
