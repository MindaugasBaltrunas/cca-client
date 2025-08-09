import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTwoFactorFlow } from './useTwoFactorFlow';
import { useAuthMutations } from './useAuthMutations';
import { logger } from '../../../shared/utils/logger';
import { saveTokens, clearTokens } from '../../../infrastructure/services/tokenStorage';
import { AuthSuccessPayload } from '../types/auth.types';
import { LoginState, SignUpData } from '../../../shared/types/api.types';

interface UseAuthenticationResult {
  isLoading: boolean;
  error: unknown;
  signIn: (data: LoginState) => Promise<any>;
  signUp: (data: SignUpData) => Promise<any>;
  verifyTwoFactorAuth: (userId: string, token: string) => Promise<any | null>;
  setupTwoFactorAuth: () => Promise<any>;
  enableTwoFactorAuth: (userId: string) => Promise<any>;
  logout: () => void;
  clearErrors: () => void;
  enterTwoFactorFlow: (userId: string) => void;
  clearAuthState: () => void;
  loginError: unknown;
  registerError: unknown;
  verify2FAError: unknown;
  setup2FAError: unknown;
  enable2FAError: unknown;
}

const useAuthentication = (): UseAuthenticationResult => {
  const queryClient = useQueryClient();
  const { setNeedsSetup, startTwoFactorFlow, resetTwoFactorFlow } = useTwoFactorFlow();

  const handleAuthSuccess = useCallback(async ({ token, userId, refreshToken, enabled, verified, status }: AuthSuccessPayload) => {
    if (token) {
      await saveTokens({ token, id: userId, refreshToken });
      queryClient.setQueryData(['auth-tokens'], {
        accessToken: token,
        userId,
        hasAccessToken: true,
        hasUserId: true,
        hasValidToken: true,
        enabled,
        status,
        verified: verified ?? false,
      });
    }
    resetTwoFactorFlow();
  }, [queryClient, resetTwoFactorFlow]);

  const resetAuthState = useCallback(() => {
    clearTokens();
    queryClient.setQueryData(['auth-tokens'], {
      accessToken: null,
      userId: null,
      hasAccessToken: false,
      hasUserId: false,
      hasValidToken: false,
      enable: false,
      status: '',
      verified: false,
    });
    resetTwoFactorFlow();
  }, [queryClient, resetTwoFactorFlow]);

  const authMutations = useAuthMutations({ handleAuthSuccess, startTwoFactorFlow, setNeedsSetup, resetAuthState });

  const isLoading = Object.values(authMutations).some(({ isPending }) => isPending);
  const firstError = authMutations.loginMutation.error || authMutations.registerMutation.error || authMutations.verify2FAMutation.error;

  const clearAllErrors = useCallback(() => {
    Object.values(authMutations).forEach((mutation) => mutation.reset());
  }, [authMutations]);

  const verifyTwoFactorAuth = useCallback(async (userId: string, token: string) => {
    try {
      return await authMutations.verify2FAMutation.mutateAsync({ userId, token });
    } catch (error) {
      logger.error('2FA verification failed:', error);
      return null;
    }
  }, [authMutations.verify2FAMutation]);

  return {
    isLoading,
    error: firstError,
    signIn: authMutations.loginMutation.mutateAsync,
    signUp: authMutations.registerMutation.mutateAsync,
    verifyTwoFactorAuth,
    setupTwoFactorAuth: authMutations.setup2FAMutation.mutateAsync,
    enableTwoFactorAuth: authMutations.enable2FAMutation.mutateAsync,
    logout: resetAuthState,
    clearErrors: clearAllErrors,
    enterTwoFactorFlow: startTwoFactorFlow,
    clearAuthState: resetAuthState,
    loginError: authMutations.loginMutation.error,
    registerError: authMutations.registerMutation.error,
    verify2FAError: authMutations.verify2FAMutation.error,
    setup2FAError: authMutations.setup2FAMutation.error,
    enable2FAError: authMutations.enable2FAMutation.error,
  };
};

export { useAuthentication };
