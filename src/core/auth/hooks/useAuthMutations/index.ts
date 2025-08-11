import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProcessAuthResponse } from './flows';
import { authApi } from '../../../../infrastructure/services';
import { extractTwoFactorData, handleApiResponse } from './helpers';
import { logger } from '../../../../shared/utils/logger';
import { AuthResponse, TwoFactorSetupResponse, VerifyTwoFactorParams } from '../../../../shared/types/api.response.types';
import { AuthUser, LoginData, SignUpData } from '../../../../shared/types/auth.base.types';
import { AuthMutationHandlers } from '../../types/auth.context.types';

export const useAuthMutations = ({
  handleAuthSuccess,
  startTwoFactorFlow,
  setNeedsSetup,
  resetAuthState,
}: AuthMutationHandlers) => {
  const queryClient = useQueryClient();

  const handlersInternal = {
    handleAuthSuccess,
    startTwoFactorFlow,
    setNeedsSetup,
    resetAuthState,
  };

  const processAuthResponse = createProcessAuthResponse(queryClient, handlersInternal);

  const loginMutation = useMutation<AuthResponse, Error, LoginData>({
    mutationFn: async (credentials) => {
      const result = await authApi.login(credentials);
      return handleApiResponse(result as AuthResponse, 'Login failed');
    },
    onSuccess: processAuthResponse,
    onError: (error: Error) => {
      logger.error('Login failed:', error);
      resetAuthState();
    },
  });

  const registerMutation = useMutation<AuthResponse, Error, SignUpData>({
    mutationFn: async (userData) => {
      const result = await authApi.register(userData);
      return handleApiResponse(result as AuthResponse, 'Registration failed');
    },
    onSuccess: processAuthResponse,
    onError: (error: Error) => {
      logger.error('Registration failed:', error);
      resetAuthState();
    },
  });

  const verify2FAMutation = useMutation({
    mutationFn: ({ userId, token }: VerifyTwoFactorParams) =>
      authApi.verify2FA(userId, token),
    onSuccess: async (response: TwoFactorSetupResponse) => {
      const extractedData = extractTwoFactorData(response);
      const { token, userId, refreshToken, status, verified } = extractedData;

      if (!token || !userId) {
        logger.error('Invalid 2FA verification response');
        return;
      }

      try {
        await processAuthResponse({
          ...response,
          data: {
            accessToken: token,
            userId,
            refreshToken,
            auth: { enable: true, verified, status },
            user: response.data.user,
          },
          success: true,
        } as unknown as AuthResponse);

        await handleAuthSuccess({
          token: token!,
          userId: userId!,
          refreshToken,
          enabled: true,
          verified: verified ?? false,
          status: status ?? '',
          userData: response.data.user as AuthUser,
        });
      } catch (error) {
        logger.error('Failed to process 2FA verification:', error as any);
      }
    },
    onError: (error: Error) => {
      logger.error('2FA verification failed:', error);
    },
  });

  const setup2FAMutation = useMutation({
    mutationFn: authApi.setup2FA,
    onSuccess: (_response: TwoFactorSetupResponse) => {
      logger.info('2FA setup completed successfully');
    },
    onError: (error: Error) => {
      logger.error('2FA setup failed:', error);
    },
  });

  const enable2FAMutation = useMutation<AuthResponse, Error, string>({
    mutationFn: async (userId: string) => {
      const result = await authApi.enable2FA(userId);
      return handleApiResponse(result as AuthResponse, '2FA enable failed');
    },
    onSuccess: async (response: AuthResponse) => {
      const responseData = response.data?.auth;

      if (responseData) {
        queryClient.setQueryData(['auth-tokens'], (prev: any) => ({
          ...(prev ?? {}),
          enabled: responseData.enable ?? true,
          status: responseData.status,
        }));
      }

      setNeedsSetup(false);
    },
    onError: (error: Error) => {
      logger.error('2FA enable failed:', error);
    },
  });

  return {
    loginMutation,
    registerMutation,
    verify2FAMutation,
    setup2FAMutation,
    enable2FAMutation,
  } as const;
};