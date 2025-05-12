// useAuthentication.ts - Autentifikacijos hook (funkcinis stilius)

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, IVerify2FAResponse, LoginState, SignInCredentials, SignUpData, secureTokenStorage } from '../../infrastructure/services';
import { queryKeys } from '../../utils/queryKeys';


export const useAuthentication = () => {
  const queryClient = useQueryClient();
  const [twoFactorLoginState, setTwoFactorLoginState] = useState<LoginState | null>(null);

  // Patikrinimas, ar vartotojas yra autentifikuotas
  const isAuthenticated = !!secureTokenStorage.getAccessToken() && !secureTokenStorage.isTokenExpired();

  // Atnaujina autentifikacijos būseną gavus naują žetoną
  const updateAuthState = useCallback(
    (data: { accessToken: string; userId: string }) => {
      const { accessToken, userId } = data;
      try {
        secureTokenStorage.saveTokens({
          token: accessToken
        });
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
      } catch (error) {
        console.error('Error updating auth state:', error);
      }
    },
    [queryClient]
  );

  // Apdoroja situaciją, kai reikalingas dviejų faktorių patvirtinimas
  const handleTwoFactorRequired = useCallback(
    (data: { userId?: string; accessToken?: string }, credentials?: SignInCredentials) => {
      if (data?.accessToken && data?.userId) {
        setTwoFactorLoginState({
          userId: data.userId,
          credentials: credentials || { email: '', password: '' },
        });
      }
    },
    []
  );

  // Gauna dabartinio vartotojo duomenis, jei yra prisijungęs
  const userQuery = useQuery({
    queryKey: queryKeys.auth.user,
    queryFn: authApi.getCurrentUser,
    enabled: isAuthenticated,
    refetchInterval: 30 * 60 * 1000, // Atnaujina kas 30 minučių
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutės
  });

  // Prisijungimo mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response, variables) => {
      try {
        if (response?.status === 'pending') {
          handleTwoFactorRequired(response.data || {}, variables);
          return;
        }
      } catch (error) {
        console.error('Error in login success handler:', error);
      }
    },
  });

  // Registracijos mutation
  const registerMutation = useMutation({
    mutationFn: authApi.register,
  });

  // 2FA verifikacijos mutation
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

  // 2FA nustatymo mutation
  const setup2FAMutation = useMutation({
    mutationFn: authApi.setup2FA,
  });

  // Autentifikacijos funkcijos
  const signIn = useCallback(
    (credentials: SignInCredentials) => loginMutation.mutateAsync(credentials),
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

  // Mutations būsenų konsolidavimas
  const mutations = [
    loginMutation,
    registerMutation,
  ];

  const isLoading =
    userQuery.isLoading || mutations.some((mutation) => mutation.isPending);

  // Klaidos būsenos konsolidavimas
  const error = userQuery.error || mutations.find((mutation) => mutation.error)?.error;

  // Grąžiname stabilų API objektą
  return useMemo(
    () => ({
      signIn,
      signUp,
      verifyTwoFactorAuth,
      setupTwoFactorAuth,

      // Būsenos ir duomenys
      user: userQuery.data,
      twoFactorLoginState,
      isAuthenticated,
      isLoading,
      error,
    }),
    [
      signIn,
      signUp,
      verifyTwoFactorAuth,
      setupTwoFactorAuth,
      userQuery.data,
      twoFactorLoginState,
      isAuthenticated,
      isLoading,
      error,
    ]
  );
};