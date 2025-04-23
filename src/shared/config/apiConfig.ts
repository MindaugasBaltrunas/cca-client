import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { sanitizeObject } from '../../infrastructure/services/xssGuard';
import { logger } from '../utils/logger';
import { clearTokens, getAccessToken } from '../http';

export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080',
  SECRET_KEY: '1234567890abcdefg',
  API_KEY: '1234567890abcdefg',
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

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Secret': API_CONFIG.SECRET_KEY,
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
          logger.error('Error retrieving access token:', tokenError);
        }
      }

      config.url = '/api';

      if (config.data && typeof config.data === 'object') {
        config.data = sanitizeRequestData(config.data);
      }

      return config;
    } catch (error) {
      logger.error('Request interceptor error:', error);
      return config;
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
  (error) => {
    if (error.response && error.response.status === 401) {
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
  clearTokens
}