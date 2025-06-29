import { escapeHTML, sanitizeHTML, sanitizeUrl } from './xssGuard';

export { apiClient, API_CONFIG } from '../../shared/config/apiConfig';
export { authApi } from '../api/authApi';

export {
  sanitizeString,
  sanitizeHTML,
  sanitizeObject,
  escapeHTML,
  sanitizeUrl
} from './xssGuard';

export type {
  SignUpData,
  LoginState,
  AuthResponse,
  IVerify2FAResponse,
  TwoFactorSetupResponse,
  ApiError,
  TokenInfo
} from '../../shared/types/api.types';

export const safeDisplay = {
  text: (value: string | number | undefined | null): string => {
    if (value === undefined || value === null) return '';
    const textValue = String(value);
    return escapeHTML(textValue);
  },

  html: (content: string, allowedTags?: string[]): { __html: string } => {
    return { __html: sanitizeHTML(content, allowedTags) };
  },

  url: (url: string): string => {
    return sanitizeUrl(url);
  }
};