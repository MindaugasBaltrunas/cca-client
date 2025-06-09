import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG } from '../config/apiConfig';
import { requestInterceptor, requestErrorHandler } from './requestInterceptor';
import { responseSuccessHandler } from './responseInterceptor';
import { logger } from '../utils/logger';
import { tokenRefreshService } from '../../infrastructure/services/tokenRefreshService';
import { getAccessToken } from '../../infrastructure/services/tokenStorage';

const debugClientConfig = () => {
  const config = {
    baseURL: API_CONFIG.BASE_URL,
    hasApiSecret: !!API_CONFIG.API_SECRET,
    hasApiKey: !!API_CONFIG.API_KEY,
    endpoints: API_CONFIG.ENDPOINTS,
    environment: {
      REACT_APP_API_BASE_URL: process.env.REACT_APP_API_BASE_URL,
      REACT_APP_API_SECRET: process.env.REACT_APP_API_SECRET ? '[SET]' : '[NOT SET]',
      REACT_APP_API_KEY: process.env.REACT_APP_API_KEY ? '[SET]' : '[NOT SET]',
    }
  };
  
  logger.info('HTTP Client Configuration:', config);
  console.log('=== HTTP CLIENT DEBUG ===', config);
  return config;
};

export const createHttpClient = (): AxiosInstance => {
  debugClientConfig();
  
  const baseURL = API_CONFIG.BASE_URL || '/';
  
  logger.info(`Creating HTTP client with baseURL: ${baseURL}`);
  
  const instance = axios.create({
    baseURL,
    timeout: API_CONFIG.REQUEST_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use(
    requestInterceptor,
    requestErrorHandler
  );

  instance.interceptors.response.use(
    responseSuccessHandler,
    async (error) => {
      const originalRequest = error.config;
      
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        if (tokenRefreshService.isRefreshInProgress()) {
          return new Promise((resolve) => {
            tokenRefreshService.subscribeToTokenRefresh((token) => {
              if (token) {
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                resolve(instance(originalRequest));
              } else {
                resolve(Promise.reject(error));
              }
            });
          });
        } else {
          try {
            const refreshTokenApi = (await import('../../infrastructure/api/authApi')).refreshToken;
            
            await tokenRefreshService.refreshAccessToken(refreshTokenApi);
            
            const newToken = await getAccessToken();
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

// Enhanced helper functions that don't require passing instance
export const get = <T = any>(
  url: string, 
  params?: any, 
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  try {
    logger.debug(`GET request to: ${url}`, { params });
    return axiosInstance.get<T, AxiosResponse<T>>(url, { ...config, params });
  } catch (error) {
    logger.error(`GET ${url} failed:`, error);
    throw error;
  }
};

export const post = <T = any>(
  url: string, 
  data?: any, 
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  try {
    logger.debug(`POST request to: ${url}`, { hasData: !!data });
    return axiosInstance.post<T, AxiosResponse<T>>(url, data, config);
  } catch (error) {
    logger.error(`POST ${url} failed:`, error);
    throw error;
  }
};

export const put = <T = any>(
  url: string, 
  data?: any, 
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  try {
    logger.debug(`PUT request to: ${url}`, { hasData: !!data });
    return axiosInstance.put<T, AxiosResponse<T>>(url, data, config);
  } catch (error) {
    logger.error(`PUT ${url} failed:`, error);
    throw error;
  }
};

export const patch = <T = any>(
  url: string, 
  data?: any, 
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  try {
    logger.debug(`PATCH request to: ${url}`, { hasData: !!data });
    return axiosInstance.patch<T, AxiosResponse<T>>(url, data, config);
  } catch (error) {
    logger.error(`PATCH ${url} failed:`, error);
    throw error;
  }
};

export const del = <T = any>(
  url: string, 
  params?: any, 
  config?: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  try {
    logger.debug(`DELETE request to: ${url}`, { params });
    return axiosInstance.delete<T, AxiosResponse<T>>(url, { ...config, params });
  } catch (error) {
    logger.error(`DELETE ${url} failed:`, error);
    throw error;
  }
};

// Legacy functions for backward compatibility (if needed)
export const getWithInstance = <T = any>(
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

export const postWithInstance = <T = any>(
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

// Export the instance for direct use if needed
export { axiosInstance };
export default axiosInstance;

// Debug function export
export const debugHttpClient = debugClientConfig;