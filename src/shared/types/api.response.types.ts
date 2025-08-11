import { AuthUser, AuthStatus, AuthStatusValue } from "./auth.base.types";

export interface ApiErrorResponse {
  status: 'error';
  message: string;
  code?: string;
  details?: any;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    accessToken?: string;
    refreshToken?: string;
    userId?: string;
    expiresAt?: string;
    auth?: AuthStatus;
  } & Partial<AuthUser>;
  meta: {
    timestamp?: string;
    status?: string;
    nextStep?: string;
    redirectTo?: string;
  };
}

export interface TokenInfo {
  token: string;
  refreshToken?: string;
  id: string;
  expiresAt?: number;
}

export interface AuthCacheData {
  accessToken: string | null;
  userId: string | null;
  refreshToken?: string;
  enabled: boolean;
  hasAccessToken: boolean;
  hasUserId: boolean;
  hasValidToken: boolean;
  verified?: boolean;
  status?: AuthStatusValue;
}

export interface RouteAuthStatus {
  isReady: boolean;
  isLoggedIn: boolean;
  hasUserId: boolean;
  enabled?: boolean;
  token?: string;
}


export interface TwoFactorSetupData {
  disabledAt?: string;
  token?: string;
  refreshToken?: string;
  qrCode?: string;
  enabled: boolean; 
  user?: AuthUser;
  auth: AuthStatus;
}

export interface TwoFactorMeta {
  timestamp?: string;
  nextStep?: string;
  redirectTo?: string;
  securityNote?: string;
  recommendation?: string;
}

export interface TwoFactorSetupResponse {
  success: boolean;
  message: string;
  data: TwoFactorSetupData;
  meta: TwoFactorMeta;
}

export interface VerifyTwoFactorParams {
  userId: string;
  token: string;
}