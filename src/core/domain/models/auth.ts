export interface TokenPair {
  token: string;
  refreshToken: string;
  expiresAt: number;
}

export interface TwoFactorSetup {
  secretKey: string;
  qrCodeUrl: string;
}

