import { clearTokens, getAccessToken, getRefreshToken, setAccessToken } from "../../../infrastructure/services/tokenStorage";
import { logger } from "../../utils/logger";
import { API_CONFIG } from "../apiConfig";


let tokenRefresher: ((refreshToken: string) => Promise<{ data: { accessToken: string; refreshToken?: string } }>) | null = null;
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: any) => void; reject: (error: any) => void }> = [];

export const setTokenRefresher = (refresher: typeof tokenRefresher) => {
  tokenRefresher = refresher;
};

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  failedQueue = [];
};

export const authRequestInterceptor = async (config: any) => {
  if (!config.headers['X-API-Secret'] && API_CONFIG.API_SECRET) {
    config.headers['X-API-Secret'] = API_CONFIG.API_SECRET;
  }
  if (!config.url?.includes('auth:login') && !config.url?.includes('auth:register')) {
    const token = await getAccessToken();
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
};

export const authResponseErrorInterceptor = async (error: any, axiosInstance: any) => {
  const originalRequest = error.config;
  if (error.response?.status === 401 && !originalRequest._retry && tokenRefresher) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
        .then((token) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        });
    }
    originalRequest._retry = true;
    isRefreshing = true;
    try {
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        const { data } = await tokenRefresher(refreshToken);
        await setAccessToken(data.accessToken);
        processQueue(null, data.accessToken);
        originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
        return axiosInstance(originalRequest);
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
  return Promise.reject(error);
};
