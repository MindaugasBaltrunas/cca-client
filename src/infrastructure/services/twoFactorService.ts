import { API_CONFIG } from '../../shared/config/apiConfig';
import { http } from '../../shared/http';
import { sanitizeString } from './xssGuard';
import { logger } from '../../shared/utils/logger';
import { EventBus } from '../../shared/utils/eventBus';
import { saveTokens } from './tokenStorage';
import { determineExpiresIn } from '../services/authHelpers';
import { handleApiError } from '../services/authErrorHandler';
import type {
  AuthResponse,
  IVerify2FAResponse,
  TwoFactorSetupResponse
} from '../services/types';

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

/**
 * Generic 2FA operation handler
 */
const process2FAOperation = async (
  token: string,
  endpoint: string,
  successEvent: string,
  errorContext: string
): Promise<AuthResponse> => {
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

export const enable2FA = (token: string): Promise<AuthResponse> =>
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
        userId: sanitizeString(userId),
        token: sanitizeString(token)
      }
    );

    if (response.data.status === 'success' && response.data.data) {
      const { accessToken, refreshToken, expiresAt } = response.data.data;
      
      if (!accessToken) {
        throw new Error('Access token missing in 2FA response');
      }

      const expiresIn = determineExpiresIn(expiresAt);

      await saveTokens({ 
        token: accessToken, 
        refreshToken: refreshToken || undefined,
        expiresIn: expiresIn > 0 ? expiresIn : undefined,
        id: userId
      });
      
      EventBus.emit('auth:2faVerified', response.data);
    }
    
    return response.data;
  } catch (error) {
    logger.error('2FA verify error:', error);
    throw error;
  }
};
