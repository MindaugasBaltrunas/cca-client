import axios from 'axios';

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

/**
 * Sukuriame axios instance su pradiniais nustatymais
 */
export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Secret': API_CONFIG.SECRET_KEY,
  },
});

/**
 * Pridedame request interceptor, kuris prideda reikalingus headerius
 */
apiClient.interceptors.request.use(
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
    const token = localStorage.getItem('token');
    if (token && !config.url?.includes('login') && !config.url?.includes('register')) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Nustatome API URL
    config.url = '/api';
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);