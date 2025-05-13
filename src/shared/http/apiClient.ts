import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG } from '../config/apiConfig';
import { requestInterceptor, requestErrorHandler } from './requestInterceptor';
import { responseSuccessHandler } from './responseInterceptor';
import { logger } from '../utils/logger';
import { tokenRefreshService } from '../../infrastructure/services/tokenRefreshService';
import { secureTokenStorage } from '../../infrastructure/services/tokenStorage';

// Remove refreshToken parameter - we'll use tokenRefreshService instead
export const createHttpClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.REQUEST_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use(
    requestInterceptor,
    requestErrorHandler
  );

  // Add response interceptor for handling token refresh
  instance.interceptors.response.use(
    responseSuccessHandler,
    async (error) => {
      const originalRequest = error.config;
      
      // Handle 401 errors (Unauthorized)
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        // Check if refresh is already in progress
        if (tokenRefreshService.isRefreshInProgress()) {
          // Wait for the refresh to complete
          return new Promise((resolve) => {
            tokenRefreshService.subscribeToTokenRefresh((token) => {
              if (token) {
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                resolve(instance(originalRequest));
              } else {
                // Token refresh failed
                resolve(Promise.reject(error));
              }
            });
          });
        } else {
          try {
            // Get the refreshTokenApi when it's registered (will be set by authApi)
            const refreshTokenApi = (await import('../../infrastructure/api/authApi')).refreshToken;
            
            // Attempt to refresh the token
            await tokenRefreshService.refreshAccessToken(refreshTokenApi);
            
            // Get the fresh token 
            const newToken = await secureTokenStorage.getAccessToken();
            if (newToken) {
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
              return instance(originalRequest);
            }
          } catch (refreshError) {
            logger.error('Error refreshing token:', refreshError);
            return Promise.reject(error);
          }
        }
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

// Create a single instance
const axiosInstance = createHttpClient();

// Helper functions with proper error handling
export const get = <T = any>(
  instance: AxiosInstance,
  url: string, 
  params?: any, 
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  try {
    return instance.get<T, AxiosResponse<T>>(url, { ...config, params });
  } catch (error) {
    logger.error(`GET ${url} failed:`, error);
    throw error;
  }
};

export const post = <T = any>(
  instance: AxiosInstance,
  url: string, 
  data?: any, 
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  try {
    return instance.post<T, AxiosResponse<T>>(url, data, config);
  } catch (error) {
    logger.error(`POST ${url} failed:`, error);
    throw error;
  }
};

export const put = <T = any>(
  instance: AxiosInstance,
  url: string, 
  data?: any, 
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  try {
    return instance.put<T, AxiosResponse<T>>(url, data, config);
  } catch (error) {
    logger.error(`PUT ${url} failed:`, error);
    throw error;
  }
};

export const patch = <T = any>(
  instance: AxiosInstance,
  url: string, 
  data?: any, 
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  try {
    return instance.patch<T, AxiosResponse<T>>(url, data, config);
  } catch (error) {
    logger.error(`PATCH ${url} failed:`, error);
    throw error;
  }
};

export const del = <T = any>(
  instance: AxiosInstance,
  url: string, 
  params?: any, 
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  try {
    return instance.delete<T, AxiosResponse<T>>(url, { ...config, params });
  } catch (error) {
    logger.error(`DELETE ${url} failed:`, error);
    throw error;
  }
};

export default axiosInstance;