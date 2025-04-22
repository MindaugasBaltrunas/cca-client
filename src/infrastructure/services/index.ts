// index.ts - Pagrindinis eksportų failas funkciniame stiliuje

import { escapeHTML, sanitizeHTML, sanitizeUrl } from './xssGuard';

// API konfigūracija
export { API_CONFIG } from '../../shared/config/apiConfig';

// API klientai ir servisai
export { apiClient } from '../../shared/config/apiConfig';
export { authApi } from '../api/authApi';
export { tokenStorage } from './tokenStorage';
export { xssGuard } from './xssGuard';

// Tiesioginiai XSS funkcijų eksportai supaprastintam naudojimui
export {
  sanitizeString,
  sanitizeHTML,
  sanitizeObject,
  escapeHTML,
  sanitizeUrl
} from './xssGuard';

// Eksportuojame taip pat ir tipų apibrėžimus
export type {
  SignInCredentials,
  SignUpData,
  LoginState,
  UserData,
  AuthResponse,
  IVerify2FAResponse,
  TwoFactorSetupResponse,
  ApiError,
  TokenInfo
} from '../../shared/types/api.types';

// Saugaus atvaizdavimo pagalbinės funkcijos
export const safeDisplay = {
  /**
   * Saugiai atvaizduoja tekstą apsaugant nuo XSS
   */
  text: (value: string | number | undefined | null): string => {
    if (value === undefined || value === null) return '';
    const textValue = String(value);
    return escapeHTML(textValue);
  },
  
  /**
   * Saugiai atvaizduoja HTML turinį (naudoti atsargiai ir tik patikimam turiniui)
   */
  html: (content: string, allowedTags?: string[]): { __html: string } => {
    return { __html: sanitizeHTML(content, allowedTags) };
  },
  
  /**
   * Saugiai atvaizduoja URL adresus
   */
  url: (url: string): string => {
    return sanitizeUrl(url);
  }
};