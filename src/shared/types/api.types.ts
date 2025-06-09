
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

export interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isAdmin?: boolean;
  hasTwoFactorEnabled?: boolean;
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

export interface IVerify2FAResponse {
  token: string;
  status: string;
  data: {
    id: string;
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