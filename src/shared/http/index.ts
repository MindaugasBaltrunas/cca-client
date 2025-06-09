import { API_CONFIG, debugApiConfig } from '../config/apiConfig';
import axiosInstance, { 
  get, 
  post, 
  put, 
  patch, 
  del,
  debugHttpClient,
  getWithInstance,
  postWithInstance
} from './apiClient';

export const apiClient = axiosInstance;

export const http = {
  get: (url: string, params?: any) => get(url, params),
  post: (url: string, data?: any) => post(url, data),
  put: (url: string, data?: any) => put(url, data),
  patch: (url: string, data?: any) => patch(url, data),
  delete: (url: string, params?: any) => del(url, params)
};

export const httpWithInstance = {
  get: (url: string, params?: any) => getWithInstance(apiClient, url, params),
  post: (url: string, data?: any) => postWithInstance(apiClient, url, data),
  put: (url: string, data?: any) => put(url, data),
  patch: (url: string, data?: any) => patch(url, data),
  delete: (url: string, params?: any) => del(url, params)
};

export { API_CONFIG, debugApiConfig } from '../config/apiConfig';

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

export { debugHttpClient };

export const api = {
  ...http,
  
  instance: apiClient,
  
  debug: () => {
    debugApiConfig();
    debugHttpClient();
  },
  
  healthCheck: () => get('/health'),
};

const defaultExport = {
  client: apiClient,
  http,
  api,
  config: API_CONFIG,
  debug: api.debug
};

export default defaultExport;