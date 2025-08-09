import { useState } from "react";
import { useTokenData } from "./index";
import type { AuthUser, AuthState } from "../types/auth.types";
import { logger } from "../../../shared/utils/logger";
import { mapAuthState } from "./utils/mapAuthState";

export interface AuthStateHook {
  currentUser: AuthUser | null;
  setCurrentUser: (user: AuthUser | null) => void;
  tokenData: any;
  tokenLoading: boolean;
  hasToken: boolean;
  has2FAEnabled: boolean;
  isAuthenticated: boolean;
  authState: AuthState;
}

export const useAuthState = (): AuthStateHook => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const { data: tokenData, isLoading: tokenLoading } = useTokenData();

  const authState = mapAuthState(tokenData?.status);

  logger.debug("tokenData", {
    currentUser,
    tokenData,
    tokenLoading,
    hasToken: Boolean(tokenData?.hasAccessToken),
    has2FAEnabled: Boolean(tokenData?.enabled),
    isAuthenticated: Boolean(tokenData?.verified),
    authState,
  });

  return {
    currentUser,
    setCurrentUser,
    tokenData,
    tokenLoading,
    hasToken: Boolean(tokenData?.hasAccessToken),
    has2FAEnabled: Boolean(tokenData?.enabled),
    isAuthenticated: Boolean(tokenData?.verified),
    authState,
  };
};

