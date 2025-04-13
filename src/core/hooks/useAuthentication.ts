import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../../infrastructure/api/authApi';
import { tokenStorage } from '../../infrastructure/services/tokenStorage';
import { SignInCredentials, SignUpData, LoginState } from '../../shared/types/api.types';
import { queryKeys } from '../../utils/queryKeys';

export const useAuthentication = () => {
  const queryClient = useQueryClient();
  const [twoFactorLoginState, setTwoFactorLoginState] = useState<LoginState | null>(null);

  const isAuthenticated = !!tokenStorage.getToken() && !tokenStorage.isTokenExpired();

  const updateAuthState = useCallback(
    (data: { token: string; refreshToken: string; expiresAt: number }) => {
      try {
        tokenStorage.saveTokens({
          token: data.token,
          refreshToken: data.refreshToken,
          expiresAt: data.expiresAt,
        });
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
      } catch (error) {
        console.error('Error updating auth state:', error);
      }
    },
    [queryClient]
  );

  const handleTwoFactorRequired = useCallback(
    (data: { userId?: string; twoFactorRequired?: boolean }, credentials?: SignInCredentials) => {
      if (data?.twoFactorRequired && data?.userId) {
        setTwoFactorLoginState({
          userId: data.userId,
          credentials: credentials || { email: '', password: '' },
        });
        return true;
      }
      return false;
    },
    []
  );

  // Fetch the current user only when authenticated.
  const userQuery = useQuery({
    queryKey: queryKeys.auth.user, // now a stable constant!
    queryFn: authApi.getCurrentUser,
    enabled: isAuthenticated,
    refetchInterval: 30 * 60 * 1000, // refresh every 30 minutes
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  

  // Login mutation (regular user)
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data, variables) => {
      try {
        const requires2FA = handleTwoFactorRequired(data, variables);
        if (!requires2FA) {
          updateAuthState(data);
        }
      } catch (error) {
        console.error('Error in login success handler:', error);
      }
    },
  });

//   // Admin login mutation
//   const adminLoginMutation = useMutation({
//     mutationFn: (params: { credentials: SignInCredentials; adminPassword: string }) =>
//       authApi.adminLogin({ ...params.credentials, adminPassword: params.adminPassword }),
//     onSuccess: updateAuthState,
//   });

//   // Registration mutation
  const registerMutation = useMutation({
    mutationFn: authApi.register,
  });

//   // Logout mutation
//   const logoutMutation = useMutation({
//     mutationFn: authApi.logout,
//     onSettled: () => {
//       try {
//         tokenStorage.clearToken();
//         queryClient.resetQueries({ queryKey: queryKeys.auth.user });
//         setTwoFactorLoginState(null);
//       } catch (error) {
//         console.error('Error in logout handler:', error);
//       }
//     },
//   });

//   // 2FA verification mutation
//   const verify2FAMutation = useMutation({
//     mutationFn: (params: { userId: string; token: string }) =>
//       authApi.verify2FA(params.userId, params.token),
//     onSuccess: (data) => {
//       try {
//         updateAuthState(data);
//         setTwoFactorLoginState(null);
//       } catch (error) {
//         console.error('Error in 2FA verification success handler:', error);
//       }
//     },
//   });

  // 2FA setup mutation
  const setup2FAMutation = useMutation({
    mutationFn: authApi.setup2FA,
  });

//   // 2FA enable mutation
//   const enable2FAMutation = useMutation({
//     mutationFn: (token: string) => authApi.enable2FA(token),
//     onSuccess: () => {
//       try {
//         queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
//       } catch (error) {
//         console.error('Error invalidating queries after enabling 2FA:', error);
//       }
//     },
//   });

//   // 2FA disable mutation
//   const disable2FAMutation = useMutation({
//     mutationFn: (token: string) => authApi.disable2FA(token),
//     onSuccess: () => {
//       try {
//         queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
//       } catch (error) {
//         console.error('Error invalidating queries after disabling 2FA:', error);
//       }
//     },
//   });

//   // Token refresh mutation
//   const refreshTokenMutation = useMutation({
//     mutationFn: (refreshToken: string) => authApi.refreshToken(refreshToken),
//     onSuccess: updateAuthState,
//   });

