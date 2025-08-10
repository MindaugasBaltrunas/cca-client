import { useState } from "react";
import { useTokenData } from "./index";
import type { AuthUser, AuthStateHook } from "../types/auth.types";
import { mapAuthState } from "./utils/mapAuthState";
import { logger } from "../../../shared/utils/logger";

export const useAuthState = (): AuthStateHook => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const { data: tokenData, isLoading: tokenLoading } = useTokenData();
  
  logger.debug("tokenData", tokenData)
  const authState = mapAuthState(tokenData?.status);

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

