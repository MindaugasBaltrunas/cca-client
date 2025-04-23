import { AuthResponse } from '../../shared/types/api.types';
import { logger } from '../../shared/utils/logger';
import * as secureTokenStorage from './tokenStorage';

const createTokenRefreshService = () => {
  let isRefreshing = false;
  let refreshSubscribers: Array<(token: string) => void> = [];

  const subscribeToTokenRefresh = (callback: (token: string) => void): void => {
    refreshSubscribers.push(callback);
  };

   const onTokenRefreshed = (token: string): void => {
    refreshSubscribers.forEach(callback => callback(token));
    refreshSubscribers = [];
  };

  const onRefreshError = (error: Error): void => {
    logger.error('Token refresh failed:', error);
    refreshSubscribers.forEach(callback => callback(''));
    refreshSubscribers = [];
    secureTokenStorage.clearTokens();
  };

  const isRefreshInProgress = (): boolean => isRefreshing;

  const setRefreshInProgress = (status: boolean): void => {
    isRefreshing = status;
  };

  const refreshAccessToken = async (
    refreshTokenApi: (token: string) => Promise<AuthResponse>
  ): Promise<AuthResponse> => {
    const refreshToken = await secureTokenStorage.getRefreshToken();
    
    if (!refreshToken) {
      secureTokenStorage.clearTokens();
      throw new Error('No refresh token available');
    }
    
    try {
      setRefreshInProgress(true);
      
      const response = await refreshTokenApi(refreshToken);
      
      if (response.status === 'success' && response.data) {
        const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data;
        
        await secureTokenStorage.saveTokens({
          token: accessToken as string,
          refreshToken: newRefreshToken,
          expiresIn
        });
        
        if (accessToken) {
          onTokenRefreshed(accessToken);
        } else {
          throw new Error('Access token is undefined');
        }
        return response;
      } else {
        throw new Error(response.message || 'Token refresh failed');
      }
    } catch (error) {
      onRefreshError(error instanceof Error ? error : new Error('Unknown refresh error'));
      throw error;
    } finally {
      setRefreshInProgress(false);
    }
  };
  
  return {
    subscribeToTokenRefresh,
    onTokenRefreshed,
    onRefreshError,
    isRefreshInProgress,
    setRefreshInProgress,
    refreshAccessToken
  };
};

export const tokenRefreshService = createTokenRefreshService();