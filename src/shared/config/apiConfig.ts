import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { sanitizeObject } from '../../infrastructure/services/xssGuard';
import { logger } from '../utils/logger';
import { clearTokens, getAccessToken, getRefreshToken, setAccessToken } from '../../infrastructure/services/tokenStorage';

const getEnvVar = (name: string, defaultValue: string = '', required: boolean = false): string => {
  const value = process.env[name] || defaultValue;

  if (required && !value) {
    logger.error(`Required environment variable ${name} is not set`);
    throw new Error(`Missing required environment variable: ${name}`);
  }

  if (!value && defaultValue) {
    logger.warn(`${name} not set, using default: ${defaultValue}`);
  }

  return value;
};

const BASE_URL = getEnvVar('REACT_APP_API_BASE_URL');
const API_SECRET = getEnvVar('REACT_APP_API_SECRET');
const API_KEY = getEnvVar('REACT_APP_API_KEY', '', false);

logger.info('API Configuration:', {
  baseUrl: BASE_URL,
  hasApiSecret: !!API_SECRET,
  hasApiKey: !!API_KEY,
});

export const API_CONFIG = {
  BASE_URL,
  API_SECRET,
  API_KEY,
  REQUEST_TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  ENDPOINTS: {
    AUTH: {
      SIGN_IN: 'auth:login',
      ADMIN_SIGN_IN: 'auth:admin-login',
      SIGN_UP: 'auth:register',
      SIGN_OUT: 'auth:logout',
      REFRESH_TOKEN: 'auth:refresh-token',
      TWO_FACTOR: {
        SETUP: 'auth:2fa-setup',
        ENABLE: 'auth:2fa-enable',
        DISABLE: 'auth:2fa-disable',
        VERIFY: 'auth:2fa-verify',
      },
    },
  },
} as const;

interface TokenRefreshResponse {
  accessToken: string;
  refreshToken?: string;
}

interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: any;
}

type TokenRefresher = (refreshToken: string) => Promise<{ data: TokenRefreshResponse }>;

let tokenRefresher: TokenRefresher | null = null;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (error: any) => void;
}> = [];

export const setTokenRefresher = (refresher: TokenRefresher) => {
  tokenRefresher = refresher;
};

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL ? `${BASE_URL}/api` : '/api',
  timeout: API_CONFIG.REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Secret': API_CONFIG.API_SECRET,
  },
});

const sanitizeRequestData = (data: any): any => {
  if (!data || typeof data !== 'object') return data;

  const sensitiveFields = ['password', 'confirmPassword', 'passwordConfirm', 'adminPassword'];
  const sanitizedData = { ...data };

  const preservedFields: Record<string, any> = {};
  sensitiveFields.forEach(field => {
    if (data[field] !== undefined) {
      preservedFields[field] = data[field];
      delete sanitizedData[field];
    }
  });

  const result = sanitizeObject(sanitizedData);

  Object.assign(result, preservedFields);

  return result;
};

const isAuthExemptEndpoint = (url?: string): boolean => {
  if (!url) return false;
  const exemptPaths = ['auth:login', 'auth:register', 'auth:refresh-token'];
  return exemptPaths.some(path => url.includes(path));
};

axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      if (!config.headers['X-API-Secret'] && API_CONFIG.API_SECRET) {
        config.headers['X-API-Secret'] = API_CONFIG.API_SECRET;
      }

      const endpointPath = config.url?.split('/').pop();
      if (endpointPath) {
        config.headers['X-API-Endpoint'] = endpointPath;
      }

      if (
        config.url?.includes('2fa') ||
        config.url?.includes('admin-login')
      ) {
        if (API_CONFIG.API_KEY) {
          config.headers['X-API-Key'] = API_CONFIG.API_KEY;
        }
      }

      if (!isAuthExemptEndpoint(config.url)) {
        try {
          const token = await getAccessToken();
          if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
          }
        } catch (tokenError) {
          logger.error('Error retrieving access token in interceptor:', tokenError);
        }
      }

      if (config.data) {
        config.data = sanitizeRequestData(config.data);
      }

      logger.debug(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}/${config.url}`, {
        headers: {
          'Content-Type': config.headers['Content-Type'],
          'X-API-Secret': config.headers['X-API-Secret'] ? '[SET]' : '[MISSING]',
          'X-API-Key': config.headers['X-API-Key'] ? '[SET]' : '[NOT SET]',
          'Authorization': config.headers['Authorization'] ? '[SET]' : '[NOT SET]',
        }
      });

      return config;
    } catch (error) {
      logger.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    logger.error('Request configuration error:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = sanitizeObject(response.data);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry && tokenRefresher) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
          }
          return axiosInstance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();
        if (refreshToken && tokenRefresher) {
          const response = await tokenRefresher(refreshToken);

          if (response?.data?.accessToken) {
            const newToken = response.data.accessToken;
            await setAccessToken(newToken);

            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            }

            processQueue(null, newToken);

            return axiosInstance(originalRequest);
          }
        }
      } catch (refreshError) {
        logger.error('Token refresh failed:', refreshError);
        processQueue(refreshError, null);
        clearTokens();

        window.location.href = '/login';
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 401) {
      clearTokens();
    }

    const errorDetails = {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    };
    logger.error('API request failed:', errorDetails);

    return Promise.reject(error);
  }
);

export const get = async <T = any>(
  endpoint: string,
  params?: any,
  config?: any
): Promise<AxiosResponse<T>> => {
  try {
    return await axiosInstance.get<T>(endpoint, { params, ...config });
  } catch (error) {
    logger.error(`GET ${endpoint} failed:`, error);
    throw enhanceError(error as AxiosError);
  }
};

export const post = async <T = any>(
  endpoint: string,
  data?: any,
  config?: any
): Promise<AxiosResponse<T>> => {
  try {
    return await axiosInstance.post<T>(endpoint, data, config);
  } catch (error) {
    logger.error(`POST ${endpoint} failed:`, error);
    throw enhanceError(error as AxiosError);
  }
};

export const put = async <T = any>(
  endpoint: string,
  data?: any,
  config?: any
): Promise<AxiosResponse<T>> => {
  try {
    return await axiosInstance.put<T>(endpoint, data, config);
  } catch (error) {
    logger.error(`PUT ${endpoint} failed:`, error);
    throw enhanceError(error as AxiosError);
  }
};

export const del = async <T = any>(
  endpoint: string,
  params?: any,
  config?: any
): Promise<AxiosResponse<T>> => {
  try {
    return await axiosInstance.delete<T>(endpoint, { params, ...config });
  } catch (error) {
    logger.error(`DELETE ${endpoint} failed:`, error);
    throw enhanceError(error as AxiosError);
  }
};

const enhanceError = (error: AxiosError): ApiError => {
  const enhancedError: ApiError = new Error(error.message);
  enhancedError.status = error.response?.status;
  enhancedError.code = error.code;
  enhancedError.details = error.response?.data;
  enhancedError.stack = error.stack;

  return enhancedError;
};

export const healthCheck = async (): Promise<boolean> => {
  try {
    await axiosInstance.get('/health', { timeout: 5000 });
    return true;
  } catch (error) {
    logger.error('Health check failed:', error);
    return false;
  }
};

export const debugApiConfig = () => {
  const config = {
    timestamp: new Date().toISOString(),
    setupType: BASE_URL ? 'Direct connection' : 'Proxy setup',
    baseURL: axiosInstance.defaults.baseURL,
    timeout: axiosInstance.defaults.timeout,
    defaultHeaders: axiosInstance.defaults.headers,
    environmentVars: {
      NODE_ENV: process.env.NODE_ENV,
      REACT_APP_API_BASE_URL: process.env.REACT_APP_API_BASE_URL || '[NOT SET - USING PROXY]',
      REACT_APP_API_SECRET: process.env.REACT_APP_API_SECRET || '[NOT SET]',
      REACT_APP_API_KEY: process.env.REACT_APP_API_KEY || '[NOT SET]',
    },
    resolvedValues: {
      BASE_URL: API_CONFIG.BASE_URL || 'Proxy setup',
      API_SECRET: API_CONFIG.API_SECRET,
      API_KEY: API_CONFIG.API_KEY,
    },
    actualAxiosConfig: {
      baseURL: axiosInstance.defaults.baseURL,
      headers: {
        'Content-Type': axiosInstance.defaults.headers['Content-Type'],
        'X-API-Secret': axiosInstance.defaults.headers['X-API-Secret'],
      }
    }
  };

  console.log('=== API CONFIGURATION DEBUG ===');
  console.table(config.environmentVars);
  console.log('Setup Type:', config.setupType);
  console.log('Full Config:', config);
  logger.info('API Configuration Debug:', config);
  return config;
};

export const apiClient = {
  get,
  post,
  put,
  delete: del,
  instance: axiosInstance,
  healthCheck,
  clearTokens,
  setTokenRefresher,
  config: API_CONFIG,
  debug: debugApiConfig,
};