import { useCallback } from 'react';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { useAuthState } from './useAuthState';
import { useTwoFactorFlow } from './useTwoFactorFlow';
import { useAuthMutations } from './useAuthMutations';
import { AuthUser, AuthContextType } from './index';
import { logger } from '../../../shared/utils/logger';
import { saveTokens, clearTokens } from '../../../infrastructure/services/tokenStorage';

const updateTokenQueryCache = (queryClient: QueryClient, token: string, userId: string, enable: boolean) => {
  queryClient.setQueryData(['auth-tokens'], {
    accessToken: token,
    userId,
    hasAccessToken: !!token,
    hasUserId: !!userId,
    hasValidToken: !!token && !!userId,
    enable
  });
};

const clearTokenQueryCache = (queryClient: QueryClient) => {
  queryClient.setQueryData(['auth-tokens'], {
    accessToken: null,
    userId: null,
    hasAccessToken: false,
    hasUserId: false,
    hasValidToken: false,
    enable: false
  });
};

export const useAuthentication = (): AuthContextType => {
  const queryClient = useQueryClient();

  const {
    is2FAFlow,
    tempUserId,
    needsSetup,
    setNeedsSetup,
    isInTwoFactorFlow,
    startTwoFactorFlow,
    resetTwoFactorFlow,
  } = useTwoFactorFlow();

  const handleAuthSuccess = useCallback(async (response: {
    token?: string;
    userId: string;
    refreshToken?: string;
    userData?: AuthUser;
    twoFactorEnabled: boolean;
  }) => {
    logger.debug('Login successful:', { enabled: response.twoFactorEnabled });
    
    if (response.token) {
      // ✅ Aiškiai perduodame visus parametrus
      await saveTokens({ 
        token: response.token, 
        id: response.userId, 
        enable: response.twoFactorEnabled,
        refreshToken: response.refreshToken 
      });
      
      updateTokenQueryCache(queryClient, response.token, response.userId, response.twoFactorEnabled);
    }

    resetTwoFactorFlow();
  }, [queryClient, resetTwoFactorFlow]);

  // ✅ Pataisyta logout logika
  const resetAuthState = useCallback(async () => {
    logger.debug('Resetting auth state');
    
    // Išvalome localStorage
    clearTokens();
    
    // Išvalome React Query cache
    clearTokenQueryCache(queryClient);
    
    // Reset 2FA flow
    resetTwoFactorFlow();
    
    logger.debug('Auth state reset completed');
  }, [queryClient, resetTwoFactorFlow]);

  const {
    loginMutation,
    registerMutation,
    verify2FAMutation,
    setup2FAMutation,
    enable2FAMutation,
  } = useAuthMutations({
    handleAuthSuccess,
    startTwoFactorFlow,
    setNeedsSetup,
    resetAuthState,
  });

  const isLoading =
    loginMutation.isPending ||
    registerMutation.isPending ||
    verify2FAMutation.isPending ||
    setup2FAMutation.isPending ||
    enable2FAMutation.isPending;

  const firstError =
    loginMutation.error ||
    registerMutation.error ||
    verify2FAMutation.error;

  const clearAllErrors = useCallback(() => {
    loginMutation.reset();
    registerMutation.reset();
    verify2FAMutation.reset();
    setup2FAMutation.reset();
    enable2FAMutation.reset();
  }, [loginMutation, registerMutation, verify2FAMutation, setup2FAMutation, enable2FAMutation]);

  const verifyTwoFactorAuth = useCallback(async (userId: string, token: string) => {
    try {
      return await verify2FAMutation.mutateAsync({ userId, token });
    } catch (error) {
      logger.error('2FA verification failed:', error);
      return null;
    }
  }, [verify2FAMutation]);

  return {
    isLoading,
    error: firstError,
    signIn: loginMutation.mutateAsync,
    signUp: registerMutation.mutateAsync,
    verifyTwoFactorAuth,
    setupTwoFactorAuth: setup2FAMutation.mutateAsync,
    enableTwoFactorAuth: enable2FAMutation.mutateAsync,
    logout: resetAuthState,
    clearErrors: clearAllErrors,
    enterTwoFactorFlow: startTwoFactorFlow,
    clearAuthState: resetAuthState,

    loginError: loginMutation.error,
    registerError: registerMutation.error,
    verify2FAError: verify2FAMutation.error,
    setup2FAError: setup2FAMutation.error,
    enable2FAError: enable2FAMutation.error,
  };
};