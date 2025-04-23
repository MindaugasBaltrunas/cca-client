import { sanitizeObject } from './xssGuard';

interface TokenInfo {
  token: string;
  id: string;
  refreshToken?: string;
}

interface EncryptedData {
  iv: number[];
  data: number[];
}

const ALGORITHM = { name: "AES-GCM", length: 256 };
const IV_LENGTH = 12;

const createSecureTokenStorage = () => {
  let cryptoKey: CryptoKey | null = null;

  const generateKey = async (): Promise<CryptoKey> => {
    if (cryptoKey) return cryptoKey;

    cryptoKey = await crypto.subtle.generateKey(ALGORITHM, true, ['encrypt', 'decrypt']);
    return cryptoKey;
  };

  const encrypt = async (text: string): Promise<EncryptedData> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const key = await generateKey();

    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);

    return {
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted))
    };
  };

  const decrypt = async (encryptedData: EncryptedData): Promise<string> => {
    const iv = new Uint8Array(encryptedData.iv);
    const data = new Uint8Array(encryptedData.data);
    const key = await generateKey();

    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
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

  const saveTokens = async (tokenInfo: TokenInfo): Promise<void> => {
    try {
      const sanitized = sanitizeObject(tokenInfo);

      if (!sanitized.token || !sanitized.id) {
        throw new Error('Missing required fields: token or id');
      }

      await setItem('token', sanitized.token);
      await setItem('id', sanitized.id);

      if (sanitized.refreshToken) {
        await setItem('refreshToken', sanitized.refreshToken);
      }
    } catch (err) {
      console.error('Failed to save tokens:', err);
    }
  };

  const getToken = () => getItem('token');
  const getId = () => getItem('id');
  const getRefreshToken = () => getItem('refreshToken');

  const clear = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('id');
    localStorage.removeItem('refreshToken');
  };

  return {
    saveTokens,
    getToken,
    getId,
    getRefreshToken,
    clear
  };
};

export const secureTokenStorage = createSecureTokenStorage();
