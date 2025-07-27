import { useCallback } from 'react';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { useAuthState } from './useAuthState';
import { useTwoFactorFlow } from './useTwoFactorFlow';
import { useAuthMutations } from './useAuthMutations';
import { AuthUser, AuthContextType } from './index';
import { logger } from '../../../shared/utils/logger';
import { saveTokens } from '../../../infrastructure/services/tokenStorage';

const updateTokenQueryCache = (queryClient: QueryClient, token: string, userId: string) => {
  queryClient.setQueryData(['auth-tokens'], {
    accessToken: token,
    userId,
    hasAccessToken: !!token,
    hasUserId: !!userId,
    hasValidToken: !!token && !!userId,
  });
};

export const useAuthentication = (): AuthContextType => {
  const queryClient = useQueryClient();
  const {
    currentUser,
    setCurrentUser,
    tokenData,
    tokenLoading,
    isAuthenticated,
  } = useAuthState();

  const {
    is2FAFlow,
    tempUserId,
    twoFactorEnabled,
    setTwoFactorEnabled,
    needsSetup,
    setNeedsSetup,
    isInTwoFactorFlow,
    startTwoFactorFlow,
    resetTwoFactorFlow,
  } = useTwoFactorFlow();

  logger.debug('useAuthentication initialized', { twoFactorEnabled });

  const handleAuthSuccess = useCallback(async (response: {
    token?: string;
    userId: string;
    refreshToken?: string;
    userData?: AuthUser;
  }) => {
    if (response.token) {
      await saveTokens({ token: response.token, id: response.userId });
      updateTokenQueryCache(queryClient, response.token, response.userId);
    }

    resetTwoFactorFlow();

    if (response.userData) {
      setCurrentUser(response.userData);
    }
  }, [queryClient, resetTwoFactorFlow, setCurrentUser]);

  const resetAuthState = useCallback(async () => {
    logger.debug('Resetting auth state');
    await saveTokens({ token: '', id: '' });
    await queryClient.invalidateQueries({ queryKey: ['auth-tokens'], exact: true });
    resetTwoFactorFlow();
    setCurrentUser(null);
  }, [queryClient, resetTwoFactorFlow, setCurrentUser]);

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
    setTwoFactorEnabled,
    resetAuthState,
  });

  const isLoading =
    tokenLoading ||
    loginMutation.isPending ||
    registerMutation.isPending ||
    verify2FAMutation.isPending ||
    setup2FAMutation.isPending ||
    enable2FAMutation.isPending;

  const firstError =
    loginMutation.error ||
    registerMutation.error ||
    verify2FAMutation.error;

  const getCurrentUserId = useCallback(() => {
    return tokenData?.userId || tempUserId;
  }, [tokenData?.userId, tempUserId]);

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
    user: currentUser,
    enabled: twoFactorEnabled,
    isAuthenticated,
    isInTwoFactorFlow,
    requiresTwoFactor: is2FAFlow || needsSetup,
    isLoading,
    error: firstError,
    signIn: loginMutation.mutateAsync,
    signUp: registerMutation.mutateAsync,
    verifyTwoFactorAuth,
    setupTwoFactorAuth: setup2FAMutation.mutateAsync,
    enableTwoFactorAuth: enable2FAMutation.mutateAsync,
    logout: resetAuthState,
    clearErrors: clearAllErrors,
    getCurrentUserId,
    enterTwoFactorFlow: startTwoFactorFlow,
    clearAuthState: resetAuthState,
    tokenData,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    verify2FAError: verify2FAMutation.error,
    setup2FAError: setup2FAMutation.error,
    enable2FAError: enable2FAMutation.error,
  };
};
