export interface AuthResponse {
  status: 'success' | 'error' | 'pending';
  message?: string;
  data?: {
    status: string;
    accessToken?: string;
    refreshToken?: string;
    userId?: string;
    expiresAt?: number;
    enabled: boolean;
  };
}

export interface BaseCredentials {
  email: string;
  password: string;
}

export interface LoginState extends BaseCredentials {}

export interface SignUpData extends BaseCredentials {
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
}

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  adminPassword?: string; 
}

export interface IVerify2FAResponse {
  userId?: string | undefined;
  token: string;
  refreshToken: string;
  status: string;
  data?: User; 
  enabled?: boolean;
}

export interface TwoFactorSetupResponse {
  data: any;
  qrCode: string;
  qrCodeUrl: string;
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