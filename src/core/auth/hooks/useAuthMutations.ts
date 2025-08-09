import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../../../infrastructure/services';
import { logger } from '../../../shared/utils/logger';
import { saveTokens } from '../../../infrastructure/services/tokenStorage';
import {
  AuthCacheData,
  AuthMutationHandlers,
  AuthResponse,
  AuthStatusValue,
  AuthTokens,
  AuthUser,
  LoginState,
  SignUpData,
  TwoFactorSetupResponse,
  VerifyTwoFactorParams
} from '../../../shared/types/api.types';

interface AuthStateUpdateParams {
  token: string;
  userId: string;
  refreshToken?: string;
  expiresAt?: number;
  verified?: boolean;
  status?: AuthStatusValue;
}

interface AuthHandlerData {
  token: string;
  userId: string;
  refreshToken?: string;
  enabled: boolean;
  verified?: boolean;
  status?: AuthStatusValue;
  userData?: AuthUser;
}

export const useAuthMutations = ({
  handleAuthSuccess,
  startTwoFactorFlow,
  setNeedsSetup,
  resetAuthState,
}: AuthMutationHandlers) => {
  const queryClient = useQueryClient();

  // Cache management
  const updateAuthCache = (data: Partial<AuthTokens>): void => {
    queryClient.setQueryData<AuthCacheData>(['auth-tokens'], (prev) => ({
      accessToken: data.accessToken ?? prev?.accessToken ?? null,
      refreshToken: data.refreshToken ?? prev?.refreshToken,
      userId: data.userId ?? prev?.userId ?? null,
      enable: data.enable ?? prev?.enable ?? false,
      verified: data.verified ?? prev?.verified ?? false,
      status: data.status ?? prev?.status,
      hasAccessToken: !!(data.accessToken ?? prev?.accessToken),
      hasUserId: !!(data.userId ?? prev?.userId),
      hasValidToken: !!(data.accessToken ?? prev?.accessToken) && !!(data.userId ?? prev?.userId),
    }));
  };

  // Data extraction utilities
  const extractAuthData = (authResponse: AuthResponse) => ({
    token: authResponse.data?.accessToken,
    userId: authResponse.data?.userId,
    refreshToken: authResponse.data?.refreshToken,
    enabled: authResponse.data?.auth?.enable,
    verified: authResponse.data?.auth?.verified,
    expiresAt: authResponse.data?.expiresAt,
    status: authResponse.data?.auth?.status,
  });

  const extractTwoFactorData = (response: TwoFactorSetupResponse) => ({
    token: response.data.token,
    userId: response.data.user?.id,
    refreshToken: response.data.refreshToken,
    status: response.data.auth.status,
    verified: response.data.auth.verified,
  });

  // Validation
  const isValidAuthData = (token?: string, userId?: string): boolean =>
    Boolean(token && userId);

  // State management
  const updateAuthStateAndStorage = async (params: AuthStateUpdateParams): Promise<void> => {
    const { token, userId, refreshToken, verified, status } = params;

    updateAuthCache({
      accessToken: token,
      userId,
      refreshToken,
      verified,
      status,
    });

    await saveTokens({
      token,
      id: userId,
      refreshToken,
    });
  };

  // Authentication flow logic
  const determineAuthStatus = (success: boolean, enabled?: boolean) => ({
    isSuccess: success,
    needsTwoFactorSetup: success && !enabled,
    canCompleteLogin: success && enabled,
  });

  const handleAuthFlow = async (authData: AuthHandlerData): Promise<void> => {
    const { token, userId, enabled, verified, status } = authData;

    const authStatus = determineAuthStatus(true, enabled);

    if (authStatus.needsTwoFactorSetup) {
      startTwoFactorFlow(userId);
      return;
    }

    if (authStatus.canCompleteLogin) {
      setNeedsSetup(!enabled);
      await handleAuthSuccess({
        token,
        userId,
        refreshToken: authData.refreshToken,
        enabled,
        verified: verified ?? false,
        status: status,
        userData: authData.userData,
      });
    }
  };

  const processAuthResponse = async (authResponse: AuthResponse): Promise<void> => {
    const extractedData = extractAuthData(authResponse);
    const { token, userId, refreshToken, enabled, verified, status, expiresAt } = extractedData;

    if (!isValidAuthData(token, userId)) {
      logger.error('Missing token or userId in auth response');
      resetAuthState();
      return;
    }

    if (!authResponse.success) {
      logger.warn('Auth response not successful');
      resetAuthState();
      return;
    }

    try {
      await updateAuthStateAndStorage({
        token: token!,
        userId: userId!,
        refreshToken,
        expiresAt: expiresAt ? Number(expiresAt) : undefined,
        verified,
        status,
      });

      await handleAuthFlow({
        token: token!,
        userId: userId!,
        refreshToken,
        enabled: enabled ?? false,
        verified,
        status,
      });
    } catch (error) {
      logger.error('Failed to process auth response:', error);
      resetAuthState();
    }
  };

  // API call handlers
  const handleApiResponse = <T>(result: T, errorMessage: string): T => {
    if (result && typeof result === 'object' && 'success' in result && 'meta' in result) {
      return result;
    }
    throw new Error((result as any)?.message || errorMessage);
  };

  // Mutations
  const loginMutation = useMutation<AuthResponse, Error, LoginState>({
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

      if (!isValidAuthData(token, userId)) {
        logger.error('Invalid 2FA verification response');
        return;
      }

      try {
        await updateAuthStateAndStorage({
          token: token!,
          userId: userId!,
          refreshToken,
          verified,
          status,
        });

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
        logger.error('Failed to process 2FA verification:', error);
      }
    },
    onError: (error: Error) => {
      logger.error('2FA verification failed:', error);
    },
  });

  const setup2FAMutation = useMutation({
    mutationFn: authApi.setup2FA,
    onSuccess: (response: TwoFactorSetupResponse) => {
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
      logger.info('2FA enabled successfully');

      const { accessToken, userId } = response.data || {};

      if (accessToken && userId) {
        updateAuthCache({ enable: true });

        await saveTokens({
          token: accessToken,
          id: userId,
        });
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