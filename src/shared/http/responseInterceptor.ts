import { AxiosError, AxiosHeaders, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { sanitizeObject } from '../../infrastructure/services/xssGuard';
import { tokenRefreshService } from '../../infrastructure/services/tokenRefreshService';
import { logger } from '../utils/logger';
import { EventBus } from '../utils/eventBus';
import { API_CONFIG } from '../config/apiConfig';
import { clearTokens } from '../../infrastructure/services/tokenStorage';
import { ApiErrorResponse, AuthResponse } from '../types/api.response.types';

interface ExtendedRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

export const responseSuccessHandler = (response: AxiosResponse): AxiosResponse => {
    try {
        return {
            ...response,
            data: response.data ? sanitizeObject(response.data) : response.data
        };
    } catch (error) {
        logger.error('Response processing error:', error);
        return response;
    }
};

const isRefreshTokenRequest = (url?: string): boolean =>
    Boolean(url?.includes(API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN));

const isUnauthorizedError = (error: AxiosError): boolean =>
    error.response?.status === 401;

const retryRequestWithNewToken = (
    axiosInstance: AxiosInstance,
    originalRequest: ExtendedRequestConfig,
    newToken: string
): Promise<AxiosResponse> => {
    const updatedRequest: ExtendedRequestConfig = {
        ...originalRequest,
        _retry: true,
        headers: new AxiosHeaders({
            ...originalRequest.headers,
            'Authorization': `Bearer ${newToken}`
        })
    };

    return axiosInstance(updatedRequest);
};

const handleAuthFailure = (): void => {
    clearTokens();

    EventBus.emit('auth:sessionExpired');

    logger.warn('Authentication failed, user has been logged out');
};

const createRefreshWaitingPromise = (
    axiosInstance: AxiosInstance,
    originalRequest: ExtendedRequestConfig
): Promise<AxiosResponse> => {
    return new Promise(resolve => {
        tokenRefreshService.subscribeToTokenRefresh(newToken => {
            if (newToken) {
                resolve(retryRequestWithNewToken(axiosInstance, originalRequest, newToken));
            } else {
                resolve(Promise.reject(new Error('Token refresh failed')));
            }
        });
    });
};

const performTokenRefresh = async (
    axiosInstance: AxiosInstance,
    originalRequest: ExtendedRequestConfig,
    refreshTokenApi: (token: string) => Promise<AuthResponse>
): Promise<AxiosResponse> => {
    try {
        logger.debug('Access token expired, attempting refresh');

        const refreshResponse = await tokenRefreshService.refreshAccessToken(refreshTokenApi);

        if (isAuthResponse(refreshResponse) && refreshResponse.success && refreshResponse.data?.accessToken) {
            return retryRequestWithNewToken(
                axiosInstance,
                originalRequest,
                refreshResponse.data.accessToken
            );
        }

        handleAuthFailure();
        return Promise.reject(new Error(refreshResponse.message || 'Token refresh failed'));
    } catch (refreshError) {
        handleAuthFailure();
        return Promise.reject(refreshError);
    }
};

function isAuthResponse(response: AuthResponse | ApiErrorResponse): response is AuthResponse {
    return (response as AuthResponse).success !== undefined;
}


export const createResponseErrorHandler = (
    axiosInstance: AxiosInstance,
    refreshTokenApi: (token: string) => Promise<AuthResponse>
) => async (error: AxiosError): Promise<AxiosResponse> => {
    const originalRequest = error.config as ExtendedRequestConfig;

    if (!originalRequest || originalRequest._retry) {
        return Promise.reject(error);
    }

    if (isUnauthorizedError(error) && !isRefreshTokenRequest(originalRequest.url)) {
        if (tokenRefreshService.isRefreshInProgress()) {
            return createRefreshWaitingPromise(axiosInstance, originalRequest);
        }

        return performTokenRefresh(axiosInstance, originalRequest, refreshTokenApi);
    }

    if (isUnauthorizedError(error) && isRefreshTokenRequest(originalRequest.url)) {
        handleAuthFailure();
    }

    return Promise.reject(error);
};


