import { logger } from '../../../shared/utils/logger';
import { EventBus } from '../../../shared/utils/eventBus';
import { saveTokens } from '../../services/tokenStorage';
import { AuthResponse } from '../../../shared/types/api.response.types';

export const determineExpiresIn = (expiresAt?: number): number => {
  if (!expiresAt) return 0;

  if (expiresAt > 1000000000) {
    return Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
  }

  return Math.max(0, expiresAt);
};

export const handleSuccessfulAuth = async (response: AuthResponse): Promise<void> => {
  try {
    if (response.success || !response.data) {
      throw new Error('Invalid auth response');
    }

    const { accessToken, refreshToken, userId, expiresAt } = response.data;

    if (!accessToken?.trim()) {
      throw new Error('Access token is missing');
    }

    if (!userId?.trim()) {
      throw new Error('User ID is missing');
    }

    const expiresIn = determineExpiresIn(Number(expiresAt));

    await saveTokens({
      token: accessToken,
      refreshToken: refreshToken || undefined,
      expiresIn: expiresIn > 0 ? expiresIn : undefined,
      id: userId,
    });

    EventBus.emit('auth:login', response);
  } catch (error) {
    logger.error('❌ Failed to handle successful auth:', error);
    throw error;
  }
};

export const debugTokenData = async () => {
  const { getAllTokens, getId, isTokenExpired } = await import('../../services/tokenStorage');
  const tokens = await getAllTokens();
  const userId = await getId();
  const isExpired = await isTokenExpired();

  console.log('🔍 Current token state:', {
    hasAccessToken: !!tokens.accessToken,
    hasRefreshToken: !!tokens.refreshToken,
    hasUserId: !!userId,
    expiry: tokens.expiry ? new Date(tokens.expiry).toISOString() : null,
    isExpired,
    timeLeft: tokens.expiry ? Math.max(0, Math.floor((tokens.expiry - Date.now()) / 1000)) : 0
  });
};
