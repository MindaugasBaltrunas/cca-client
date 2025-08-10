import { ROUTE_CATEGORIES } from "../../../presentation/routes/constants/constants";
import { AuthStatusValue } from "../../../shared/types/api.types";

export type AuthState = "NO_AUTH" | "NEEDS_SETUP" | "PENDING_VERIFICATION" | "FULL_AUTH" | "BASIC_AUTH";
export type RouteCategory = keyof typeof ROUTE_CATEGORIES;

export interface AuthRouteProps {
  fallbackPath?: string;
  requireFullAuth?: boolean;
  require2FA?: boolean;
  allowPublic?: boolean;
  redirectIfAuthenticated?: string;
  allowedRoutes?: readonly RouteCategory[] | RouteCategory[];
}

export interface AuthContext {
  isAuthenticated: boolean;
  tokenLoading: boolean;
  authState: string;
  has2FAEnabled: boolean;
}

export interface TokenData {
  accessToken: string | null;
  userId: string | null;
  hasUserId: boolean;
  hasValidToken: boolean;
  hasAccessToken: boolean;
  enabled: boolean;
  verified: boolean;
  status: AuthState;
}


export interface AuthStatus {
  isReady: boolean;
  isLoggedIn: boolean;
  tokenData?: TokenData;
  isLoading: boolean;
}

export interface RouteAuthStatus {
  isReady: boolean;
  isLoggedIn: boolean;
  hasUserId: boolean;
  enabled?: boolean;
  token?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthenticationState {
  user: AuthUser | null;
  enabled?: boolean;
  isAuthenticated: boolean;
  isInTwoFactorFlow: boolean;
  requiresTwoFactor: boolean;
  isLoading: boolean;
  error: any;
}

export interface AuthenticationActions {
  signIn: (credentials: any) => Promise<any>;
  signUp: (userData: any) => Promise<any>;
  verifyTwoFactorAuth: (userId: string, token: string) => Promise<any>;
  setupTwoFactorAuth: () => Promise<any>;
  enableTwoFactorAuth: (token: string) => Promise<any>;
  logout: () => void;
  clearErrors: () => void;
  enterTwoFactorFlow: (userId: string, token: string) => void;
  clearAuthState: () => void;
}

export interface AuthContextType extends AuthenticationActions {
  loginError: any;
  registerError: any;
  verify2FAError: any;
  setup2FAError: any;
  enable2FAError: any;
  error: any;
  isLoading: boolean;
}

export interface BaseCredentials {
  email: string;
  password: string;
}

export interface LoginState extends BaseCredentials { }

export interface SignUpData extends BaseCredentials {
  confirmPassword?: string;
  name?: string;
  role?: string;
  adminPassword?: string;
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

export interface AuthStateHook {
  currentUser: AuthUser | null;
  setCurrentUser: (user: AuthUser | null) => void;
  tokenData: any;
  tokenLoading: boolean;
  hasToken: boolean;
  has2FAEnabled: boolean;
  isAuthenticated: boolean;
  authState: string;
}