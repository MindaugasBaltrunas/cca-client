import { API_CONFIG } from '../config/apiConfig';
import axiosInstance, {
  get,
  post,
  put,
  patch,
  del,
  getWithInstance,
  postWithInstance
} from './apiClient';

export const apiClient = axiosInstance;

// HTTP utilities (naudojama authApi)
export const http = {
  get: (url: string, params?: any) => get(url, params),
  post: (url: string, data?: any) => post(url, data),
  put: (url: string, data?: any) => put(url, data),
  patch: (url: string, data?: any) => patch(url, data),
  delete: (url: string, params?: any) => del(url, params)
};

// PATAISYTAS httpWithInstance (jei reikia ateityje)
export const httpWithInstance = {
  get: (url: string, params?: any) => getWithInstance(apiClient, url, params),
  post: (url: string, data?: any) => postWithInstance(apiClient, url, data),
  put: (url: string, data?: any) => apiClient.put(url, data),      
  patch: (url: string, data?: any) => apiClient.patch(url, data),   
  delete: (url: string, params?: any) => apiClient.delete(url, params) 
};

const defaultExport = {
  client: apiClient,
  ...http,
  config: API_CONFIG
};

export default defaultExport;