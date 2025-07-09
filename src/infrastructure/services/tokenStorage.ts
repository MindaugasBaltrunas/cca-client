import * as jwtDecodeModule from 'jwt-decode';
import { logger } from '../../shared/utils/logger';

// Storage keys
const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const TOKEN_EXPIRY_KEY = 'auth_token_expiry';
const ID_KEY = 'auth_user_id';

// AES-GCM params
const IV_LENGTH = 12;
const EXPIRY_BUFFER_MS = 10000;

const jwtDecode = jwtDecodeModule as unknown as <T = { exp?: number }>(
  token: string
) => T;

// Interfaces
export interface TokenInfo {
  id?: string;
  token: string;
  refreshToken?: string | null | undefined;
  expiresIn?: number | undefined;
}

interface EncryptedData { 
  iv: number[]; 
  data: number[]; 
}

// In-memory CryptoKey
let cryptoKey: CryptoKey | null = null;

// Safe localStorage
const ls = (() => {
  try {
    localStorage.setItem('__t', '1');
    localStorage.removeItem('__t');
    return localStorage;
  } catch {
    return null;
  }
})();

const getKey = async (): Promise<CryptoKey> => {
  if (cryptoKey) return cryptoKey;
  if (!crypto?.subtle) throw new Error('Web Crypto API unavailable');
  cryptoKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  return cryptoKey;
};

const encrypt = async (plain: string): Promise<EncryptedData> => {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(plain));
  return { iv: Array.from(iv), data: Array.from(new Uint8Array(ct)) };
};

const decrypt = async ({ iv, data }: EncryptedData): Promise<string> => {
  const key = await getKey();
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(iv) }, key, new Uint8Array(data));
  return new TextDecoder().decode(pt);
};

async function secureSet(key: string, value: string | number): Promise<void> {
  if (!ls) return;
  try {
    const enc = await encrypt(String(value));
    ls.setItem(key, JSON.stringify(enc));
  } catch {
    ls.removeItem(key);
  }
}

async function secureGet(key: string): Promise<string | null> {
  if (!ls) return null;
  const raw = ls.getItem(key);
  if (!raw) return null;
  try {
    const enc: EncryptedData = JSON.parse(raw);
    return await decrypt(enc);
  } catch {
    ls.removeItem(key);
    return null;
  }
}

function secureRemove(key: string): void {
  ls?.removeItem(key);
}

// Token API
export const setId = (id: string) => secureSet(ID_KEY, id);
export const getId = () => secureGet(ID_KEY);
export const setAccessToken = (t: string) => secureSet(ACCESS_TOKEN_KEY, t);
export const getAccessToken = () => secureGet(ACCESS_TOKEN_KEY);
export const setRefreshToken = (t: string) => secureSet(REFRESH_TOKEN_KEY, t);
export const getRefreshToken = () => secureGet(REFRESH_TOKEN_KEY);
export const setTokenExpiry = (ms: number) => secureSet(TOKEN_EXPIRY_KEY, ms);

export async function getTokenExpiry(): Promise<number | null> {
  const v = await secureGet(TOKEN_EXPIRY_KEY);
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
}

export async function isTokenExpired(): Promise<boolean> {
  const e = await getTokenExpiry();
  return !e || Date.now() > e - EXPIRY_BUFFER_MS;
}

export function getExpiryDateFromToken(token: string): Date | null {
  try {
    const { exp } = jwtDecode<{ exp: number }>(token);
    return Number.isFinite(exp) ? new Date(exp * 1000) : null;
  } catch {
    return null;
  }
}

/**
 * Enhanced saveTokens with better validation and logging
 */
export async function saveTokens({ token, refreshToken, expiresIn, id }: TokenInfo): Promise<void> {
  try {
    // Validacija
    if (!token?.trim()) {
      throw new Error('Access token is required');
    }

    // Išsaugome access token
    await setAccessToken(token);

    // Išsaugome user ID jei pateiktas
    if (id?.trim()) {
      await setId(id);
    }

    // Refresh token handling
    if (refreshToken?.trim()) {
      await setRefreshToken(refreshToken);
    } else {
      secureRemove(REFRESH_TOKEN_KEY);
    }

    // Expiry handling - pataisyta logika
    if (expiresIn && Number.isFinite(expiresIn) && expiresIn > 0) {
      const expiryTimestamp = Date.now() + (expiresIn * 1000);
      await setTokenExpiry(expiryTimestamp);
    } else {
      // Jei nėra expiresIn, bandome gauti iš JWT token
      try {
        const expiryDate = getExpiryDateFromToken(token);
        if (expiryDate) {
          await setTokenExpiry(expiryDate.getTime());
        } else {
          secureRemove(TOKEN_EXPIRY_KEY);
        }
      } catch {
        secureRemove(TOKEN_EXPIRY_KEY);
      }
    }

    logger.debug('✅ Tokens saved successfully', {
      hasRefreshToken: !!refreshToken,
      hasExpiry: !!expiresIn,
      hasUserId: !!id
    });

  } catch (error) {
    logger.error('❌ Failed to save tokens:', error);
    throw error;
  }
}

export async function getAllTokens(): Promise<{ 
  accessToken: string | null; 
  refreshToken: string | null; 
  expiry: number | null;
}> {
  const [a, r, e] = await Promise.all([getAccessToken(), getRefreshToken(), getTokenExpiry()]);
  return { accessToken: a, refreshToken: r, expiry: e };
}

export function clearTokens(): void {
  [ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, TOKEN_EXPIRY_KEY, ID_KEY].forEach(secureRemove);
  cryptoKey = null;
  logger.debug('🗑️ All tokens cleared');
}