import { useState } from "react";
import { useTokenData } from "./index";
import { mapAuthState } from "./utils/mapAuthState";
import { AuthStateHook } from "../types/auth.context.types";
import { AuthUser } from "../../../shared/types/auth.base.types";

export const useAuthState = (): AuthStateHook => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const { data: tokenData, isLoading: tokenLoading } = useTokenData();

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

