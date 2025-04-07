import { jwtDecode } from 'jwt-decode';
import { API_CONFIG } from '../../shared/config/apiConfig';

interface DecodedToken {
  exp: number;
  userId: string;
  [key: string]: any;
}

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const EXPIRY_KEY = 'auth_token_expiry';

export const tokenService = {
  setToken: (token: string, refreshToken: string): void => {
    const decoded = decodeToken(token);
    const expiresAt = decoded?.exp ? decoded.exp * 1000 : 0;
    
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(EXPIRY_KEY, expiresAt.toString());
  },

  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  getTokenExpiry: (): number => {
    const expiry = localStorage.getItem(EXPIRY_KEY);
    return expiry ? parseInt(expiry, 10) : 0;
  },

  clearTokens: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(EXPIRY_KEY);
  },

  isTokenExpired: (): boolean => {
    const token = tokenService.getToken();
    if (!token) return true;

    try {
      const decoded = decodeToken(token);
      if (!decoded) return true;
      
      const currentTime = Date.now();
      // Add a buffer time to handle token refresh before it actually expires
      return (decoded.exp * 1000) < (currentTime + API_CONFIG.TOKEN_EXPIRY_BUFFER);
    } catch (error) {
      return true;
    }
  },

  getUserIdFromToken: (): string | null => {
    const token = tokenService.getToken();
    if (!token) return null;
    
    const decoded = decodeToken(token);
    return decoded?.userId || null;
  },

  shouldRefreshToken: (): boolean => {
    return tokenService.isTokenExpired() && !!tokenService.getRefreshToken();
  }
};

function decodeToken(token: string): DecodedToken | null {
  if (!token) return null;

  try {
    return jwtDecode<DecodedToken>(token);
  } catch {
    return null;
  }
}