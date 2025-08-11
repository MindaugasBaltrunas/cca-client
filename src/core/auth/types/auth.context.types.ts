import { ROUTE_CATEGORIES } from "../../../presentation/routes/constants/constants";
import { AuthStatusValue, AuthSuccessPayload, AuthUser, BaseCredentials, SignUpData } from "../../../shared/types/auth.base.types";

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
  status: AuthStatusValue;
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
  signIn: (credentials: BaseCredentials) => Promise<any>;
  signUp: (userData: SignUpData) => Promise<any>;
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

export interface AuthMutationHandlers {
  handleAuthSuccess: (params: AuthSuccessPayload) => Promise<void>;
  startTwoFactorFlow: (userId: string) => void;
  setNeedsSetup: (needsSetup: boolean) => void;
  resetAuthState: () => void;
}



