// apiClient.ts - Funkcinis API klientas

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { sanitizeObject } from '../../infrastructure/services/xssGuard';
import { tokenStorage } from '../../infrastructure/services/tokenStorage';


// API konfigūracija
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080',
  SECRET_KEY: '1234567890abcdefg',
  API_KEY: '1234567890abcdefg',
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

// Sukuriame Axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Secret': API_CONFIG.SECRET_KEY,
  },
});

/**
 * Dezinfekuoja užklausos duomenis prieš siunčiant į serverį
 * @param data Duomenys, kuriuos reikia dezinfekuoti
 * @returns Dezinfekuoti duomenys
 */
const sanitizeRequestData = (data: any): any => {
  // Jei duomenyse yra slaptažodis, jo nedezinfekuojame
  const sanitizedData = { ...data };
  
  // Kopijuojame slaptažodį (jei jis yra) prieš dezinfekciją
  const password = data.password;
  const confirmPassword = data.confirmPassword || data.passwordConfirm;
  const adminPassword = data.adminPassword;
  
  // Dezinfekuojame visus duomenis
  const result = sanitizeObject(sanitizedData);
  
  // Grąžiname originalius slaptažodžius, nes jie gali turėti specialių simbolių
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

// Konfigūruojame request interceptorių
axiosInstance.interceptors.request.use(
  (config) => {
    // Nustatome API endpoint pagal URL
    const endpointPath = config.url?.split('/').pop();
    if (endpointPath) {
      config.headers['X-API-Endpoint'] = endpointPath;
    }

    // Pridedame API key 2FA operacijoms
    if (
      config.url?.includes('2fa') || 
      config.url?.includes('admin-login')
    ) {
      config.headers['X-API-Key'] = API_CONFIG.API_KEY;
    }

    // Pridedame Authorization header, jei yra token
    const { token } = tokenStorage.getToken();
    if (token && !config.url?.includes('login') && !config.url?.includes('register')) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Nustatome API URL
    config.url = '/api';
    
    // Dezinfekuojame duomenis užklausoje
    if (config.data && typeof config.data === 'object') {
      config.data = sanitizeRequestData(config.data);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Konfigūruojame response interceptorių
axiosInstance.interceptors.response.use(
  (response) => {
    // Dezinfekuojame atsakymo duomenis
    if (response.data) {
      response.data = sanitizeObject(response.data);
    }
    return response;
  },
  (error) => {
    // Tikriname ar klaida yra dėl autentifikacijos (401)
    if (error.response && error.response.status === 401) {
      // Išvalome žetonus jei autentifikacija nepavyko
      tokenStorage.clearToken();
    }
    return Promise.reject(error);
  }
);

/**
 * Sukuria saugią GET užklausą
 * @param endpoint API endpoint
 * @param params Užklausos parametrai
 * @returns Promise su atsakymu
 */
export const get = async <T = any>(endpoint: string, params?: any): Promise<AxiosResponse<T>> => {
  return axiosInstance.get<T>(endpoint, { params });
};

/**
 * Sukuria saugią POST užklausą
 * @param endpoint API endpoint
 * @param data Užklausos duomenys
 * @returns Promise su atsakymu
 */
export const post = async <T = any>(endpoint: string, data?: any): Promise<AxiosResponse<T>> => {
  return axiosInstance.post<T>(endpoint, data);
};

/**
 * Sukuria saugią PUT užklausą
 * @param endpoint API endpoint
 * @param data Užklausos duomenys
 * @returns Promise su atsakymu
 */
export const put = async <T = any>(endpoint: string, data?: any): Promise<AxiosResponse<T>> => {
  return axiosInstance.put<T>(endpoint, data);
};

/**
 * Sukuria saugią DELETE užklausą
 * @param endpoint API endpoint
 * @param params Užklausos parametrai
 * @returns Promise su atsakymu
 */
export const del = async <T = any>(endpoint: string, params?: any): Promise<AxiosResponse<T>> => {
  return axiosInstance.delete<T>(endpoint, { params });
};

// Eksportuojame visas funkcijas kartu
export const apiClient = {
  get,
  post,
  put,
  delete: del, // Pervadiname, nes 'delete' yra rezervuotas žodis
  instance: axiosInstance
};