import * as jwtDecodeModule from 'jwt-decode';
import { logger } from '../../shared/utils/logger';

const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const TOKEN_EXPIRY_KEY = 'auth_token_expiry';
const ID_KEY = 'auth_user_id';

const IV_LENGTH = 12;
const EXPIRY_BUFFER_MS = 10000;

const jwtDecode = jwtDecodeModule as unknown as <T = { exp?: number }>(token: string) => T;

export interface TokenInfo {
  id?: string;
  token: string;
  refreshToken?: string | null | undefined;
  expiresIn?: number | undefined;
  enable: boolean;
}

interface EncryptedData { iv: number[]; data: number[]; }
let cryptoKey: CryptoKey | null = null;

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

export const setId = (id: string) => secureSet(ID_KEY, id);
export const getId = () => secureGet(ID_KEY);

export const setAccessToken = (t: string) => secureSet(ACCESS_TOKEN_KEY, t);
export const getAccessToken = () => secureGet(ACCESS_TOKEN_KEY);

export const setRefreshToken = (t: string) => secureSet(REFRESH_TOKEN_KEY, t);
export const getRefreshToken = () => secureGet(REFRESH_TOKEN_KEY);

export const setTokenExpiry = (ms: number) => secureSet(TOKEN_EXPIRY_KEY, ms);
export const getTokenExpiry = async () => {
  const v = await secureGet(TOKEN_EXPIRY_KEY);
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
};

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

export async function saveTokens({ token, refreshToken, expiresIn, id }: TokenInfo): Promise<void> {
  try {
    if (!token?.trim()) throw new Error('Access token is required');

    await setAccessToken(token);

    if (id?.trim()) await setId(id);

    if (refreshToken?.trim()) await setRefreshToken(refreshToken);
    else secureRemove(REFRESH_TOKEN_KEY);

    if (expiresIn && Number.isFinite(expiresIn) && expiresIn > 0) {
      await setTokenExpiry(Date.now() + expiresIn * 1000);
    } else {
      const expiryDate = getExpiryDateFromToken(token);
      expiryDate ? await setTokenExpiry(expiryDate.getTime()) : secureRemove(TOKEN_EXPIRY_KEY);
    }

  } catch (error) {
    logger.error('❌ Failed to save tokens:', error);
    throw error;
  }
}

export async function getAllTokens() {
  const [accessToken, refreshToken, expiry, id] = await Promise.all([
    getAccessToken(),
    getRefreshToken(),
    getTokenExpiry(),
    getId(),
  ]);
  return { accessToken, refreshToken, expiry, id };
}

export function clearTokens(): void {
  [ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, TOKEN_EXPIRY_KEY, ID_KEY].forEach(secureRemove);
  cryptoKey = null;
}

export async function hydrateAuthQuery(queryClient: any) {
  const tokens = await getAllTokens();
  queryClient.setQueryData(['auth-tokens'], {
    accessToken: tokens.accessToken,
    userId: tokens.id,
    hasAccessToken: !!tokens.accessToken,
    hasUserId: !!tokens.id,
    hasValidToken: !!tokens.accessToken && !!tokens.id
  });
  return tokens;
}
