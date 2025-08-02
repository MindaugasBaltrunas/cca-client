import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../../../infrastructure/services';
import { logger } from '../../../shared/utils/logger';
import { saveTokens } from '../../../infrastructure/services/tokenStorage';
import { AuthUser } from './index';
import { TwoFactorSetupResponse } from '../../../shared/types/api.types';

export const useAuthMutations = ({
  handleAuthSuccess,
  startTwoFactorFlow,
  setNeedsSetup,
  resetAuthState,
}: {
  handleAuthSuccess: (response: any) => void;
  startTwoFactorFlow: (userId: string) => void;
  setNeedsSetup: (needsSetup: boolean) => void;
  resetAuthState: () => void;
}) => {
  const queryClient = useQueryClient();
  const updateAuthCache = (data: Partial<{
    accessToken: string | null;
    userId: string | null;
    refreshToken?: string;
    enable: boolean;
  }>) => {
    logger.debug('Updating auth cache with data:', data);
    queryClient.setQueryData(['auth-tokens'], (prev: any) => ({
      ...prev,
      ...data,
      enable: !!data.enable,
      hasAccessToken: !!data.accessToken,
      hasUserId: !!data.userId,
      hasValidToken: !!data.accessToken && !!data.userId,
    }));
  };

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (authResponse) => {
      const token = authResponse.data?.accessToken;
      const userId = authResponse.data?.userId;
      const refreshToken = authResponse.data?.refreshToken;
      const status = authResponse.status;
      const enabled = authResponse.data?.enabled ?? false;

      if (!userId || !token) {
        logger.error('Missing token or userId in login response');
        return;
      }

      // ✅ Update cache-driven auth state
      updateAuthCache({
        accessToken: token,
        userId,
        refreshToken,
        enable: enabled,
      });

      logger.debug('Login successful:', { enabled });

      // ✅ Persist to storage
      await saveTokens({
        token,
        id: userId,
        refreshToken,
        enable: enabled,
      });

      const isSuccess = status === 'success';
      const needsTwoFactorSetup = isSuccess && !enabled;
      const canCompleteLogin = isSuccess && enabled;

      if (!isSuccess) {
        logger.warn('Login status not success:', status);
        resetAuthState();
        return;
      }

      if (needsTwoFactorSetup) {
        startTwoFactorFlow(userId);
        return;
      }

      if (canCompleteLogin) {
        setNeedsSetup(!enabled);
        // ✅ KRITINĖ PATAISYMA: Perduodame teisingus parametrus
        handleAuthSuccess({
          token,
          userId,
          refreshToken,
          twoFactorEnabled: enabled, // ✅ Pridėtas trūkstamas parametras!
          userData: undefined // ✅ Explicit undefined
        });
      }
    },
    onError: (error) => {
      logger.error('Login failed:', error);
      resetAuthState();
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (authResponse) => {
      // ✅ Registration paprastai nereikalauja handleAuthSuccess
      // Arba jei reikia, perduokite teisingus parametrus:

      const token = authResponse.data?.accessToken;
      const userId = authResponse.data?.userId;
      const enabled = authResponse.data?.enabled ?? false;

      if (token && userId) {
        handleAuthSuccess({
          token,
          userId,
          refreshToken: authResponse.data?.refreshToken,
          twoFactorEnabled: enabled, // ✅ Pridėtas trūkstamas parametras!
          userData: authResponse.data as unknown as AuthUser
        });
      } else {
        // Jei registracija negrąžina token'ų, tiesiog log'iname
        logger.debug('Registration successful, no tokens provided');
      }
    },
    onError: (error) => logger.error('Registration failed:', error),
  });

  const verify2FAMutation = useMutation({
    mutationFn: ({ userId, token }: { userId: string; token: string }) =>
      authApi.verify2FA(userId, token),
    onSuccess: async (response: TwoFactorSetupResponse) => {
      await saveTokens({
        token: response.data.,
        id: response.userId ?? '',
        refreshToken: response.refreshToken,
        enable: true, // ✅ verified means enabled
      });

      updateAuthCache({
        accessToken: response.token,
        userId: response.userId ?? '',
        refreshToken: response.refreshToken,
        enable: true,
      });

      // ✅ KRITINĖ PATAISYMA: Perduodame teisingus parametrus
      handleAuthSuccess({
        token: response.token,
        userId: response.userId ?? '',
        refreshToken: response.refreshToken,
        twoFactorEnabled: true, // ✅ Pridėtas trūkstamas parametras!
        userData: response.data as AuthUser,
      });
    },
    onError: (error) => logger.error('2FA verification failed:', error),
  });

  const setup2FAMutation = useMutation({
    mutationFn: authApi.setup2FA,
    onSuccess: (response:TwoFactorSetupResponse) => logger.debug('2FA setup successful:', response),
    onError: (error) => logger.error('2FA setup failed:', error),
  });

  const enable2FAMutation = useMutation({
    mutationFn: authApi.enable2FA,
    onSuccess: async (response:TwoFactorSetupResponse) => {
      logger.info('2FA enabled successfully', response);

      updateAuthCache({ enable: true });
      await saveTokens({ token: '', id: '', enable: true });
      setNeedsSetup(false);
    },
    onError: (error) => logger.error('2FA enable failed:', error),
  });

  return {
    loginMutation,
    registerMutation,
    verify2FAMutation,
    setup2FAMutation,
    enable2FAMutation,
  };
};
