import { logger } from '../utils/logger';

const getEnvVar = (name: string, defaultValue = '', required = false): string => {
  const value = process.env[name] || defaultValue;
  if (required && !value) {
    logger.error(`Required environment variable ${name} is not set`);
    throw new Error(`Missing required environment variable: ${name}`);
  }
  if (!value && defaultValue) {
    logger.warn(`${name} not set, using default: ${defaultValue}`);
  }
  return value;
};

export const API_CONFIG = {
  BASE_URL: getEnvVar('REACT_APP_API_BASE_URL'),
  API_SECRET: getEnvVar('REACT_APP_API_SECRET'),
  API_KEY: getEnvVar('REACT_APP_API_KEY', '', false),
  REQUEST_TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  ENDPOINTS: {
    AUTH: {
      SIGN_IN: 'auth:login',
      ADMIN_SIGN_IN: 'auth:admin-login',
      SIGN_UP: 'auth:register',
      SIGN_OUT: 'auth:logout',
      REFRESH_TOKEN: 'auth:refresh-token',
      TWO_FACTOR: {
        SETUP: 'auth:2fa-setup',
        ENABLE: 'auth:2fa-enable',
        DISABLE: 'auth:2fa-disable',
        VERIFY: 'auth:2fa-verify',
      },
    },
  },
} as const;