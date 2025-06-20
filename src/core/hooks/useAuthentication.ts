import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { authApi, IVerify2FAResponse, LoginState, SignUpData } from '../../infrastructure/services';
import { getAccessToken, isTokenExpired, saveTokens } from '../../infrastructure/services/tokenStorage';
import { queryKeys } from '../../utils/queryKeys';

interface TwoFactorState {
  userId: string;
  accessToken: string;
}

export const useAuthentication = () => {
  const queryClient = useQueryClient();
  const [twoFactorLoginState, setTwoFactorLoginState] = useState<TwoFactorState | null>(null);

  const isAuthenticated = useMemo(() => {
    const token = getAccessToken();
    return !!token && !isTokenExpired();
  }, []);

  const updateAuthState = useCallback(
    (data: { accessToken: string; userId: string }) => {
      saveTokens({
        token: data.accessToken,
        id: data.userId
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
    },
    [queryClient]
  );

  const handleTwoFactorRequired = useCallback(
    (data: { userId?: string; accessToken?: string }) => {
      if (data?.accessToken && data?.userId) {
        setTwoFactorLoginState({
          accessToken: data.accessToken,
          userId: data.userId,
        });
      }
    },
    []
  );

  const clearAuthState = useCallback(() => {
    saveTokens({ token: '', id: '' });
    setTwoFactorLoginState(null);
    queryClient.clear();
  }, [queryClient]);

  const userQuery = useQuery({
    queryKey: queryKeys.auth.user,
    queryFn: authApi.getCurrentUser,
    enabled: isAuthenticated,
    refetchInterval: 30 * 60 * 1000,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      if (response?.status === 'pending') {
        handleTwoFactorRequired(response.data || {});
        return;
      }

      if (response?.status === 'success' && response.data?.accessToken && response.data?.userId) {
        updateAuthState({
          accessToken: response.data.accessToken,
          userId: response.data.userId,
        });
      }
    },
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
      setTwoFactorLoginState(null);
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

  return {
    // User state
    user: userQuery.data,
    isAuthenticated,
    isLoading,
    error,

    // Two-factor state
    twoFactorLoginState,

    // Actions
    signIn,
    signUp,
    verifyTwoFactorAuth,
    setupTwoFactorAuth,
    enableTwoFactorAuth,
    logout,
    clearErrors,

    // Individual errors
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    verify2FAError: verify2FAMutation.error,
    setup2FAError: setup2FAMutation.error,
    enable2FAError: enable2FAMutation.error,
  };
};