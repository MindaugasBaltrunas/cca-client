import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../../../infrastructure/services';
import { logger } from '../../../shared/utils/logger';
import { saveTokens } from '../../../infrastructure/services/tokenStorage';
import { AuthCacheData, AuthMutationHandlers, AuthResponse, AuthTokens, AuthUser, LoginState, SignUpData, TwoFactorSetupResponse, VerifyTwoFactorParams } from '../../../shared/types/api.types';

export const useAuthMutations = ({
  handleAuthSuccess,
  startTwoFactorFlow,
  setNeedsSetup,
  resetAuthState,
}: AuthMutationHandlers) => {
  const queryClient = useQueryClient();

  const updateAuthCache = (data: Partial<AuthTokens>): void => {
    logger.debug('Updating auth cache with data:', data);

    queryClient.setQueryData<AuthCacheData>(['auth-tokens'], (prev) => {
      const accessToken: string | null = data.accessToken ?? prev?.accessToken ?? null;
      const refreshToken: string | undefined = data.refreshToken ?? prev?.refreshToken;
      const userId: string | null = data.userId ?? prev?.userId ?? null;
      const enable: boolean = data.enable ?? prev?.enable ?? false;

      return {
        accessToken,
        refreshToken,
        userId,
        enable,
        hasAccessToken: !!accessToken,
        hasUserId: !!userId,
        hasValidToken: !!accessToken && !!userId,
      };
    });
  };
  ;

  const processAuthResponse = async (
    authResponse: AuthResponse,
    isRegistration = false
  ): Promise<void> => {
    const { token, userId, refreshToken, enabled, expiresAt } = extractAuthData(authResponse);

    if (!isValidAuthData(token, userId)) {
      logger.error('Missing token or userId in auth response');
      resetAuthState();
      return;
    }

    await updateAuthStateAndStorage({
      token: token!,
      userId: userId!,
      refreshToken,
      enabled: enabled ?? false,
      expiresAt: expiresAt !== undefined ? Number(expiresAt) : undefined,
    });

    const authStatus = determineAuthStatus(authResponse.success, enabled);
    await handleAuthStatus(authStatus, {
      token: token!,
      userId: userId!,
      refreshToken,
      enabled: enabled ?? false,
      userData: undefined,
    });
  };

  const extractAuthData = (authResponse: AuthResponse) => ({
    token: authResponse.data?.accessToken,
    userId: authResponse.data?.userId,
    refreshToken: authResponse.data?.refreshToken,
    enabled: authResponse.data?.enabled,
    expiresAt: authResponse.data?.expiresAt,
  });

  const isValidAuthData = (token?: string, userId?: string): boolean => {
    return Boolean(token && userId);
  };

  const updateAuthStateAndStorage = async (params: {
    token: string;
    userId: string;
    refreshToken?: string;
    enabled: boolean;
    expiresAt?: number;
  }): Promise<void> => {
    const { token, userId, refreshToken, enabled } = params;

    updateAuthCache({
      accessToken: token,
      userId,
      refreshToken,
      enable: enabled,
    });

    await saveTokens({
      token,
      id: userId,
      refreshToken,
      enable: enabled,
    });
  };

  const determineAuthStatus = (success: boolean, enabled?: boolean) => ({
    isSuccess: success,
    needsTwoFactorSetup: success && !enabled,
    canCompleteLogin: success && enabled,
  });

  const handleAuthStatus = async (
    authStatus: ReturnType<typeof determineAuthStatus>,
    authData: {
      token: string;
      userId: string;
      refreshToken?: string;
      enabled: boolean;
      userData?: AuthUser;
    }
  ): Promise<void> => {
    const { isSuccess, needsTwoFactorSetup, canCompleteLogin } = authStatus;

    if (!isSuccess) {
      logger.warn('Auth status not success:', authStatus);
      resetAuthState();
      return;
    }

    if (needsTwoFactorSetup) {
      startTwoFactorFlow(authData.userId);
      return;
    }

    if (canCompleteLogin) {
      setNeedsSetup(!authData.enabled);
      handleAuthSuccess({
        token: authData.token,
        userId: authData.userId,
        refreshToken: authData.refreshToken,
        twoFactorEnabled: authData.enabled,
        userData: authData.userData,
      });
    }
  };

  const loginMutation = useMutation<AuthResponse, Error, LoginState>({
    mutationFn: async (credentials) => {
      const result = await authApi.login(credentials);
      if ('success' in result && 'meta' in result) {
        return result as AuthResponse;
      }
      throw new Error((result as any)?.message || 'Login failed');
    },
    onSuccess: (authResponse: AuthResponse) => processAuthResponse(authResponse),
    onError: (error: Error) => {
      logger.error('Login failed:', error);
      resetAuthState();
    },
  });

  const registerMutation = useMutation<AuthResponse, Error, SignUpData>({
    mutationFn: async (userData) => {
      const result = await authApi.register(userData);
      if ('success' in result && 'meta' in result) {
        return result as AuthResponse;
      }
      throw new Error((result as any)?.message || 'Registration failed');
    },
    onSuccess: (authResponse: AuthResponse) => processAuthResponse(authResponse, true),
    onError: (error: Error) => {
      logger.error('Registration failed:', error);
      resetAuthState();
    },
  });

  const verify2FAMutation = useMutation({
    mutationFn: ({ userId, token }: VerifyTwoFactorParams) =>
      authApi.verify2FA(userId, token),
    onSuccess: async (response: TwoFactorSetupResponse) => {
      const { token, userId, refreshToken } = extractTwoFactorTokens(response);

      if (!isValidAuthData(token, userId)) {
        logger.error('Invalid 2FA verification response');
        return;
      }

      await updateAuthStateAndStorage({
        token: token!,
        userId: userId!,
        refreshToken,
        enabled: true,
      });

      handleAuthSuccess({
        token: token!,
        userId: userId!,
        refreshToken,
        twoFactorEnabled: true,
        userData: response.data.user as AuthUser,
      });
    },
    onError: (error: Error) => {
      logger.error('2FA verification failed:', error);
    },
  });

  const extractTwoFactorTokens = (response: TwoFactorSetupResponse) => ({
    token: response.data.token,
    userId: response.data.user?.id,
    refreshToken: response.data.refreshToken,
  });

  const setup2FAMutation = useMutation({
    mutationFn: authApi.setup2FA,
    onSuccess: (response: TwoFactorSetupResponse) => {
      logger.debug('2FA setup successful:', response);
    },
    onError: (error: Error) => {
      logger.error('2FA setup failed:', error);
    },
  });

  const enable2FAMutation = useMutation<AuthResponse, Error, string>({
    mutationFn: async (credentials) => {
      const result = await authApi.enable2FA;
      if ('success' in result && 'meta' in result) {
        return result as unknown as AuthResponse;
      }
      throw new Error((result as any)?.message || 'Login failed');
    },
    onSuccess: async (response) => {
      logger.info('2FA enabled successfully', response);

      updateAuthCache({ enable: true });

      await saveTokens({
        token: response.data?.accessToken || '',
        id: response.data?.userId || '',
        enable: response.data?.enabled ? true : false
      });

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