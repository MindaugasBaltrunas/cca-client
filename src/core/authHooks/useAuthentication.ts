import { useState, useCallback, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authApi, IVerify2FAResponse, LoginState, SignUpData } from '../../infrastructure/services';
import { saveTokens } from '../../infrastructure/services/tokenStorage';
import { useTokenData } from './useTokenData';
import { logger } from '../../shared/utils/logger';
import type { AuthenticationState, AuthenticationActions, AuthContextType, AuthUser } from './types';

export const useAuthentication = (): AuthContextType => {
  // ====================
  // 📊 STATE MANAGEMENT
  // ====================
  
  const [is2FAFlow, setIs2FAFlow] = useState(false);
  const [tempUserId, setTempUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>();
  const [needsSetup, setNeedsSetup] = useState(false);

  // 🎯 Centralized token data
  const { data: tokenData, isLoading: tokenLoading } = useTokenData();

  // ====================
  // 🧮 COMPUTED VALUES
  // ====================
  
  const isAuthenticated = useMemo(() => {
    const hasToken = !!tokenData?.hasAccessToken;
    const inFlow = is2FAFlow && !!tempUserId;
    
    logger.debug('Auth state check:', { hasToken, inFlow, needsSetup });
    return hasToken || inFlow;
  }, [tokenData?.hasAccessToken, is2FAFlow, tempUserId, needsSetup]);

  const isInTwoFactorFlow = useMemo(() => {
    // Case 1: Has token but needs 2FA setup
    if (tokenData?.hasAccessToken && needsSetup) {
      return true;
    }
    
    // Case 2: Login pending, no token yet
    if (is2FAFlow && !!tempUserId && !tokenData?.hasAccessToken) {
      return true;
    }
    
    return false;
  }, [is2FAFlow, tempUserId, tokenData?.hasAccessToken, needsSetup]);

  // ====================
  // 🔧 HELPER FUNCTIONS
  // ====================
  
  const handleAuthSuccess = useCallback((response: {
    token?: string;
    userId: string;
    refreshToken?: string;
    status?: string;
    userData?: AuthUser;
  }) => {
    logger.debug('Auth success:', response);
    
    if (response.token) {
      saveTokens({ 
        token: response.token, 
        id: response.userId 
      });
    }
    
    // Clear flow states
    setIs2FAFlow(false);
    setTempUserId(null);
    setNeedsSetup(false);
    
    // Set user data if provided
    if (response.userData) {
      setCurrentUser(response.userData);
    }
  }, []);

  const startTwoFactorFlow = useCallback((userId: string) => {
    logger.debug('Starting 2FA flow for user:', userId);
    
    setIs2FAFlow(true);
    setTempUserId(userId);
    setNeedsSetup(false);
  }, []);

  const resetAuthState = useCallback(() => {
    logger.debug('Resetting auth state');
    
    saveTokens({ token: '', id: '' });
    setIs2FAFlow(false);
    setTempUserId(null);
    setCurrentUser(null);
    setTwoFactorEnabled(undefined);
    setNeedsSetup(false);
  }, []);

  // ====================
  // 🔄 API MUTATIONS
  // ====================
  
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (authResponse) => {
      
      // ✅ PATAISYMAS: Naudojame teisingas properties iš AuthResponse
      // PAKEISKITE ŠIE PROPERTY NAMES PAGAL JŪSŲ TIKRĄ AuthResponse TYPE:
      const token = authResponse.data?.accessToken;
      const userId = authResponse.data?.userId;
      const refreshToken = authResponse.data?.refreshToken;
      const status = authResponse.status;
      const enabled = authResponse.data?.enabled;

      console.log('🔍 EXTRACTED VALUES:', { token, userId, refreshToken, status, enabled }); // DEBUG

      if (!userId) {
        logger.error('Login response missing userId');
        return;
      }

      // Handle different login scenarios
      if (token &&  status === 'success') {
        // 🔄 2FA verification needed
        logger.info('Login pending - 2FA verification required');
        startTwoFactorFlow(userId);
        return;
      }

      if (token) {
        logger.info('Login successful with token, 2FA enabled:', enabled);
        setTwoFactorEnabled(enabled);
        
        if (enabled === false) {
          // ✅ Has token but needs 2FA setup
          logger.info('2FA setup required');
          saveTokens({ token, id: userId });
          setNeedsSetup(true);
        } else {
          // ✅ Complete authentication
          logger.info('Full authentication complete');
          handleAuthSuccess({
            token,
            userId,
            refreshToken,
            status
          });
        }
      } else {
        logger.warn('Login response missing token');
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
      logger.debug('Register response received:', authResponse);
      
      // ✅ PATAISYMAS: Adjust property names based on your AuthResponse type
      const token = (authResponse as any).token || (authResponse as any).accessToken;
      const userId = (authResponse as any).userId || (authResponse as any).id;
      const refreshToken = (authResponse as any).refreshToken;
      const userData = (authResponse as any).user || (authResponse as any).data;
      
      if (token && userId) {
        handleAuthSuccess({
          token,
          userId,
          refreshToken,
          userData
        });
      }
    },
    onError: (error) => {
      logger.error('Registration failed:', error);
    },
  });

  const verify2FAMutation = useMutation({
    mutationFn: ({ userId, token }: { userId: string; token: string }) =>
      authApi.verify2FA(userId, token),
    onSuccess: (response: IVerify2FAResponse) => {
      logger.debug('2FA verification successful:', response);
      
      // ✅ PATAISYMAS: Handle IVerify2FAResponse properly
      handleAuthSuccess({
        token: response.token,
        userId: response.userId ?? '', // fallback to empty string if undefined
        refreshToken: response.refreshToken,
        userData: response.data as AuthUser // Type assertion to fix the error
      });
    },
    onError: (error) => {
      logger.error('2FA verification failed:', error);
    },
  });

  const setup2FAMutation = useMutation({
    mutationFn: authApi.setup2FA,
    onSuccess: (response) => {
      logger.debug('2FA setup successful:', response);
    },
    onError: (error) => {
      logger.error('2FA setup failed:', error);
    },
  });

  const enable2FAMutation = useMutation({
    mutationFn: authApi.enable2FA,
    onSuccess: () => {
      logger.info('2FA enabled successfully');
      setTwoFactorEnabled(true);
      setNeedsSetup(false);
    },
    onError: (error) => {
      logger.error('2FA enable failed:', error);
    },
  });

  // ====================
  // 🎯 PUBLIC API
  // ====================
  
  const getCurrentUserId = useCallback(() => {
    return tokenData?.userId || tempUserId;
  }, [tokenData?.userId, tempUserId]);

  const clearAllErrors = useCallback(() => {
    [loginMutation, registerMutation, verify2FAMutation, 
     setup2FAMutation, enable2FAMutation].forEach(mutation => {
      mutation.reset();
    });
  }, [loginMutation, registerMutation, verify2FAMutation, setup2FAMutation, enable2FAMutation]);

  const verifyTwoFactorAuth = useCallback(async (userId: string, token: string) => {
    try {
      const response = await verify2FAMutation.mutateAsync({ userId, token });
      return response;
    } catch (error) {
      logger.error('2FA verification failed:', error);
      return null;
    }
  }, [verify2FAMutation]);

  // ====================
  // 📊 LOADING & ERROR STATES
  // ====================
  
  const isLoading = tokenLoading || [
    loginMutation, registerMutation, verify2FAMutation, 
    setup2FAMutation, enable2FAMutation
  ].some(mutation => mutation.isPending);

  const firstError = [loginMutation, registerMutation, verify2FAMutation].find(
    mutation => mutation.error
  )?.error;

  // ====================
  // 🎁 RETURN OBJECT
  // ====================
  
  return {
    // Core state
    user: currentUser,
    enabled: twoFactorEnabled,
    isAuthenticated,
    isInTwoFactorFlow,
    requiresTwoFactor: is2FAFlow || needsSetup,
    isLoading,
    error: firstError,

    // Actions
    signIn: loginMutation.mutateAsync,
    signUp: registerMutation.mutateAsync,
    verifyTwoFactorAuth,
    setupTwoFactorAuth: setup2FAMutation.mutateAsync,
    enableTwoFactorAuth: enable2FAMutation.mutateAsync,
    logout: resetAuthState,
    clearErrors: clearAllErrors,
    getCurrentUserId,
    enterTwoFactorFlow: startTwoFactorFlow,
    clearAuthState: resetAuthState,

    // Additional data
    tokenData,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    verify2FAError: verify2FAMutation.error,
    setup2FAError: setup2FAMutation.error,
    enable2FAError: enable2FAMutation.error,
  };
};