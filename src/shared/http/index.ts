import axiosInstance, { get, post, put, patch, del } from './apiClient';

export const apiClient = axiosInstance;

export const http = {
  get: (url: string, params?: any) => get(apiClient, url, params),
  post: (url: string, data?: any) => post(apiClient, url, data),
  put: (url: string, data?: any) => put(apiClient, url, data),
  patch: (url: string, data?: any) => patch(apiClient, url, data),
  delete: (url: string, params?: any) => del(apiClient, url, params)
};

export { API_CONFIG } from '../config/apiConfig';

export {
    requestInterceptor,
    requestErrorHandler,
    applyCommonHeaders,
    applyAuthHeaders,
    applyEndpointSpecificHeaders,
    sanitizeRequest,
    standardizeApiUrl
} from './requestInterceptor';

export {
    responseSuccessHandler,
    createResponseErrorHandler
} from './responseInterceptor';