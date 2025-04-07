import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from './slices/authSlice';
import { authApi } from '../infrastructure/api/authApi';
import { tokenRefreshMiddleware } from './middleware/tokenRefreshMiddleware';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware()
    .concat(authApi.middleware)
    .prepend(tokenRefreshMiddleware.middleware),
});

// Setup listeners for automatic refetching
setupListeners(store.dispatch);

// Export RootState type - this creates a type that represents the complete state tree
export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;