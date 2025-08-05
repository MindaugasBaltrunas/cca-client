import { ApiErrorResponse, AuthResponse } from '../../shared/types/api.types';
import { logger } from '../../shared/utils/logger';
import { clearTokens, getRefreshToken, saveTokens } from './tokenStorage';

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
    clearTokens();
  };

  const isRefreshInProgress = (): boolean => isRefreshing;

  const setRefreshInProgress = (status: boolean): void => {
    isRefreshing = status;
  };

  const refreshAccessToken = async (refreshTokenApi: (token: string) => Promise<AuthResponse | ApiErrorResponse>): Promise<AuthResponse | ApiErrorResponse> => {
    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
      clearTokens();
      throw new Error('No refresh token available');
    }

    try {
      setRefreshInProgress(true);

      const response: AuthResponse | ApiErrorResponse = await refreshTokenApi(refreshToken);

      if (isAuthResponse(response)) {
        if (response.success && response.data) {
          const { accessToken, refreshToken: newRefreshToken } = response.data;

          await saveTokens({
            token: accessToken as string,
            refreshToken: newRefreshToken,
            enable: true
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

  function isAuthResponse(response: AuthResponse | ApiErrorResponse): response is AuthResponse {
    return (response as AuthResponse).success !== undefined;
  }


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