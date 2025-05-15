import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { sanitizeObject } from '../../infrastructure/services/xssGuard';
import { logger } from '../utils/logger';
import { clearTokens, getAccessToken, getRefreshToken, setAccessToken } from '../../infrastructure/services/tokenStorage';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
const API_SECRET = process.env.REACT_APP_API_SECRET_KEY || '';
const API_KEY = process.env.REACT_APP_API_KEY || '';

export const API_CONFIG = {
  BASE_URL,
  API_SECRET,
  API_KEY,
  REQUEST_TIMEOUT: 5000,
  ENDPOINTS: {
    AUTH: {
      SIGN_IN: 'auth:login',
      ADMIN_SIGN_IN: 'auth:admin-login',
      SIGN_UP: 'auth:register',
      SIGN_OUT: 'auth:logout',
      REFRESH_TOKEN: 'auth:refresh-token',
      CURRENT_USER: 'auth:me',
      TWO_FACTOR: {
        SETUP: 'auth:2fa-setup',
        ENABLE: 'auth:2fa-enable',
        DISABLE: 'auth:2fa-disable',
        VERIFY: 'auth:2fa-verify',
      },
    },
  },
};

// Create a token refresher handler that can be set later
let tokenRefresher: ((refreshToken: string) => Promise<any>) | null = null;

export const setTokenRefresher = (refresher: (refreshToken: string) => Promise<any>) => {
  tokenRefresher = refresher;
};

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Secret': API_CONFIG.API_SECRET,
  },
});

const sanitizeRequestData = (data: any): any => {
  const sanitizedData = { ...data };

  const password = data.password;
  const confirmPassword = data.confirmPassword || data.passwordConfirm;
  const adminPassword = data.adminPassword;

  const result = sanitizeObject(sanitizedData);

  if (password !== undefined) {
    result.password = password;
  }

  if (confirmPassword !== undefined) {
    result.confirmPassword = confirmPassword;
    result.passwordConfirm = confirmPassword;
  }

  if (adminPassword !== undefined) {
    result.adminPassword = adminPassword;
  }

  return result;
};

const isAuthExemptEndpoint = (url?: string): boolean => {
  if (!url) return false;
  return url.includes('login') || url.includes('register');
};

axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const endpointPath = config.url?.split('/').pop();
      if (endpointPath) {
        config.headers['X-API-Endpoint'] = endpointPath;
      }

      if (
        config.url?.includes('2fa') ||
        config.url?.includes('admin-login')
      ) {
        config.headers['X-API-Key'] = API_CONFIG.API_KEY;
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

      if (config.data && typeof config.data === 'object') {
        config.data = sanitizeRequestData(config.data);
      }

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
  async (error) => {
    // Token refresh logic
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry && tokenRefresher) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await getRefreshToken();
        if (refreshToken && tokenRefresher) {
          const response = await tokenRefresher(refreshToken);
          
          if (response && response.data && response.data.accessToken) {
            await setAccessToken(response.data.accessToken);
            // Set new token on the original request
            originalRequest.headers['Authorization'] = `Bearer ${response.data.accessToken}`;
            // Retry the original request with the new token
            return axiosInstance(originalRequest);
          }
        }
      } catch (refreshError) {
        logger.error('Token refresh failed:', refreshError);
        clearTokens();
        // Redirect to login or trigger auth event
        // window.location.href = '/login';
      }
    }
    
    // If refresh failed or not applicable, clear tokens on 401
    if (error.response?.status === 401) {
      clearTokens();
    }
    
    return Promise.reject(error);
  }
);

export const get = async <T = any>(endpoint: string, params?: any): Promise<AxiosResponse<T>> => {
  try {
    return await axiosInstance.get<T>(endpoint, { params });
  } catch (error) {
    logger.error(`GET ${endpoint} failed:`, error);
    throw error;
  }
};

export const post = async <T = any>(endpoint: string, data?: any): Promise<AxiosResponse<T>> => {
  try {
    return await axiosInstance.post<T>(endpoint, data);
  } catch (error) {
    logger.error(`POST ${endpoint} failed:`, error);
    throw error;
  }
};

export const put = async <T = any>(endpoint: string, data?: any): Promise<AxiosResponse<T>> => {
  try {
    return await axiosInstance.put<T>(endpoint, data);
  } catch (error) {
    logger.error(`PUT ${endpoint} failed:`, error);
    throw error;
  }
};

export const del = async <T = any>(endpoint: string, params?: any): Promise<AxiosResponse<T>> => {
  try {
    return await axiosInstance.delete<T>(endpoint, { params });
  } catch (error) {
    logger.error(`DELETE ${endpoint} failed:`, error);
    throw error;
  }
};

export const apiClient = {
  get,
  post,
  put,
  delete: del,
  instance: axiosInstance,
  clearTokens: () => clearTokens() // Use a function reference instead of direct method reference
};