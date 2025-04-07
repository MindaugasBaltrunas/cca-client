import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TokenPair } from '../../core/domain/models/auth';
import { UserResponseData } from '../../shared/types/api.types';
import { tokenService } from '../../infrastructure/services/tokenService';

interface AuthState {
  user: UserResponseData | null;
  tokens: TokenPair | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  tokens: tokenService.getToken() ? {
    token: tokenService.getToken() || '',
    refreshToken: tokenService.getRefreshToken() || '',
    expiresAt: tokenService.getTokenExpiry()
  } : null,
  isAuthenticated: !!tokenService.getToken(),
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<TokenPair>) => {
      state.tokens = action.payload;
      state.isAuthenticated = true;
      state.error = null;
      
      // Save to localStorage
      tokenService.setToken(action.payload.token, action.payload.refreshToken);
    },
    setUser: (state, action: PayloadAction<UserResponseData>) => {
      state.user = action.payload;
    },
    logoutUser: (state) => {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      tokenService.clearTokens();
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    }
  }
});

export const {
  setCredentials,
  setUser,
  logoutUser,
  setError,
  clearError,
  setLoading
} = authSlice.actions;

export default authSlice.reducer;