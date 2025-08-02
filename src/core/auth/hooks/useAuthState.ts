import { useState, useMemo, useEffect } from "react";
import { useTokenData, AuthUser } from "./index";

type AuthState =
  | "NO_AUTH"
  | "BASIC_AUTH"
  | "NEEDS_SETUP"
  | "PENDING_VERIFICATION"
  | "FULL_AUTH";

export const useAuthState = () => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const { data: tokenData, isLoading: tokenLoading } = useTokenData();

  // ✅ Derived flags from token data
  const hasToken = !!tokenData?.hasAccessToken;
  const has2FAEnabled = tokenData?.enable === true;
  const is2FAVerified = tokenData?.verified === true;
  const authStatus = tokenData?.status; // Backend-provided status

  // ✅ Determine authentication state
  const authState: AuthState = useMemo(() => {
    if (!hasToken) return "NO_AUTH";

    // Prioritize backend-provided status if available and valid
    if (authStatus) {
      switch (authStatus) {
        case "basic_auth":
          return "BASIC_AUTH";
        case "needs_setup":
          return "NEEDS_SETUP";
        case "pending_verification":
          return "PENDING_VERIFICATION";
        case "full_auth":
          return "FULL_AUTH";
        default:
          // Fallback if authStatus is present but unrecognized
          break;
      }
    }

    // Fallback logic if backend status is missing or unrecognized
    if (!has2FAEnabled) return "BASIC_AUTH";
    if (has2FAEnabled && !is2FAVerified) return "PENDING_VERIFICATION";
    if (has2FAEnabled && is2FAVerified) return "FULL_AUTH";

    return "NO_AUTH"; // Should ideally not be reached if hasToken is true
  }, [hasToken, has2FAEnabled, is2FAVerified, authStatus]);

  // ✅ Boolean shortcut for basic auth check
  const isAuthenticated = useMemo(() => authState !== "NO_AUTH", [authState]);

  // ✅ Reset user state if logged out
  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentUser(null);
    }
  }, [isAuthenticated]);

  return {
    currentUser,
    setCurrentUser,
    tokenData,
    tokenLoading,
    isAuthenticated,
    authState,
  };
};