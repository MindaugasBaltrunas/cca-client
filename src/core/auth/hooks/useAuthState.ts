import { useState, useMemo } from "react";
import { useTokenData } from "./index";
import { mapAuthState } from "./utils/mapAuthState";
import { AuthStateHook } from "../types/auth.context.types";
import { AuthUser } from "../../../shared/types/auth.base.types";

export const useAuthState = (): AuthStateHook => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const { data: tokenData, isLoading: tokenLoading, error } = useTokenData();

  const computedValues = useMemo(() => {
    // Handle cases where tokenData might be null/undefined
    if (!tokenData) {
      return {
        hasToken: false,
        has2FAEnabled: false,
        isAuthenticated: false,
        authState: "NO_AUTH" as const,
      };
    }

    const hasToken = Boolean(tokenData.hasAccessToken);
    const has2FAEnabled = Boolean(tokenData.enabled);
    
    // ✅ IMPORTANT: isAuthenticated should be based on authState, not just tokenData.verified
    const mappedAuthState = mapAuthState(tokenData.status);
    const isAuthenticated = mappedAuthState !== "NO_AUTH"; // User has some level of auth
    
    return {
      hasToken,
      has2FAEnabled,
      isAuthenticated,
      authState: mappedAuthState,
    };
  }, [tokenData]);

  return {
    currentUser,
    setCurrentUser,
    tokenData,
    tokenLoading,
    error,
    ...computedValues,
  };
};