import { useState, useCallback, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';

import {
  authApi,
  IVerify2FAResponse,
  LoginState,
  SignUpData,
} from '../../infrastructure/services';
import {
  getAccessToken,
  saveTokens,
  getId,
} from '../../infrastructure/services/tokenStorage';
import { logger } from '../../shared/utils/logger';
import { Admin, User } from '../../shared/types/api.types';




export const useAuthentication = () => {
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [twoFactorUserId, setTwoFactorUserId] = useState<string | null>(null);
  // const [authStateVersion, setAuthStateVersion] = useState(0);
  const [currentUser, setCurrentUser] = useState<Admin | User | null>(null);

  const isAuthenticated = useMemo(() => {
    const token = getAccessToken();
    return !!token;
  }, []);

  const isInTwoFactorFlow = useMemo(() => {
    const token = getAccessToken();
    const userId = getId() || twoFactorUserId;
    return !!userId && !token && requiresTwoFactor;
  }, [requiresTwoFactor, twoFactorUserId]);

  const updateAuthState = useCallback((data: IVerify2FAResponse) => {
    saveTokens({ token: data.token || '', id: data.userId });

    if (data.token) {
      setRequiresTwoFactor(false);
      setTwoFactorUserId(null);
      // setAuthStateVersion(prev => prev + 1);
      if (data.data) {
        setCurrentUser(data.data);
      }
    } else {
      setTwoFactorUserId(data.userId ?? null);
    }
  }, []);

  const enterTwoFactorFlow = useCallback((userId: string) => {
    setRequiresTwoFactor(true);
    setTwoFactorUserId(userId);
    saveTokens({ token: '', id: userId });
  }, []);

  const clearAuthState = useCallback(() => {
    saveTokens({ token: '', id: '' });
    setRequiresTwoFactor(false);
    setTwoFactorUserId(null);
    setCurrentUser(null);
    // setAuthStateVersion(prev => prev + 1);
  }, []);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (response) => {
      const { data, status } = response || {};
      if (!data?.userId) {
        logger.error('Invalid login response: missing userId');
        return;
      }

      switch (status) {
        case 'pending':
          enterTwoFactorFlow(data.userId);
          break;
        case 'success':
          if (data.accessToken) {
            updateAuthState({
              token: data.accessToken,
              userId: data.userId,
              refreshToken: data.refreshToken ?? '',
              status: status
            });
          } else {
            logger.error('Login successful but missing accessToken');
          }
          break;
        default:
          logger.warn('Unexpected login status:', status);
          if (data.accessToken) {
            updateAuthState({
              token: data.accessToken,
              userId: data.userId,
              refreshToken: data.refreshToken ?? '',
              status: status
            });
          }
      }
    },
    onError: (error) => {
      logger.error('Login failed:', error);
      clearAuthState();
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (response) => {
      if (response?.data?.accessToken && response?.data?.userId) {
        updateAuthState({
          token: response.data.accessToken,
          userId: response.data.userId,
         refreshToken: response.data.refreshToken || '',
          status: response.status,
        });
      }
    },
  });

  const verify2FAMutation = useMutation({
    mutationFn: ({ userId, token }: { userId: string; token: string }) =>
      authApi.verify2FA(userId, token),
    onSuccess: (response: IVerify2FAResponse) => {
      updateAuthState({
        token: response.token,
        refreshToken: response.refreshToken,
        data: response.data,
        status: response.status,
      });
    },
  });

  const setup2FAMutation = useMutation({
    mutationFn: authApi.setup2FA,
    onSuccess: (response) => logger.debug('2FA setup successful:', response),
    onError: (error) => logger.error('2FA setup failed:', error),
  });

  const enable2FAMutation = useMutation({
    mutationFn: authApi.enable2FA,
    onSuccess: (response) => logger.debug('2FA enabled successfully:', response),
    onError: (error) => logger.error('2FA enable failed:', error),
  });

  const signIn = useCallback((credentials: LoginState) => loginMutation.mutateAsync(credentials), [loginMutation]);

  const signUp = useCallback((userData: SignUpData) => registerMutation.mutateAsync(userData), [registerMutation]);

  const verifyTwoFactorAuth = useCallback(
    async (userId: string, token: string): Promise<IVerify2FAResponse | null> => {
      try {
        const response = await verify2FAMutation.mutateAsync({ userId, token });
        return {
          token: response.token,
          refreshToken: response.refreshToken || response.token,
          data: response.data,
          status: response.status,
        };
      } catch (error) {
        logger.error('2FA verification failed:', error);
        return null;
      }
    },
    [verify2FAMutation]
  );

  const setupTwoFactorAuth = useCallback(async () => {
    try {
      return await setup2FAMutation.mutateAsync();
    } catch (error: any) {
      if (error.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        throw new Error('Rate limited. Please wait before trying again.');
      }
      throw error;
    }
  }, [setup2FAMutation]);

  const enableTwoFactorAuth = useCallback((token: string) => enable2FAMutation.mutateAsync(token), [enable2FAMutation]);

  const logout = useCallback(() => {
    clearAuthState();
  }, [clearAuthState]);

  const mutations = useMemo(() => [loginMutation, registerMutation, verify2FAMutation, setup2FAMutation, enable2FAMutation], [loginMutation, registerMutation, verify2FAMutation, setup2FAMutation, enable2FAMutation]);

  const isLoading = mutations.some(m => m.isPending);
  const error = mutations.find(m => m.error)?.error;

  const clearErrors = useCallback(() => {
    mutations.forEach(m => m.reset());
  }, [mutations]);

  const getCurrentUserId = useCallback(() => getId() || twoFactorUserId, [twoFactorUserId]);

  return {
    user: currentUser,
    isAuthenticated,
    isInTwoFactorFlow,
    requiresTwoFactor,
    isLoading,
    error,

    getCurrentUserId,

    signIn,
    signUp,
    verifyTwoFactorAuth,
    setupTwoFactorAuth,
    enableTwoFactorAuth,
    logout,
    clearErrors,

    enterTwoFactorFlow,
    clearAuthState,

    loginError: loginMutation.error,
    registerError: registerMutation.error,
    verify2FAError: verify2FAMutation.error,
    setup2FAError: setup2FAMutation.error,
    enable2FAError: enable2FAMutation.error,
  };
};