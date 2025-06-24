import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { authApi, IVerify2FAResponse, LoginState, SignUpData } from '../../infrastructure/services';
import { getAccessToken, isTokenExpired, saveTokens, getId } from '../../infrastructure/services/tokenStorage';
import { queryKeys } from '../../utils/queryKeys';
import { logger } from '../../shared/utils/logger';

interface TwoFactorState {
  userId: string;
  accessToken: string;
}

interface AuthState {
  accessToken?: string;
  userId: string;
}

export const useAuthentication = () => {
  const queryClient = useQueryClient();
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [twoFactorUserId, setTwoFactorUserId] = useState<string | null>(null);
  const [authStateVersion, setAuthStateVersion] = useState(0);

  const isAuthenticated = useMemo(() => {
    const token = getAccessToken();
    return !!token && !isTokenExpired();
  }, [authStateVersion]);
  const [isInTwoFactorFlow, setIsInTwoFactorFlow] = useState(false);

  useMemo(() => {
    // User is in 2FA flow if they have a userId but no valid token
    const checkTwoFactorFlow = async () => {
      const token = getAccessToken();
      const userId = getId() || twoFactorUserId;

      setIsInTwoFactorFlow(!!userId && (!token || (await isTokenExpired())) && requiresTwoFactor);
    };
    checkTwoFactorFlow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requiresTwoFactor, twoFactorUserId]);

  const updateAuthState = useCallback(
    (data: AuthState) => {
      // Save tokens based on what we have
      saveTokens({
        token: data.accessToken || '',
        id: data.userId
      });

      // If we have a full token, clear 2FA state
      if (data.accessToken) {
        setRequiresTwoFactor(false);
        setTwoFactorUserId(null);
        setAuthStateVersion(prev => prev + 1);
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
      } else {
        // Partial auth state - store userId for 2FA
        setTwoFactorUserId(data.userId);
      }
    },
    [queryClient]
  );

  const enterTwoFactorFlow = useCallback((userId: string) => {
    setRequiresTwoFactor(true);
    setTwoFactorUserId(userId);
    // Store userId temporarily but don't set full auth state
    saveTokens({
      token: '',
      id: userId
    });
  }, []);

  const clearAuthState = useCallback(() => {
    saveTokens({ token: '', id: '' });
    setRequiresTwoFactor(false);
    setTwoFactorUserId(null);
    queryClient.clear();
  }, [queryClient]);

  const userQuery = useQuery({
    queryKey: queryKeys.auth.user,
    queryFn: authApi.getCurrentUser,
    enabled: isAuthenticated, // Only fetch when fully authenticated
    refetchInterval: 30 * 60 * 1000,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      logger.debug('Login response:', response);

      const { data, status } = response || {};
      if (!data?.userId) {
        logger.error('Invalid login response: missing userId');
        return;
      }

      switch (status) {
        case 'pending':
          // 2FA required - store userId but don't set full auth
          logger.debug('2FA required for user:', data.userId);
          enterTwoFactorFlow(data.userId);
          break;

        case 'success':
          // Full authentication successful
          logger.debug('Login successful for user:', data.userId);
          if (data.accessToken) {
            updateAuthState({
              accessToken: data.accessToken,
              userId: data.userId,
            });
          } else {
            logger.error('Login successful but missing accessToken');
          }
          break;

        default:
          logger.warn('Unexpected login status:', status);
          // Handle as error or fall back to checking for accessToken
          if (data.accessToken) {
            updateAuthState({
              accessToken: data.accessToken,
              userId: data.userId,
            });
          }
      }
    },
    onError: (error) => {
      logger.error('Login failed:', error);
      clearAuthState();
    }
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (response) => {
      if (response?.data?.accessToken && response?.data?.userId) {
        updateAuthState({
          accessToken: response.data.accessToken,
          userId: response.data.userId,
        });
      }
    },
  });

  const verify2FAMutation = useMutation({
    mutationFn: (params: { userId: string; token: string }) =>
      authApi.verify2FA(params.userId, params.token),
    onSuccess: (response: IVerify2FAResponse) => {
      updateAuthState({
        accessToken: response.token,
        userId: response.data.id,
      });
    },
  });

  const setup2FAMutation = useMutation({
    mutationFn: authApi.setup2FA,
  });

  const enable2FAMutation = useMutation({
    mutationFn: authApi.enable2FA,
  });

  // Actions
  const signIn = useCallback(
    (credentials: LoginState) => loginMutation.mutateAsync(credentials),
    [loginMutation]
  );

  const signUp = useCallback(
    (userData: SignUpData) => registerMutation.mutateAsync(userData),
    [registerMutation]
  );

  const verifyTwoFactorAuth = useCallback(
    (userId: string, code: string) => verify2FAMutation.mutateAsync({ userId, token: code }),
    [verify2FAMutation]
  );

  const setupTwoFactorAuth = useCallback(
    () => setup2FAMutation.mutateAsync(),
    [setup2FAMutation]
  );

  const enableTwoFactorAuth = useCallback(
    (token: string) => enable2FAMutation.mutateAsync(token),
    [enable2FAMutation]
  );

  const logout = useCallback(() => {
    clearAuthState();
  }, [clearAuthState]);

  const mutations = useMemo(
    () => [loginMutation, registerMutation, verify2FAMutation, setup2FAMutation, enable2FAMutation],
    [loginMutation, registerMutation, verify2FAMutation, setup2FAMutation, enable2FAMutation]
  );

  const isLoading = userQuery.isLoading || mutations.some(mutation => mutation.isPending);

  const error = userQuery.error || mutations.find(mutation => mutation.error)?.error;

  const clearErrors = useCallback(() => {
    mutations.forEach(mutation => mutation.reset());
  }, [mutations]);

  // Helper to get current user ID (for 2FA flow)
  const getCurrentUserId = useCallback(() => {
    return getId() || twoFactorUserId;
  }, [twoFactorUserId]);

  return {
    // User state
    user: userQuery.data,
    isAuthenticated,
    isInTwoFactorFlow,
    requiresTwoFactor,
    isLoading,
    error,

    // Helper functions
    getCurrentUserId,

    // Actions
    signIn,
    signUp,
    verifyTwoFactorAuth,
    setupTwoFactorAuth,
    enableTwoFactorAuth,
    logout,
    clearErrors,

    // Additional actions for 2FA flow
    enterTwoFactorFlow,
    clearAuthState,

    // Individual errors
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    verify2FAError: verify2FAMutation.error,
    setup2FAError: setup2FAMutation.error,
    enable2FAError: enable2FAMutation.error,
  };
};