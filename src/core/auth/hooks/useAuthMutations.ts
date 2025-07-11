import { useMutation } from '@tanstack/react-query';
import { AuthUser } from './index';
import { authApi } from '../../../infrastructure/services';
import { logger } from '../../../shared/utils/logger';
import { saveTokens } from '../../../infrastructure/services/tokenStorage';
import { IVerify2FAResponse } from '../../../shared/types/api.types';

export const useAuthMutations = ({
  handleAuthSuccess,
  startTwoFactorFlow,
  setNeedsSetup,
  setTwoFactorEnabled,
  resetAuthState,
}: {
  handleAuthSuccess: (response: any) => void;
  startTwoFactorFlow: (userId: string) => void;
  setNeedsSetup: (needsSetup: boolean) => void;
  setTwoFactorEnabled: (enabled: boolean) => void;
  resetAuthState: () => void;
}) => {
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (authResponse) => {
      const token = authResponse.data?.accessToken;
      const userId = authResponse.data?.userId;
      const refreshToken = authResponse.data?.refreshToken;
      const status = authResponse.status;
      const enabled = authResponse.data?.enabled;

       logger.debug('Login response:', { 
        hasToken: !!token, 
        status, 
        enabled, 
        userId 
      });

     if (!userId) {
        logger.error('Login response missing userId');
        return;
      }

      if (!token) {
        logger.warn('Login response missing token');
        return;
      }

      setTwoFactorEnabled(enabled ?? false);

      if (status === 'success') {
        if (!enabled) {
          startTwoFactorFlow(userId);
        } else {
          saveTokens({ token, id: userId, refreshToken });
          setNeedsSetup(true);
          handleAuthSuccess({ token, userId, refreshToken, status });
        }
      } else {
        logger.warn('Login status not success:', status);
        resetAuthState();
      }
    },
    onError: (error) => {
      logger.error('Login failed:', error);
      resetAuthState();
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      handleAuthSuccess({ token: '', userId: '', refreshToken: '', userData: undefined });
    },
    onError: (error) => {
      logger.error('Registration failed:', error);
    },
  });

  const verify2FAMutation = useMutation({
    mutationFn: ({ userId, token }: { userId: string; token: string }) => authApi.verify2FA(userId, token),
    onSuccess: (response: IVerify2FAResponse) => {
      handleAuthSuccess({
        token: response.token,
        userId: response.userId ?? '',
        refreshToken: response.refreshToken,
        userData: response.data as AuthUser,
      });
    },
    onError: (error) => {
      logger.error('2FA verification failed:', error);
    },
  });

  const setup2FAMutation = useMutation({
    mutationFn: authApi.setup2FA,
    onSuccess: (response) => {
      logger.debug('2FA setup successful:', response);
    },
    onError: (error) => {
      logger.error('2FA setup failed:', error);
    },
  });

  const enable2FAMutation = useMutation({
    mutationFn: authApi.enable2FA,
    onSuccess: () => {
      logger.info('2FA enabled successfully');
      setTwoFactorEnabled(true);
      setNeedsSetup(false);
    },
    onError: (error) => {
      logger.error('2FA enable failed:', error);
    },
  });

  return {
    loginMutation,
    registerMutation,
    verify2FAMutation,
    setup2FAMutation,
    enable2FAMutation,
  };
};
