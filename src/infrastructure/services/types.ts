export interface AuthResponseData {
  accessToken: string;
  refreshToken?: string;
  userId: string;
  expiresAt?: number; // timestamp arba duration
}

export interface AuthResponse {
  status: 'success' | 'error' | 'pending';
  data?: AuthResponseData;
  message?: string;
}

export interface IVerify2FAResponse extends AuthResponse {
  data?: AuthResponseData;
}

export interface TwoFactorSetupResponse {
  status: string;
  qrCode?: string;
  secret?: string;
  backupCodes?: string[];
}

export interface LoginState {
  email: string;
  password: string;
}

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface TokenInfo {
  id?: string;
  token: string;
  refreshToken?: string | null | undefined;
  expiresIn?: number | undefined;
}