//   // Automatic token refresh if the token is about to expire.
// useEffect(() => {
//   if (!isAuthenticated) return;

//   const refreshTokenIfNeeded = () => {
//     const refreshToken = tokenStorage.getRefreshToken();
//     if (refreshToken && tokenStorage.isTokenExpiringNear()) {
//       refreshTokenMutation.mutate(refreshToken, {
//         onSuccess: (data) => {
//           tokenStorage.saveTokens({ token: data.token, refreshToken: data.refreshToken, expiresAt: data.expiresAt });
//           queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
//         },
//         onError: (error) => {
//           console.error('Token refresh failed:', error);
//           tokenStorage.clearToken();
//           queryClient.resetQueries({ queryKey: queryKeys.auth.user });
//         },
//       });
//     }
//   };

//   refreshTokenIfNeeded();
//   const intervalId = setInterval(refreshTokenIfNeeded, 60000);
//   return () => clearInterval(intervalId);
// }, [isAuthenticated, queryClient]);

//   // Authentication action functions.
  const signIn = useCallback(
    (credentials: SignInCredentials) => loginMutation.mutateAsync(credentials),
    [loginMutation]
  );

//   const adminSignIn = useCallback(
//     (credentials: SignInCredentials, adminPassword: string) =>
//       adminLoginMutation.mutateAsync({ credentials, adminPassword }),
//     [adminLoginMutation]
//   );

  const signUp = useCallback(
    (userData: SignUpData) => registerMutation.mutateAsync(userData),
    [registerMutation]
  );

  // const signOut = useCallback(
  //   (userId: string) => logoutMutation.mutateAsync(userId),
  //   [logoutMutation]
  // );

  // const verifyTwoFactorAuth = useCallback(
  //   (userId: string, code: string) => verify2FAMutation.mutateAsync({ userId, token: code }),
  //   [verify2FAMutation]
  // );

  const setupTwoFactorAuth = useCallback(
    () => setup2FAMutation.mutateAsync(),
    [setup2FAMutation]
  );

  // const enableTwoFactorAuth = useCallback(
  //   (code: string) => enable2FAMutation.mutateAsync(code),
  //   [enable2FAMutation]
  // );

  // const disableTwoFactorAuth = useCallback(
  //   (code: string) => disable2FAMutation.mutateAsync(code),
  //   [disable2FAMutation]
  // );

  // const refreshAuthToken = useCallback(
  //   (refreshTokenValue: string) => refreshTokenMutation.mutateAsync(refreshTokenValue),
  //   [refreshTokenMutation]
  // );

  // const cancelTwoFactorVerification = useCallback(() => {
  //   setTwoFactorLoginState(null);
  // }, []);

  // Consolidate loading states from user query and mutations.
  const mutations = [
    loginMutation,
    // adminLoginMutation,
    registerMutation,
    // logoutMutation,
    // verify2FAMutation,
    // setup2FAMutation,
    // enable2FAMutation,
    // disable2FAMutation,
    // refreshTokenMutation,
  ];

  const isLoading =
    userQuery.isLoading || mutations.some((mutation) => mutation.isPending);

  // Consolidate error states.
  const error = userQuery.error || mutations.find((mutation) => mutation.error)?.error;

  // Stabilize and memoize the returned API.
  return useMemo(
    () => ({
      signIn,
      // adminSignIn,
      signUp,
      // signOut,
      // verifyTwoFactorAuth,
      setupTwoFactorAuth,
      // enableTwoFactorAuth,
      // disableTwoFactorAuth,
      // refreshAuthToken,
      // cancelTwoFactorVerification,

      // State and data.
      user: userQuery.data,
      twoFactorLoginState,
      isAuthenticated,
      isLoading,
      error,
    }),
    [
      signIn,
      // adminSignIn,
      signUp,
      // signOut,
      // verifyTwoFactorAuth,
      setupTwoFactorAuth,
      // enableTwoFactorAuth,
      // disableTwoFactorAuth,
      // refreshAuthToken,
      // cancelTwoFactorVerification,
      userQuery.data,
      twoFactorLoginState,
      isAuthenticated,
      isLoading,
      error,
    ]
  );
};
