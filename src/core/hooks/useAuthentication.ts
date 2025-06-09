import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { authApi, IVerify2FAResponse, LoginState, SignUpData } from '../../infrastructure/services';
import { getAccessToken, isTokenExpired, saveTokens } from '../../infrastructure/services/tokenStorage';
import { queryKeys } from '../../utils/queryKeys';

export const useAuthentication = () => {
  const queryClient = useQueryClient();
  const [twoFactorLoginState, setTwoFactorLoginState] = useState<{ userId: string; accessToken: string } | null>(null);

  const isAuthenticated = !!getAccessToken() && !isTokenExpired();

  const updateAuthState = useCallback(
    (data: { accessToken: string; userId: string }) => {
      const { accessToken, userId } = data;
      try {
        saveTokens({
          token: accessToken,
          id: userId
        });
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
      } catch (error) {
        console.error('Error updating auth state:', error);
      }
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

  const userQuery = useQuery({
    queryKey: queryKeys.auth.user,
    queryFn: authApi.getCurrentUser,
    enabled: isAuthenticated,
    refetchInterval: 30 * 60 * 1000, // Refresh every 30 minutes
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      try {
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
      } catch (error) {
        console.error('Error in login success handler:', error);
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
      try {
        updateAuthState({
          accessToken: response.token,
          userId: response.data.id,
        });
        setTwoFactorLoginState(null);
      } catch (error) {
        console.error('Error in 2FA verification success handler:', error);
      }
    },
  });

  const setup2FAMutation = useMutation({
    mutationFn: authApi.setup2FA,
  });

  const logout = useCallback(() => {
    try {
      // Clear tokens
      saveTokens({ token: '', id: '' });
      
      // Clear 2FA state
      setTwoFactorLoginState(null);
      
      // Clear all cached data
      queryClient.clear();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }, [queryClient]);

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

  const mutations = useMemo(
    () => [
      loginMutation,
      registerMutation,
      verify2FAMutation,
      setup2FAMutation,
    ],
    [loginMutation, registerMutation, verify2FAMutation, setup2FAMutation]
  );

  const isLoading =
    userQuery.isLoading || mutations.some((mutation) => mutation.isPending);

  const error = userQuery.error || mutations.find((mutation) => mutation.error)?.error;

  // Add helper for clearing errors
  const clearErrors = useCallback(() => {
    mutations.forEach(mutation => mutation.reset());
  }, [mutations]);

  return useMemo(
    () => ({
      // Actions
      signIn,
      signUp,
      verifyTwoFactorAuth,
      setupTwoFactorAuth,
      logout,
      clearErrors,

      // State
      user: userQuery.data,
      twoFactorLoginState,
      isAuthenticated,
      isLoading,
      error,
      
      // Individual mutation states for granular control
      loginError: loginMutation.error,
      registerError: registerMutation.error,
      verify2FAError: verify2FAMutation.error,
      setup2FAError: setup2FAMutation.error,
    }),
    [
      signIn,
      signUp,
      verifyTwoFactorAuth,
      setupTwoFactorAuth,
      logout,
      clearErrors,
      userQuery.data,
      twoFactorLoginState,
      isAuthenticated,
      isLoading,
      error,
      loginMutation.error,
      registerMutation.error,
      verify2FAMutation.error,
      setup2FAMutation.error,
    ]
  );
};