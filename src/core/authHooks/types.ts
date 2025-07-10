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
  tokenData?: TokenData;
  isLoading: boolean;
  enabled?: boolean;
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
  getCurrentUserId: () => string | null;
  enterTwoFactorFlow: (userId: string, token: string) => void;
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