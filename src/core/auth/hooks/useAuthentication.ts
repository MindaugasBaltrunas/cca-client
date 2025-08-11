import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTwoFactorFlow } from './useTwoFactorFlow';
import { logger } from '../../../shared/utils/logger';
import { saveTokens, clearTokens } from '../../../infrastructure/services/tokenStorage';
import {
  AuthSuccessPayload,
  LoginData,
  SignUpData,
} from '../../../shared/types/auth.base.types';
import { useAuthMutations } from './useAuthMutations';
import { AuthResponse } from '../../../shared/types/api.response.types';

type AuthMutationsReturn = ReturnType<typeof useAuthMutations>;

export const useAuthentication = () => {
  const queryClient = useQueryClient();
  const { setNeedsSetup, startTwoFactorFlow, resetTwoFactorFlow } = useTwoFactorFlow();

  const handleAuthSuccess = useCallback(
    async ({ token, userId, refreshToken, enabled, verified, status }: AuthSuccessPayload) => {
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
    },
    [queryClient, resetTwoFactorFlow]
  );

  const resetAuthState = useCallback(() => {
    clearTokens();
    queryClient.setQueryData(['auth-tokens'], {
      accessToken: null,
      userId: null,
      hasAccessToken: false,
      hasUserId: false,
      hasValidToken: false,
      enabled: false,
      status: '',
      verified: false,
    });
    resetTwoFactorFlow();
  }, [queryClient, resetTwoFactorFlow]);

  const authMutations = useAuthMutations({
    handleAuthSuccess,
    startTwoFactorFlow,
    setNeedsSetup,
    resetAuthState,
  });

const isLoading = Object.values(authMutations).some(
  (mutation: AuthMutationsReturn[keyof AuthMutationsReturn]) => mutation.isPending
);

  const firstError =
    authMutations.loginMutation.error ||
    authMutations.registerMutation.error ||
    authMutations.verify2FAMutation.error;

  const clearAllErrors = useCallback(() => {
    Object.values(authMutations).forEach((mutation) => mutation.reset());
  }, [authMutations]);

  const verifyTwoFactorAuth = useCallback(
    async (userId: string, token: string) => {
      try {
        return await authMutations.verify2FAMutation.mutateAsync({ userId, token });
      } catch (error) {
        logger.error('2FA verification failed:', error);
        return null;
      }
    },
    [authMutations.verify2FAMutation]
  );

  return {
    isLoading,
    error: firstError,
    signIn: authMutations.loginMutation.mutateAsync as unknown as (data: LoginData) => Promise<AuthResponse>,
    signUp: authMutations.registerMutation.mutateAsync as (data: SignUpData) => Promise<AuthResponse>,
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
