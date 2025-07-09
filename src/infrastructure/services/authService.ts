import { API_CONFIG } from '../../shared/config/apiConfig';
import { http } from '../../shared/http';
import { sanitizeString } from './xssGuard';
import { logger } from '../../shared/utils/logger';
import { EventBus } from '../../shared/utils/eventBus';
import { clearTokens, saveTokens } from './tokenStorage';
import { handleSuccessfulAuth, determineExpiresIn } from '../services/authHelpers';
import { handleApiError } from '../services/authErrorHandler';
import type {
  AuthResponse,
  IVerify2FAResponse,
  LoginState,
  SignUpData,
  TwoFactorSetupResponse
} from '../services/types';

/**
 * Basic authentication functions
 */
export const login = async (credentials: LoginState): Promise<AuthResponse> => {
  try {
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
