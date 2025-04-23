import { sanitizeObject } from './xssGuard';

const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const TOKEN_EXPIRY_KEY = 'auth_token_expiry';

const ALGORITHM = { name: "AES-GCM", length: 256 };
const IV_LENGTH = 12;

interface TokenInfo {
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

interface EncryptedData {
  iv: number[];
  data: number[];
}

const createSecureTokenStorage = () => {
  let cryptoKey: CryptoKey | null = null;

  const generateKey = async (): Promise<CryptoKey> => {
    if (cryptoKey) return cryptoKey;

    cryptoKey = await crypto.subtle.generateKey(
      ALGORITHM, 
      true, 
      ['encrypt', 'decrypt']
    );
    
    return cryptoKey;
  };

  const encrypt = async (text: string): Promise<EncryptedData> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const key = await generateKey();

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv }, 
      key, 
      data
    );

    return {
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted))
    };
  };

  const decrypt = async (encryptedData: EncryptedData): Promise<string> => {
    const iv = new Uint8Array(encryptedData.iv);
    const data = new Uint8Array(encryptedData.data);
    const key = await generateKey();

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv }, 
      key, 
      data
    );
    
    return new TextDecoder().decode(decrypted);
  };

  const setItem = async (key: string, value: string): Promise<void> => {
    const encrypted = await encrypt(value);
    localStorage.setItem(key, JSON.stringify(encrypted));
  };

  const getItem = async (key: string): Promise<string | null> => {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    try {
      const encrypted: EncryptedData = JSON.parse(raw);
      return await decrypt(encrypted);
    } catch (err) {
      console.error(`Decrypting "${key}" failed:`, err);
      return null;
    }
  };

  const setAccessToken = async (token: string): Promise<void> => {
    return setItem(ACCESS_TOKEN_KEY, token);
  };

  const getAccessToken = async (): Promise<string | null> => {
    return getItem(ACCESS_TOKEN_KEY);
  };

  const setRefreshToken = async (token: string): Promise<void> => {
    return setItem(REFRESH_TOKEN_KEY, token);
  };

  const getRefreshToken = async (): Promise<string | null> => {
    return getItem(REFRESH_TOKEN_KEY);
  };

  const setTokenExpiry = async (expiryTime: number): Promise<void> => {
    return setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
  };

  const getTokenExpiry = async (): Promise<number | null> => {
    const expiry = await getItem(TOKEN_EXPIRY_KEY);
    return expiry ? parseInt(expiry, 10) : null;
  };

  const isTokenExpired = async (): Promise<boolean> => {
    const expiry = await getTokenExpiry();
    if (!expiry) return true;
    
    return Date.now() > (expiry - 10000);
  };

  const saveTokens = async (tokenInfo: TokenInfo): Promise<void> => {
    try {
      const sanitized = sanitizeObject(tokenInfo);

      await setAccessToken(sanitized.token);

      if (sanitized.refreshToken) {
        await setRefreshToken(sanitized.refreshToken);
      }
      
      if (sanitized.expiresIn) {
        const expiryTime = Date.now() + (sanitized.expiresIn * 1000);
        await setTokenExpiry(expiryTime);
      }
    } catch (err) {
      console.error('Failed to save tokens:', err);
      throw err;
    }
  };

  const clearTokens = (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);

    cryptoKey = null;
  };

  const getAllTokens = async (): Promise<{
    accessToken: string | null;
    refreshToken: string | null;
    expiry: number | null;
  }> => {
    const [accessToken, refreshToken, expiry] = await Promise.all([
      getAccessToken(),
      getRefreshToken(),
      getTokenExpiry()
    ]);
    
    return {
      accessToken,
      refreshToken,
      expiry
    };
  };

  return {
    setAccessToken,
    getAccessToken,
    setRefreshToken,
    getRefreshToken,
    setTokenExpiry,
    getTokenExpiry,
    isTokenExpired,
    saveTokens,
    getAllTokens,
    clear: clearTokens
  };
};

export const secureTokenStorage = createSecureTokenStorage();

export const {
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
  getTokenExpiry,
  setTokenExpiry,
  isTokenExpired,
  saveTokens,
  getAllTokens,
  clear: clearTokens
} = secureTokenStorage;