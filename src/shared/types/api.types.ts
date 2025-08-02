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

export interface LoginState extends BaseCredentials { }

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
}



export interface TwoFactorSetupResponse {
  success: boolean;
  message: string;
  data: {
    disabledAt?:string,
    token?: string,
    refreshToken?: string,
    qrcode?: string;
    enable: boolean;
    user?: User;
    auth: {
      hasAccessToken: boolean;
      enable: boolean;
      verified?: boolean;
      status: string;
    }
  };
  meta: {
    timestamp: string;
    nextStep: string;
    redirectTo: string;
  }
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