import http, { API_CONFIG } from '../../shared/http';
import { ApiErrorResponse, AuthResponse, TwoFactorSetupResponse } from '../../shared/types/api.response.types';
import { LoginData, SignUpData } from '../../shared/types/auth.base.types';
import { EventBus } from '../../shared/utils/eventBus';
import { logger } from '../../shared/utils/logger';
import { sanitizeObject, sanitizeString } from '../services';
import { clearTokens, saveTokens } from '../services/tokenStorage';
import { determineExpiresIn } from './utils/authHelpers';

const handleSuccessfulAuth = async (response: AuthResponse): Promise<void> => {
  if (response.success && response.data) {
    const { accessToken, refreshToken, userId, expiresAt } = response.data;

    await saveTokens({
      token: accessToken ?? '',
      refreshToken,
      expiresIn: expiresAt ? determineExpiresIn(Number(expiresAt)) : undefined,
      id: userId ?? '',
    });

    EventBus.emit('auth:login', response);
  }
};

const handleApiError = (error: unknown, context: string): ApiErrorResponse => {
  logger.error(`${context}:`, error);

  return {
    status: "error",
    message: error instanceof Error ? error.message : `${context} occurred`,
    code: error instanceof Error ? error.name : 'UNKNOWN',
    details: error
  };
};

const process2FAOperation = async (
  token: string,
  endpoint: string,
  successEvent: string,
  errorContext: string
): Promise<AuthResponse | ApiErrorResponse> => {
  try {
    const safeToken = sanitizeString(token);
    const response = await http.post(endpoint, { token: safeToken });
    logger.debug(`2FA operation response:`, response);
    if (response.data.status === 'pending') {
      EventBus.emit(successEvent);
    }
    return response.data;
  } catch (error) {
    return handleApiError(error, errorContext);
  }
};

export const login = async (credentials: LoginData): Promise<AuthResponse | ApiErrorResponse> => {
  try {
    const safeCredentials = sanitizeObject(credentials);

    const response = await http.post(API_CONFIG.ENDPOINTS.AUTH.SIGN_IN, safeCredentials);
    await handleSuccessfulAuth(response.data);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Login error');
  }
};

export const adminLogin = async (
  credentials: LoginData & { adminPassword: string }
): Promise<AuthResponse | ApiErrorResponse> => {
  try {
    const response = await http.post(API_CONFIG.ENDPOINTS.AUTH.ADMIN_SIGN_IN, credentials);
    await handleSuccessfulAuth(response.data);
    if (response.data.status === 'success') {
      EventBus.emit('auth:adminLogin', response.data);
    }
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Admin login error');
  }
};

export const register = async (userData: SignUpData): Promise<AuthResponse | ApiErrorResponse> => {
  try {
    const safeUserData = sanitizeObject(userData);
    const response = await http.post(API_CONFIG.ENDPOINTS.AUTH.SIGN_UP, safeUserData);
    await handleSuccessfulAuth(response.data);
    if (response.data.status === 'success') {
      EventBus.emit('auth:register', response.data);
    }
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Registration error');
  }
};


export const logout = async (userId: string): Promise<AuthResponse | ApiErrorResponse> => {
  try {
    const response = await http.post(API_CONFIG.ENDPOINTS.AUTH.SIGN_OUT, sanitizeObject({ userId }));
    clearTokens();
    EventBus.emit('auth:logout');
    return response.data;
  } catch (error) {
    clearTokens();
    EventBus.emit('auth:logout');
    return handleApiError(error, 'Logout error');
  }
};


export const setup2FA = async (): Promise<TwoFactorSetupResponse> => {
  try {
    const response = await http.post(API_CONFIG.ENDPOINTS.AUTH.TWO_FACTOR.SETUP, {});
    return response.data;

  } catch (error) {
    logger.error('2FA setup error:', error);
    throw error;
  }
};

export const enable2FA = (token: string): Promise<AuthResponse | ApiErrorResponse> => {
  const safePayload = sanitizeObject({ token });
  return process2FAOperation(
    safePayload.token,
    API_CONFIG.ENDPOINTS.AUTH.TWO_FACTOR.ENABLE,
    'auth:2faEnabled',
    '2FA enable error'
  );
};

export const disable2FA = (token: string): Promise<AuthResponse | ApiErrorResponse> => {
  const safePayload = sanitizeObject({ token });
  return process2FAOperation(
    safePayload.token,
    API_CONFIG.ENDPOINTS.AUTH.TWO_FACTOR.DISABLE,
    'auth:2faDisabled',
    '2FA disable error'
  );
};

export const verify2FA = async (userId: string, token: string): Promise<TwoFactorSetupResponse> => {
  try {
    const safePayload = sanitizeObject({ userId, token });
    const response = await http.post(API_CONFIG.ENDPOINTS.AUTH.TWO_FACTOR.VERIFY, safePayload);

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


export const refreshToken = async (rt: string): Promise<AuthResponse | ApiErrorResponse> => {
  try {
    const safePayload = sanitizeObject({ refreshToken: rt });
    const response = await http.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN, safePayload);
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
  setup2FA,
  enable2FA,
  disable2FA,
  verify2FA,
  refreshToken
};