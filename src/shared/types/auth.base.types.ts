export type UserRole = 'admin' | 'user';

export type AuthStatusValue =
  | 'BASIC_AUTH'
  | 'NEEDS_SETUP'
  | 'PENDING_VERIFICATION'
  | 'FULL_AUTH'
  | 'REGISTERED'
  | 'LOGGED_OUT'
  | 'NO_AUTH';

export type AuthState = "NO_AUTH" | "NEEDS_SETUP" | "PENDING_VERIFICATION" | "FULL_AUTH" | "BASIC_AUTH";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface BaseCredentials {
  email: string;
  password: string;
}

export interface LoginData extends BaseCredentials { }

export interface SignUpData extends BaseCredentials {
  confirmPassword?: string;
  name?: string;
  role?: UserRole;
  adminPassword?: string;
}

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
  enabled: boolean;
  status?: AuthStatusValue;
  verified?: boolean;
}

export interface AuthSuccessPayload {
  token: string;
  userId: string;
  refreshToken?: string;
  enabled: boolean;
  verified?: boolean;
  status?: AuthStatusValue;
  userData?: AuthUser;
}