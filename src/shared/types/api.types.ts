
export interface SignUpData {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginState {
  email: string;
  password: string;
}

export interface AuthResponse {
  status: 'success' | 'error' | 'pending';
  message?: string;
  data?: {
    accessToken?: string;
    refreshToken?: string;
    userId?: string;
    expiresAt?: number;
  };
}

interface BaseUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  adminPassword: string;
}
export interface Admin extends BaseUser {}

export interface User extends BaseUser {}

export type UserRole = 'admin' | 'user';

export interface IVerify2FAResponse {
  userId?: string | undefined;
  token: string;
  refreshToken: string;
  status: string;
  data?: Admin | User;
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
