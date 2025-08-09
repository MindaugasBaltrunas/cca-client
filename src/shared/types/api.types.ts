// -----------------------------
// User and Role Models
// -----------------------------

import { AuthSuccessPayload } from "../../core/auth/types/auth.types";

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthUser extends User { }


// -----------------------------
// Credentials / Input Models
// -----------------------------

export interface BaseCredentials {
  email: string;
  password: string;
}

export interface LoginData extends BaseCredentials { }

export interface LoginState extends BaseCredentials { }

export interface SignUpData extends BaseCredentials {
  confirmPassword?: string;
  name?: string;
  role?: UserRole;
  adminPassword?: string;
}


// -----------------------------
// Auth Status / Flow
// -----------------------------

export type AuthStatusValue =
  | 'BASIC_AUTH'
  | 'NEEDS_SETUP'
  | 'PENDING_VERIFICATION'
  | 'FULL_AUTH'
  | 'REGISTERED'
  | 'LOGGED_OUT';

export interface AuthStatus {
  hasAccessToken: boolean;
  enable: boolean;
  verified?: boolean;
  status: AuthStatusValue;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  userId: string;
  enable: boolean;
  status?: AuthStatusValue;
  verified?: boolean;
}

export interface AuthCacheData {
  accessToken: string | null;
  userId: string | null;
  refreshToken?: string;
  enable: boolean;
  hasAccessToken: boolean;
  hasUserId: boolean;
  hasValidToken: boolean;
  verified?: boolean;
  status?: string;
}

// export interface AuthSuccessParams {
//   token: string;
//   userId: string;
//   refreshToken?: string;
//   enabled: boolean;
//   verified?: boolean;
//   status?: AuthStatusValue | undefined;
//   userData?: AuthUser;
// }

export interface AuthMutationHandlers {
  handleAuthSuccess: (params: AuthSuccessPayload) => Promise<void>;
  startTwoFactorFlow: (userId: string) => void;
  setNeedsSetup: (needsSetup: boolean) => void;
  resetAuthState: () => void;
}


// -----------------------------
// API Responses
// -----------------------------

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


// -----------------------------
// Two-Factor Auth (2FA)
// -----------------------------

export interface TwoFactorSetupData {
  disabledAt?: string;
  token?: string;
  refreshToken?: string;
  qrCode?: string;
  enable: boolean;
  user?: User;
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
