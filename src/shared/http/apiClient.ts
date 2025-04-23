import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG } from '../config/apiConfig';
import { requestInterceptor, requestErrorHandler } from './requestInterceptor';
import { responseSuccessHandler, createResponseErrorHandler } from './responseInterceptor';
import { logger } from '../utils/logger';
import { refreshToken } from '../../infrastructure/api/authApi';

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

  const responseErrorHandler = createResponseErrorHandler(instance, refreshToken);

  instance.interceptors.response.use(
    responseSuccessHandler,
    responseErrorHandler
  );

  return instance;
};

const axiosInstance = createHttpClient();

const createRequestFunction = <T extends any[], R>(
  method: (...args: T) => Promise<R>,
  methodName: string
) => async (...args: T): Promise<R> => {
  try {
    return await method(...args);
  } catch (error) {
    const endpoint = args[0] || 'unknown endpoint';
    logger.error(`${methodName.toUpperCase()} request to ${endpoint} failed:`, error);
    throw error;
  }
};

export const get = createRequestFunction(
  <T = any>(endpoint: string, params?: any, config?: AxiosRequestConfig) => 
    axiosInstance.get<T, AxiosResponse<T>>(endpoint, { ...config, params }),
  'get'
);

export const post = createRequestFunction(
  <T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig) => 
    axiosInstance.post<T, AxiosResponse<T>>(endpoint, data, config),
  'post'
);

export const put = createRequestFunction(
  <T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig) => 
    axiosInstance.put<T, AxiosResponse<T>>(endpoint, data, config),
  'put'
);

export const patch = createRequestFunction(
  <T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig) => 
    axiosInstance.patch<T, AxiosResponse<T>>(endpoint, data, config),
  'patch'
);

export const del = createRequestFunction(
  <T = any>(endpoint: string, params?: any, config?: AxiosRequestConfig) => 
    axiosInstance.delete<T, AxiosResponse<T>>(endpoint, { ...config, params }),
  'delete'
);

export const apiClient = {
  get,
  post,
  put,
  patch,
  delete: del,
  instance: axiosInstance
};