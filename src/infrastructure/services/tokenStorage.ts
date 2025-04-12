interface TokenInfo {
  token: string;
  refreshToken: string;
  expiresAt: number;
}

/**
 * Servisas, atsakingas už token valdymą
 */
export const tokenStorage = {
  /**
   * Išsaugoti tokenus į localStorage
   */
  saveTokens: (tokenInfo: TokenInfo): void => {
    localStorage.setItem('token', tokenInfo.token);
    localStorage.setItem('refreshToken', tokenInfo.refreshToken);
    localStorage.setItem('expiresAt', tokenInfo.expiresAt.toString());
  },

  /**
   * Gauti token iš localStorage
   */
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  /**
   * Gauti refresh token iš localStorage
   */
  getRefreshToken: (): string | null => {
    return localStorage.getItem('refreshToken');
  },

  /**
   * Gauti token galiojimo pabaigos laiką
   */
  getExpiresAt: (): number | null => {
    const expiresAt = localStorage.getItem('expiresAt');
    return expiresAt ? parseInt(expiresAt, 10) : null;
  },

  /**
   * Patikrinti, ar token jau nebegalioja
   */
  isTokenExpired: (): boolean => {
    const expiresAt = tokenStorage.getExpiresAt();
    if (!expiresAt) return true;
    return Date.now() >= expiresAt;
  },

  /**
   * Patikrinti, ar token greitai baigs galioti (per 5 minutes)
   */
  isTokenExpiringNear: (): boolean => {
    const expiresAt = tokenStorage.getExpiresAt();
    if (!expiresAt) return true;
    
    const fiveMinutesInMs = 5 * 60 * 1000;
    return Date.now() >= (expiresAt - fiveMinutesInMs);
  },

  /**
   * Išvalyti visus token duomenis iš localStorage
   */
  clearToken: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('expiresAt');
  }
};