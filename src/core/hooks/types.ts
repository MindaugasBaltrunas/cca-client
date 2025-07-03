export interface TokenData {
  accessToken: string | null;
  userId: string | null;
  hasValidToken: boolean;
  hasAccessToken: boolean;
  hasUserId: boolean;
}

export interface AuthStatus {
  isReady: boolean;
  isLoggedIn: boolean;
  tokenValid: boolean;
  tokenData?: TokenData;
  isLoading: boolean;
  status: string;
}

export interface RouteAuthStatus {
  status: string;
  isReady: boolean;
  isLoggedIn: boolean;
  hasUserId: boolean;
  canAccess2FA: boolean;
  shouldRedirectTo2FA: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  [key: string]: any;
}

export interface AuthenticationState {
  user: AuthUser | null;
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
  getCurrentUserId: () => string | null;
  enterTwoFactorFlow: (userId: string) => void;
  clearAuthState: () => void;
}

export interface AuthContextType extends AuthenticationState, AuthenticationActions {
  tokenData?: TokenData;
  loginError: any;
  registerError: any;
  verify2FAError: any;
  setup2FAError: any;
  enable2FAError: any;
}

export type AuthTokenData = {
  hasAccessToken?: boolean;
};