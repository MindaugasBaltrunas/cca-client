import { useCallback } from 'react';
import { useAuthState } from './useAuthState';
import { useTwoFactorFlow } from './useTwoFactorFlow';
import { useAuthMutations } from './useAuthMutations';
import { AuthUser, AuthContextType } from './index';
import { logger } from '../../../shared/utils/logger';
import { saveTokens } from '../../../infrastructure/services/tokenStorage';

export const useAuthentication = (): AuthContextType => {
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

  const handleAuthSuccess = useCallback((response: {
    token?: string;
    userId: string;
    refreshToken?: string;
    userData?: AuthUser;
  }) => {
    logger.debug('Auth success:', response);

    if (response.token) {
      saveTokens({ token: response.token, id: response.userId });
    }

    resetTwoFactorFlow();

    if (response.userData) {
      setCurrentUser(response.userData);
    }
  }, [resetTwoFactorFlow, setCurrentUser]);

  const resetAuthState = useCallback(() => {
    logger.debug('Resetting auth state');
    saveTokens({ token: '', id: '' });
    resetTwoFactorFlow();
    setCurrentUser(null);
  }, [resetTwoFactorFlow, setCurrentUser]);

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
      const response = await verify2FAMutation.mutateAsync({ userId, token });
      return response;
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
