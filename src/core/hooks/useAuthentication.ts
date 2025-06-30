import { useState, useCallback, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  authApi,
  IVerify2FAResponse,
  LoginState,
  SignUpData,
} from '../../infrastructure/services';
import { saveTokens } from '../../infrastructure/services/tokenStorage';
import { logger } from '../../shared/utils/logger';
import { Admin, User } from '../../shared/types/api.types';
import { useTokenData } from './useTokenData';
import { useAuthActions } from './useAuthActions';
import type { AuthenticationState, AuthenticationActions } from './types';

/**
 * Comprehensive authentication hook
 * Manages login, registration, 2FA, and user state
 * Integrates with centralized token management
 */
export const useAuthentication = (): AuthenticationState & AuthenticationActions & {
  tokenData?: any;
  loginError: any;
  registerError: any;
  verify2FAError: any;
  setup2FAError: any;
  enable2FAError: any;
} => {
  // Local state for 2FA flow
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [twoFactorUserId, setTwoFactorUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<Admin | User | null>(null);

  // Use centralized token data
  const { data: tokenData, isLoading: isTokenLoading } = useTokenData();
  const { refreshAuth, clearAuth } = useAuthActions();

  // Computed authentication states using centralized data
  const isAuthenticated = useMemo(() => {
    return tokenData?.hasAccessToken ?? false;
  }, [tokenData?.hasAccessToken]);

  const isInTwoFactorFlow = useMemo(() => {
    const hasToken = tokenData?.hasAccessToken ?? false;
    const userId = tokenData?.userId || twoFactorUserId;
    return !!userId && !hasToken && requiresTwoFactor;
  }, [tokenData?.hasAccessToken, tokenData?.userId, twoFactorUserId, requiresTwoFactor]);

  // Auth state management with cache integration
  const updateAuthState = useCallback((data: IVerify2FAResponse) => {
    // Save tokens to storage
    saveTokens({ token: data.token || '', id: data.userId });

    if (data.token) {
      setRequiresTwoFactor(false);
      setTwoFactorUserId(null);
      if (data.data) {
        setCurrentUser(data.data);
      }
      // Refresh cache to sync with new tokens
      refreshAuth();
    } else {
      setTwoFactorUserId(data.userId ?? null);
    }
  }, [refreshAuth]);

  const enterTwoFactorFlow = useCallback((userId: string) => {
    setRequiresTwoFactor(true);
    setTwoFactorUserId(userId);
    saveTokens({ token: '', id: userId });
    // Refresh cache to reflect partial auth state
    refreshAuth();
  }, [refreshAuth]);

  const clearAuthState = useCallback(() => {
    saveTokens({ token: '', id: '' });
    setRequiresTwoFactor(false);
    setTwoFactorUserId(null);
    setCurrentUser(null);
    // Clear all auth cache
    clearAuth();
  }, [clearAuth]);

  // Login mutation with integrated cache management
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      const { data, status } = response || {};
      if (!data?.userId) {
        logger.error('Invalid login response: missing userId');
        return;
      }

      switch (status) {
        case 'pending':
          enterTwoFactorFlow(data.userId);
          break;
        case 'success':
          if (data.accessToken) {
            updateAuthState({
              token: data.accessToken,
              userId: data.userId,
              refreshToken: data.refreshToken ?? '',
              status: status,
            });
          } else {
            logger.error('Login successful but missing accessToken');
          }
          break;
        default:
          logger.warn('Unexpected login status:', status);
          if (data.accessToken) {
            updateAuthState({
              token: data.accessToken,
              userId: data.userId,
              refreshToken: data.refreshToken ?? '',
              status: status,
            });
          }
      }
    },
    onError: (error) => {
      logger.error('Login failed:', error);
      clearAuthState();
    },
  });

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (response) => {
      if (response?.data?.accessToken && response?.data?.userId) {
        updateAuthState({
          token: response.data.accessToken,
          userId: response.data.userId,
          refreshToken: response.data.refreshToken || '',
          status: response.status,
        });
      }
    },
    onError: (error) => {
      logger.error('Registration failed:', error);
    },
  });

  // 2FA verification mutation
  const verify2FAMutation = useMutation({
    mutationFn: ({ userId, token }: { userId: string; token: string }) =>
      authApi.verify2FA(userId, token),
    onSuccess: (response: IVerify2FAResponse) => {
      updateAuthState({
        token: response.token,
        refreshToken: response.refreshToken,
        data: response.data,
        status: response.status,
        userId: response.userId
      });
    },
    onError: (error) => {
      logger.error('2FA verification failed:', error);
    },
  });

  // 2FA setup mutation
  const setup2FAMutation = useMutation({
    mutationFn: authApi.setup2FA,
    onSuccess: (response) => {
      logger.debug('2FA setup successful:', response);
    },
    onError: (error) => {
      logger.error('2FA setup failed:', error);
    },
  });

  // 2FA enable mutation
  const enable2FAMutation = useMutation({
    mutationFn: authApi.enable2FA,
    onSuccess: (response) => {
      logger.debug('2FA enabled successfully:', response);
      refreshAuth();
    },
    onError: (error) => {
      logger.error('2FA enable failed:', error);
    },
  });

  // Public API methods
  const signIn = useCallback(
    (credentials: LoginState) => loginMutation.mutateAsync(credentials), 
    [loginMutation]
  );

  const signUp = useCallback(
    (userData: SignUpData) => registerMutation.mutateAsync(userData), 
    [registerMutation]
  );

  const verifyTwoFactorAuth = useCallback(
    async (userId: string, token: string): Promise<IVerify2FAResponse | null> => {
      try {
        const response = await verify2FAMutation.mutateAsync({ userId, token });
        return {
          token: response.token,
          refreshToken: response.refreshToken || response.token,
          data: response.data,
          status: response.status,
          userId: response.userId
        };
      } catch (error) {
        logger.error('2FA verification failed:', error);
        return null;
      }
    },
    [verify2FAMutation]
  );

  const setupTwoFactorAuth = useCallback(async () => {
    try {
      return await setup2FAMutation.mutateAsync();
    } catch (error: any) {
      if (error.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        throw new Error('Rate limited. Please wait before trying again.');
      }
      throw error;
    }
  }, [setup2FAMutation]);

  const enableTwoFactorAuth = useCallback(
    (token: string) => enable2FAMutation.mutateAsync(token), 
    [enable2FAMutation]
  );

  const logout = useCallback(() => {
    clearAuthState();
  }, [clearAuthState]);

  // Aggregate loading and error states
  const mutations = useMemo(() => [
    loginMutation, 
    registerMutation, 
    verify2FAMutation, 
    setup2FAMutation, 
    enable2FAMutation
  ], [loginMutation, registerMutation, verify2FAMutation, setup2FAMutation, enable2FAMutation]);

  const isLoading = isTokenLoading || mutations.some(m => m.isPending);
  const error = mutations.find(m => m.error)?.error;

  const clearErrors = useCallback(() => {
    mutations.forEach(m => m.reset());
  }, [mutations]);

  const getCurrentUserId = useCallback(() => {
    return tokenData?.userId || twoFactorUserId;
  }, [tokenData?.userId, twoFactorUserId]);

  return {
    // User state
    user: currentUser,
    isAuthenticated,
    isInTwoFactorFlow,
    requiresTwoFactor,
    
    // Loading and error states
    isLoading,
    error,

    // Utility methods
    getCurrentUserId,

    // Auth actions
    signIn,
    signUp,
    verifyTwoFactorAuth,
    setupTwoFactorAuth,
    enableTwoFactorAuth,
    logout,
    clearErrors,

    // Internal methods (for advanced use)
    enterTwoFactorFlow,
    clearAuthState,

    // Individual mutation errors
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    verify2FAError: verify2FAMutation.error,
    setup2FAError: setup2FAMutation.error,
    enable2FAError: enable2FAMutation.error,

    // Token data (from centralized management)
    tokenData,
  };
};