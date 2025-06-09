import { API_CONFIG }                   from '../../shared/config/apiConfig';
import { http }              from '../../shared/http';
import { sanitizeString }               from '../services/xssGuard';
import { logger }                       from '../../shared/utils/logger';
import { EventBus }                     from '../../shared/utils/eventBus';

import type {
  AuthResponse,
  IVerify2FAResponse,
  LoginState,
  SignUpData,
  TwoFactorSetupResponse,
  UserData
} from '../../shared/types/api.types';
import { clearTokens, getAccessToken, saveTokens } from '../services/tokenStorage';

const handleSuccessfulAuth = async (response: AuthResponse): Promise<void> => {
  logger.debug('Handling successful authentication response', response);

  if (response.status === 'success' && response.data) {
    const { accessToken, refreshToken } = response.data;

    await saveTokens({
      token:       accessToken ?? '',
      refreshToken
    });

    EventBus.emit('auth:login', response);
  }
};

const handleApiError = (error: unknown, context: string): AuthResponse => {
  logger.error(`${context}:`, error);
  return {
    status:  'error',
    message: error instanceof Error ? error.message : `${context} occurred`,
  };
};

export const login = async (credentials: LoginState): Promise<AuthResponse> => {
  try {
    logger.debug('Attempting user login');
    const response = await http.post(
      API_CONFIG.ENDPOINTS.AUTH.SIGN_IN,
      credentials
    );
    await handleSuccessfulAuth(response.data);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Login error');
  }
};

export const adminLogin = async (
  credentials: LoginState & { adminPassword: string }
): Promise<AuthResponse> => {
  try {
    logger.debug('Attempting admin login');
    const response = await http.post(
      API_CONFIG.ENDPOINTS.AUTH.ADMIN_SIGN_IN,
      credentials
    );
    await handleSuccessfulAuth(response.data);
    if (response.data.status === 'success') {
      EventBus.emit('auth:adminLogin', response.data);
    }
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Admin login error');
  }
};

export const register = async (userData: SignUpData): Promise<AuthResponse> => {
  try {
    logger.debug('Attempting user registration');
    const response = await http.post(
      API_CONFIG.ENDPOINTS.AUTH.SIGN_UP,
      userData
    );
    await handleSuccessfulAuth(response.data);
    if (response.data.status === 'success') {
      EventBus.emit('auth:register', response.data);
    }
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Registration error');
  }
};

export const logout = async (userId: string): Promise<AuthResponse> => {
  try {
    logger.debug('Attempting user logout');
    const safeUserId = sanitizeString(userId);
    const response = await http.post(
      API_CONFIG.ENDPOINTS.AUTH.SIGN_OUT,
      { userId: safeUserId }
    );
    clearTokens();
    EventBus.emit('auth:logout');
    return response.data;
  } catch (error) {
    clearTokens();
    EventBus.emit('auth:logout');
    return handleApiError(error, 'Logout error');
  }
};

export const getCurrentUser = async (): Promise<UserData | null> => {
  try {
    logger.debug('Fetching current user data');
    const token = await getAccessToken();
    if (!token) {
      logger.debug('No access token found, skipping current user request');
      return null;
    }
    const response = await http.post(
      API_CONFIG.ENDPOINTS.AUTH.CURRENT_USER,
      {}
    );
    return response.data.user;
  } catch (error) {
    logger.error('Get current user error:', error);
    return null;
  }
};

export const setup2FA = async (): Promise<TwoFactorSetupResponse> => {
  try {
    logger.debug('Setting up 2FA');
    const response = await http.post(
      API_CONFIG.ENDPOINTS.AUTH.TWO_FACTOR.SETUP,
      {}
    );
    return response.data;
  } catch (error) {
    logger.error('2FA setup error:', error);
    throw error;
  }
};

const process2FAOperation = async (
  token: string,
  endpoint: string,
  successEvent: string,
  errorContext: string
): Promise<AuthResponse> => {
  try {
    const safeToken = sanitizeString(token);
    const response = await http.post(endpoint, { token: safeToken });
    if (response.data.status === 'success') {
      EventBus.emit(successEvent);
    }
    return response.data;
  } catch (error) {
    return handleApiError(error, errorContext);
  }
};

export const enable2FA = (token: string) =>
  process2FAOperation(
    token,
    API_CONFIG.ENDPOINTS.AUTH.TWO_FACTOR.ENABLE,
    'auth:2faEnabled',
    '2FA enable error'
  );

export const disable2FA = (token: string) =>
  process2FAOperation(
    token,
    API_CONFIG.ENDPOINTS.AUTH.TWO_FACTOR.DISABLE,
    'auth:2faDisabled',
    '2FA disable error'
  );

export const verify2FA = async (
  userId: string,
  token: string
): Promise<IVerify2FAResponse> => {
  try {
    logger.debug('Verifying 2FA token');
    const response = await http.post(
      API_CONFIG.ENDPOINTS.AUTH.TWO_FACTOR.VERIFY,
      {
        userId:   sanitizeString(userId),
        token:    sanitizeString(token)
      }
    );
    if (response.data.status === 'success' && response.data.data) {
      const { accessToken, refreshToken } = response.data.data;
      await saveTokens({ token: accessToken, refreshToken });
      EventBus.emit('auth:2faVerified', response.data);
    }
    return response.data;
  } catch (error) {
    logger.error('2FA verify error:', error);
    throw error;
  }
};

export const refreshToken = async (rt: string): Promise<AuthResponse> => {
  try {
    logger.debug('Refreshing authentication token');
    const response = await http.post(
      API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN,
      { refreshToken: sanitizeString(rt) }
    );
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Token refresh error');
  }
};

export const authApi = {
  login,
  adminLogin,
  register,
  logout,
  getCurrentUser,
  setup2FA,
  enable2FA,
  disable2FA,
  verify2FA,
  refreshToken
};
