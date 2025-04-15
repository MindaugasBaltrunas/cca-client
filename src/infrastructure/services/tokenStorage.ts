interface TokenInfo {
  token: string;
  id: string;
  refreshToken?: string;
  expiresAt?: number;
}

export const tokenStorage = {
  saveTokens: (tokenInfo: TokenInfo): void => {
    if (
      tokenInfo.token ||
      tokenInfo.id
    ) {
      localStorage.setItem('token', tokenInfo.token);
      localStorage.setItem('id', tokenInfo.id);
    }
    return;
  },

  getToken: (): { token: string | null; id: string | null; } => {
    const token = localStorage.getItem('token');
    const id = localStorage.getItem('id');
    return {token, id};
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