import { sanitizeString } from './xssGuard';

interface TokenInfo {
  token: string;
  id: string;
  refreshToken?: string;
}

const TOKEN_KEY = 'token';
const USER_ID_KEY = 'id';
const REFRESH_TOKEN_KEY = 'refreshToken';
const EXPIRES_AT_KEY = 'expiresAt';

export const saveTokens = (tokenInfo: TokenInfo): void => {
  try {
    if (!tokenInfo.token || !tokenInfo.id) {
      console.error('Token data is not valid:', tokenInfo);
      return;
    }

    const safeToken = sanitizeString(tokenInfo.token);
    const safeId = sanitizeString(tokenInfo.id);

    localStorage.setItem(TOKEN_KEY, safeToken);
    localStorage.setItem(USER_ID_KEY, safeId);

    if (tokenInfo.refreshToken) {
      localStorage.setItem(
        REFRESH_TOKEN_KEY, 
        sanitizeString(tokenInfo.refreshToken)
      );
    }

  } catch (error) {
    console.error('Error to save token:', error);
  }
};

export const getToken = (): { token: string | null; id: string | null } => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const id = localStorage.getItem(USER_ID_KEY);
    return { token, id };
  } catch (error) {
    console.error('Get token error:', error);
    return { token: null, id: null };
  }
};

export const getRefreshToken = (): string | null => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Get refresh token error:', error);
    return null;
  }
};

export const getExpiresAt = (): number | null => {
  try {
    const expiresAt = localStorage.getItem(EXPIRES_AT_KEY);
    return expiresAt ? parseInt(expiresAt, 10) : null;
  } catch (error) {
    console.error('Get expires at error:', error);
    return null;
  }
};

export const isTokenExpired = (): boolean => {
  const expiresAt = getExpiresAt();
  if (!expiresAt) return true;
  return Date.now() >= expiresAt;
};

export const isTokenExpiringNear = (): boolean => {
  const expiresAt = getExpiresAt();
  if (!expiresAt) return true;

  const fiveMinutesInMs = 5 * 60 * 1000;
  return Date.now() >= (expiresAt - fiveMinutesInMs);
};

export const clearToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(EXPIRES_AT_KEY);
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

export const tokenStorage = {
  saveTokens,
  getToken,
  getRefreshToken,
  getExpiresAt,
  isTokenExpired,
  isTokenExpiringNear,
  clearToken
};