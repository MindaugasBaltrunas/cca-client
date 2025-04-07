// store/middleware/tokenRefreshMiddleware.ts

import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { authApi } from '../../infrastructure/api/authApi';
import { logoutUser, setCredentials } from '../slices/authSlice';
import { tokenService } from '../../infrastructure/services/tokenService';
import { RootState } from '../store';

export const tokenRefreshMiddleware = createListenerMiddleware();

// Listen for API errors related to authentication
tokenRefreshMiddleware.startListening({
  matcher: isAnyOf(
    ...Object.values(authApi.endpoints)
      .filter(endpoint => endpoint.name !== 'refreshToken')
      .map(endpoint => endpoint.matchRejected)
  ),
  effect: async (action, { dispatch, getState }) => {
    // Check if error is due to authentication
    const { status } = (action.payload as { error?: { status?: number } })?.error || {};
    if (status === 401) {
      // Try to refresh the token
      const state = getState() as RootState;
      const refreshToken = state.auth.tokens?.refreshToken;
      
      if (refreshToken) {
        try {
          const result = await dispatch(
            authApi.endpoints.refreshToken.initiate(refreshToken)
          ).unwrap();
          
          // Save new tokens
          dispatch(setCredentials({
            token: result.token,
            refreshToken: result.refreshToken,
            expiresAt: result.expiresAt
          }));
          
          // The original request will be retried by RTK Query
        } catch (error) {
          // If refresh fails, log the user out
          dispatch(logoutUser());
        }
      } else {
        // No refresh token available, log the user out
        dispatch(logoutUser());
      }
    }
  }
});

// Start listening before API requests to check token expiration
tokenRefreshMiddleware.startListening({
  predicate: (action, currentState) => {
    // Skip for refresh token requests and non-API actions
    if (action.type.endsWith('/refreshToken')) return false;
    if (!action.type.startsWith('authApi')) return false;
    
    // Check if token should be refreshed
    return tokenService.shouldRefreshToken();
  },
  effect: async (action, { dispatch, getState }) => {
    const state = getState() as RootState;
    const refreshToken = state.auth.tokens?.refreshToken;
    
    if (refreshToken) {
      try {
        // Pause the original request - it will continue after token refresh
        const result = await dispatch(
          authApi.endpoints.refreshToken.initiate(refreshToken)
        ).unwrap();
        
        dispatch(setCredentials({
          token: result.token,
          refreshToken: result.refreshToken,
          expiresAt: result.expiresAt
        }));
        
        // Original request will continue with new token
      } catch (error) {
        dispatch(logoutUser());
      }
    }
  }
});