// tokenStorage.ts - Funkcinis žetonų valdymo servisas

import { sanitizeString } from './xssGuard';

interface TokenInfo {
  token: string;
  id: string;
  refreshToken?: string;
  expiresAt?: number;
}

// Konstantos
const TOKEN_KEY = 'token';
const USER_ID_KEY = 'id';
const REFRESH_TOKEN_KEY = 'refreshToken';
const EXPIRES_AT_KEY = 'expiresAt';

/**
 * Saugoti autentifikacijos žetonus
 * @param tokenInfo Žetonų informacija
 */
export const saveTokens = (tokenInfo: TokenInfo): void => {
  try {
    // Tikriname ar būtini laukai egzistuoja
    if (!tokenInfo.token || !tokenInfo.id) {
      console.error('Bandoma išsaugoti nepilnus žetono duomenis');
      return;
    }

    // Išvalome duomenis prieš saugojimą
    const safeToken = sanitizeString(tokenInfo.token);
    const safeId = sanitizeString(tokenInfo.id);

    // Saugome žetonus localStorage (geriau naudoti SessionStorage arba atskirus metodus)
    localStorage.setItem(TOKEN_KEY, safeToken);
    localStorage.setItem(USER_ID_KEY, safeId);

    // Saugome papildomus žetonus, jei jie egzistuoja
    if (tokenInfo.refreshToken) {
      localStorage.setItem(
        REFRESH_TOKEN_KEY, 
        sanitizeString(tokenInfo.refreshToken)
      );
    }

    if (tokenInfo.expiresAt) {
      localStorage.setItem(
        EXPIRES_AT_KEY, 
        tokenInfo.expiresAt.toString()
      );
    }
  } catch (error) {
    console.error('Klaida išsaugant žetonus:', error);
  }
};

/**
 * Gauti autentifikacijos žetoną ir vartotojo ID
 */
export const getToken = (): { token: string | null; id: string | null } => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const id = localStorage.getItem(USER_ID_KEY);
    return { token, id };
  } catch (error) {
    console.error('Klaida gaunant žetoną:', error);
    return { token: null, id: null };
  }
};

/**
 * Gauti refresh žetoną
 */
export const getRefreshToken = (): string | null => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Klaida gaunant refresh žetoną:', error);
    return null;
  }
};

/**
 * Gauti token galiojimo pabaigos laiką
 */
export const getExpiresAt = (): number | null => {
  try {
    const expiresAt = localStorage.getItem(EXPIRES_AT_KEY);
    return expiresAt ? parseInt(expiresAt, 10) : null;
  } catch (error) {
    console.error('Klaida gaunant galiojimo laiką:', error);
    return null;
  }
};

/**
 * Patikrinti, ar token jau nebegalioja
 */
export const isTokenExpired = (): boolean => {
  const expiresAt = getExpiresAt();
  if (!expiresAt) return true;
  return Date.now() >= expiresAt;
};

/**
 * Patikrinti, ar token greitai baigs galioti (per 5 minutes)
 */
export const isTokenExpiringNear = (): boolean => {
  const expiresAt = getExpiresAt();
  if (!expiresAt) return true;

  const fiveMinutesInMs = 5 * 60 * 1000;
  return Date.now() >= (expiresAt - fiveMinutesInMs);
};

/**
 * Išvalyti visus token duomenis
 */
export const clearToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(EXPIRES_AT_KEY);
  } catch (error) {
    console.error('Klaida išvalant žetonus:', error);
  }
};

// Eksportuojame visas funkcijas kartu
export const tokenStorage = {
  saveTokens,
  getToken,
  getRefreshToken,
  getExpiresAt,
  isTokenExpired,
  isTokenExpiringNear,
  clearToken
};