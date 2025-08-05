export type LoginData = {
  username: string;
  password: string;
};

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

export interface AuthStatus {
  hasAccessToken: boolean;
  enable: boolean;
  verified?: boolean;
  status: string;
}

export interface TwoFactorSetupData {
  disabledAt?: string;
  token?: string;
  refreshToken?: string;
  qrcode?: string;
  enable: boolean;
  user?: User;
  auth: AuthStatus;
}

export interface TwoFactorMeta {
  timestamp: string;
  nextStep: string;
  redirectTo: string;
}

export interface TwoFactorSetupResponse {
  success: boolean;
  message: string;
  data: TwoFactorSetupData;
  meta: TwoFactorMeta;
}

export interface ApiErrorResponse {
  status: 'error';
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

export interface AuthUser extends User {
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  userId: string;
  enable: boolean;
}

export interface AuthCacheData {
  accessToken: string | null;
  userId: string | null;
  refreshToken?: string;
  enable: boolean;
  hasAccessToken: boolean;
  hasUserId: boolean;
  hasValidToken: boolean;
}

export interface AuthSuccessParams {
  token: string;
  userId: string;
  refreshToken?: string;
  twoFactorEnabled: boolean;
  userData?: AuthUser;
}

export interface AuthResponse {
  message: string;
  success: boolean;
  data?: {
    accessToken?: string;
    userId?: string;
    refreshToken?: string;
    enabled?: boolean;
    expiresAt: string;
  } & Partial<AuthUser>;
  meta: {
    timestamp: string;
    status: string;
  }
}

export interface AuthMutationHandlers {
  handleAuthSuccess: (params: AuthSuccessParams) => void;
  startTwoFactorFlow: (userId: string) => void;
  setNeedsSetup: (needsSetup: boolean) => void;
  resetAuthState: () => void;
}

export interface VerifyTwoFactorParams {
  userId: string;
  token: string;
}
