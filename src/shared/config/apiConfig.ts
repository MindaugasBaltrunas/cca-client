// shared/config/apiConfig.ts

export const API_CONFIG = {
    BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api',
    API_PATH: '/v1',
    API_SECRET: process.env.REACT_APP_API_SECRET || '',
    API_KEY: process.env.REACT_APP_API_KEY || '',
    TOKEN_EXPIRY_BUFFER: 60000, // 1 minute buffer before token expiry
  };
  
  export const AUTH_ENDPOINTS = {
    REGISTER: 'register',
    LOGIN: 'login',
    ADMIN_LOGIN: 'admin/login',
    LOGOUT: 'logout',
    CURRENT_USER: 'current-user',
    REFRESH_TOKEN: 'refresh-token',
    TWO_FACTOR_SETUP: '2fa/setup',
    TWO_FACTOR_VERIFY: '2fa/verify',
    TWO_FACTOR_ENABLE: '2fa/enable',
    TWO_FACTOR_DISABLE: '2fa/disable',
  };