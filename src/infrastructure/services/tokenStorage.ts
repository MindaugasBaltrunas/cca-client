const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const TOKEN_EXPIRY_KEY = 'auth_token_expiry';

// Define the algorithm parameters here, within the storage module
const ALGORITHM_PARAMS: AesGcmParams = { name: "AES-GCM", iv: new Uint8Array() }; // IV is generated per encryption
const IV_LENGTH = 12; // Standard length for AES-GCM IV

// Buffer time before actual expiry to consider token expired (e.g., for network latency)
const EXPIRY_BUFFER_MS = 10000; // 10 seconds

// Define the interface for TokenInfo here if it's only used by the storage
interface TokenInfo {
    token: string;
    refreshToken?: string;
    expiresIn?: number; // seconds until expiry
}

interface EncryptedData {
    iv: number[];
    data: number[];
}

/**
 * Creates a secure token storage utility using Web Crypto API for encryption
 * before storing data in localStorage.
 * Note: While this adds a layer of security over plain localStorage,
 * it does not protect against all forms of attack (e.g., memory inspection).
 */
const createSecureTokenStorage = () => {
    // cryptoKey is stored in the closure to be generated once and reused
    // Key is stored in memory only, not persisted
    let cryptoKey: CryptoKey | null = null;

    /**
     * Generates or retrieves the encryption key.
     * The key is generated once per page load.
     * @returns {Promise<CryptoKey>} The encryption key.
     */
    const generateKey = async (): Promise<CryptoKey> => {
        // Check if crypto is available (e.g., in non-secure contexts or server-side rendering)
        if (typeof crypto === 'undefined' || !crypto.subtle) {
             console.error("Web Crypto API is not available. Secure token storage disabled.");
             // In a real app, you might want to fall back to insecure storage or prevent auth features
             throw new Error("Web Crypto API not available");
        }

        if (cryptoKey) {
            return cryptoKey;
        }

        // Generate a new key if one doesn't exist
        cryptoKey = await crypto.subtle.generateKey(
            { name: ALGORITHM_PARAMS.name, length: 256 }, // AES-GCM with 256-bit key
            true, // Key is extractable (can be exported, though not needed for this use case)
            ['encrypt', 'decrypt'] // Key usages
        );

        return cryptoKey;
    };

    /**
     * Encrypts a string using AES-GCM.
     * @param {string} text - The text to encrypt.
     * @returns {Promise<EncryptedData | null>} The encrypted data including IV, or null on failure.
     */
    const encrypt = async (text: string): Promise<EncryptedData | null> => {
        try {
            // Ensure text is a string before encoding
            if (typeof text !== 'string') {
                 console.error("Encryption input must be a string.");
                 return null;
            }
            const encoder = new TextEncoder();
            const data = encoder.encode(text);
            const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH)); // Generate a unique IV for each encryption

            const key = await generateKey(); // Ensure key is generated

            const encrypted = await crypto.subtle.encrypt(
                { name: ALGORITHM_PARAMS.name, iv }, // Use AES-GCM with the specific IV
                key,
                data
            );

            // Return IV and encrypted data as arrays of numbers for JSON serialization
            return {
                iv: Array.from(iv),
                data: Array.from(new Uint8Array(encrypted))
            };
        } catch (error) {
            console.error("Encryption failed:", error);
            // Handle specific crypto errors if needed
            return null; // Return null on failure
        }
    };

    /**
     * Decrypts data using AES-GCM.
     * @param {EncryptedData} encryptedData - The data to decrypt, including IV.
     * @returns {Promise<string | null>} The decrypted text, or null if decryption fails or data is invalid.
     */
    const decrypt = async (encryptedData: EncryptedData): Promise<string | null> => {
         if (!encryptedData || !Array.isArray(encryptedData.iv) || !Array.isArray(encryptedData.data)) {
             console.error("Invalid data format for decryption.");
             return null;
         }
        try {
            const iv = new Uint8Array(encryptedData.iv);
            const data = new Uint8Array(encryptedData.data);

            // Basic IV length validation
            if (iv.length !== IV_LENGTH) {
                 console.error("Invalid IV length for decryption.");
                 return null;
            }

            const key = await generateKey(); // Ensure key is generated

            const decrypted = await crypto.subtle.decrypt(
                { name: ALGORITHM_PARAMS.name, iv }, // Use AES-GCM with the stored IV
                key,
                data
            );

            return new TextDecoder().decode(decrypted);
        } catch (err) {
            // This catches errors during decryption, e.g., wrong key, corrupt data, invalid IV
            console.error(`Decryption failed:`, err);
            return null; // Return null on failure
        }
    };

     /**
      * Safely get localStorage.
      * @returns {Storage | undefined} localStorage object or undefined if not available.
      */
     const getLocalStorage = (): Storage | undefined => {
         try {
             // Accessing `localStorage` can throw in some environments (e.g., strict CSP, private Browse)
             const storage = localStorage;
             const x = '__storage_test__';
             storage.setItem(x, x);
             storage.removeItem(x);
             return storage;
         } catch (e) {
             console.warn("localStorage not available or not usable:", e);
             return undefined;
         }
     };


    /**
     * Encrypts and stores a value in localStorage.
     * @param {string} key - The localStorage key.
     * @param {string} value - The value to store.
     * @returns {Promise<void>}
     */
    const setItem = async (key: string, value: string): Promise<void> => {
        const storage = getLocalStorage();
        if (!storage) {
            return;
        }
        try {
            const encrypted = await encrypt(value);
            if (encrypted) {
                 storage.setItem(key, JSON.stringify(encrypted));
            } else {
                 console.warn(`Encryption failed for key "${key}", item not stored.`);
                 // Optional: clear previous value if encryption failed
                 storage.removeItem(key);
            }
        } catch (error) {
            console.error(`Failed to encrypt and set item "${key}":`, error);
            // Depending on requirements, you might want to throw or handle differently
        }
    };

    /**
     * Retrieves and decrypts a value from localStorage.
     * @param {string} key - The localStorage key.
     * @returns {Promise<string | null>} The decrypted value, or null if not found or decryption fails.
     */
    const getItem = async (key: string): Promise<string | null> => {
        const storage = getLocalStorage();
        if (!storage) {
            return null;
        }
        const raw = storage.getItem(key);
        if (!raw) {
            return null;
        }

        try {
            const encrypted: EncryptedData = JSON.parse(raw);
            // Basic validation already moved into decrypt
            const decryptedValue = await decrypt(encrypted);

            if (decryptedValue === null) {
                // Decryption failed, clear the potentially corrupt data
                console.error(`Decrypting "${key}" failed, clearing item.`);
                storage.removeItem(key);
            }
            return decryptedValue;

        } catch (err) {
            // JSON parsing failed
            console.error(`Parsing stored data for "${key}" failed:`, err);
            storage.removeItem(key); // Clear corrupt data
            return null;
        }
    };

     /**
      * Removes an item from localStorage.
      * @param {string} key - The localStorage key.
      */
     const removeItem = (key: string): void => {
         const storage = getLocalStorage();
         if (!storage) {
             return;
         }
         storage.removeItem(key);
     };


    /**
     * Sets the access token.
     * @param {string} token - The access token string.
     * @returns {Promise<void>}
     */
    const setAccessToken = async (token: string): Promise<void> => {
        // Ensure token is a string before storing
        if (typeof token !== 'string') {
             console.error("Access token must be a string.");
             return;
        }
        return setItem(ACCESS_TOKEN_KEY, token);
    };

    /**
     * Gets the access token.
     * @returns {Promise<string | null>} The access token string, or null.
     */
    const getAccessToken = async (): Promise<string | null> => {
        return getItem(ACCESS_TOKEN_KEY);
    };

    /**
     * Sets the refresh token.
     * @param {string} token - The refresh token string.
     * @returns {Promise<void>}
     */
    const setRefreshToken = async (token: string): Promise<void> => {
         // Ensure token is a string before storing
        if (typeof token !== 'string') {
             console.error("Refresh token must be a string.");
             return;
        }
        return setItem(REFRESH_TOKEN_KEY, token);
    };

    /**
     * Gets the refresh token.
     * @returns {Promise<string | null>} The refresh token string, or null.
     */
    const getRefreshToken = async (): Promise<string | null> => {
        return getItem(REFRESH_TOKEN_KEY);
    };

    /**
     * Sets the token expiry timestamp.
     * @param {number} expiryTime - The timestamp (milliseconds since epoch) when the token expires.
     * @returns {Promise<void>}
     */
    const setTokenExpiry = async (expiryTime: number): Promise<void> => {
         // Ensure expiryTime is a number before storing
         if (typeof expiryTime !== 'number' || !Number.isFinite(expiryTime)) {
             console.error("Expiry time must be a valid number.");
             return;
         }
        return setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
    };

    /**
     * Gets the token expiry timestamp.
     * @returns {Promise<number | null>} The expiry timestamp, or null.
     */
    const getTokenExpiry = async (): Promise<number | null> => {
        const expiryStr = await getItem(TOKEN_EXPIRY_KEY);
        if (expiryStr === null) {
            return null;
        }
        const expiry = parseInt(expiryStr, 10);
        // Check if parsing resulted in a valid number
        return !isNaN(expiry) ? expiry : null;
    };

    /**
     * Checks if the token is expired, considering a buffer time.
     * @returns {Promise<boolean>} True if expired or no expiry set, false otherwise.
     */
    const isTokenExpired = async (): Promise<boolean> => {
        const expiry = await getTokenExpiry();
        if (expiry === null) {
            // If no expiry is set, consider it expired or invalid
            return true;
        }

        // Check if current time is past the expiry time minus the buffer
        return Date.now() > (expiry - EXPIRY_BUFFER_MS);
    };

    /**
     * Saves access token, refresh token, and expiry based on TokenInfo.
     * @param {TokenInfo} tokenInfo - The token information object.
     * @returns {Promise<void>}
     */
    const saveTokens = async (tokenInfo: TokenInfo): Promise<void> => {
        try {
             // Note: The original code used sanitizeObject(tokenInfo) here.
             // Ensure sanitizeObject is imported if needed and handles the structure.
             // However, typically sanitizeObject is for cleaning *received* data.
             // We are storing data received from the server *after* it's likely sanitized.
             // If tokenInfo *itself* needs sanitization before storing, keep the line.
             // Otherwise, remove it for simplicity. Assuming it's for *display* data.
             // const sanitized = sanitizeObject(tokenInfo);

            await setAccessToken(tokenInfo.token);

            // Use explicit check for undefined to allow clearing with null
            if (tokenInfo.refreshToken !== undefined) {
                // Assuming refreshToken can be null or undefined to indicate "no refresh token"
                if (tokenInfo.refreshToken !== null) {
                     await setRefreshToken(tokenInfo.refreshToken);
                } else {
                     removeItem(REFRESH_TOKEN_KEY);
                }
            } else {
                // If refreshToken is not provided in the input object, clear the existing one
                removeItem(REFRESH_TOKEN_KEY);
            }

            if (tokenInfo.expiresIn !== undefined) {
                 // Ensure expiresIn is a valid number
                if (typeof tokenInfo.expiresIn === 'number' && Number.isFinite(tokenInfo.expiresIn)) {
                     // Calculate expiry timestamp in milliseconds
                    const expiryTime = Date.now() + (tokenInfo.expiresIn * 1000);
                    await setTokenExpiry(expiryTime);
                } else {
                     console.error("Invalid expiresIn value provided:", tokenInfo.expiresIn);
                     // Clear expiry if invalid value is provided
                     removeItem(TOKEN_EXPIRY_KEY);
                }
            } else {
                // If expiresIn is not provided, clear the existing expiry
                removeItem(TOKEN_EXPIRY_KEY);
            }

        } catch (err) {
            console.error('Failed to save tokens:', err);
            throw err; // Re-throw to allow caller to handle
        }
    };

    /**
     * Clears all stored tokens and expiry from localStorage.
     */
    const clearTokens = (): void => {
        removeItem(ACCESS_TOKEN_KEY);
        removeItem(REFRESH_TOKEN_KEY);
        removeItem(TOKEN_EXPIRY_KEY);

        // Clear the in-memory key as well
        cryptoKey = null;
    };

    /**
     * Retrieves all stored token information.
     * @returns {Promise<{ accessToken: string | null; refreshToken: string | null; expiry: number | null; }>}
     */
    const getAllTokens = async (): Promise<{
        accessToken: string | null;
        refreshToken: string | null;
        expiry: number | null;
    }> => {
        // Use Promise.all to concurrently fetch all items
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

    // Return the public API of the storage utility
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
        clear: clearTokens // Alias clearTokens to clear
    };
};


// Export a singleton instance of the storage utility
export const secureTokenStorage = createSecureTokenStorage();