// api.types.ts - API tipų apibrėžimai

export interface SignInCredentials {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  [key: string]: any;
}

export interface LoginState {
  userId: string;
  credentials: SignInCredentials;
}

export interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isAdmin?: boolean;
  hasTwoFactorEnabled?: boolean;
  [key: string]: any;
}

export interface AuthResponse {
  status: 'success' | 'error' | 'pending';
  message?: string;
  data?: {
    accessToken?: string;
    refreshToken?: string;
    userId?: string;
    expiresAt?: number;
    [key: string]: any;
  };
}

export interface IVerify2FAResponse {
  token: string;
  data: {
    id: string;
    [key: string]: any;
  };
}

export interface TwoFactorSetupResponse {
  qrCode: string;
  secret: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface TokenInfo {
  token: string;
  id: string;
  refreshToken?: string;
  expiresAt?: number;
}