import { data } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { logger } from "../../shared/utils/logger";
import { useTokenData } from "./index";
import type { AuthStatus } from "./types";

/**
 * Main authentication status hook
 * Integrates with the comprehensive useAuthentication hook via context
 * Provides computed authentication state for components
 */
export const useAuthStatus = (): AuthStatus => {
  const { isAuthenticated: contextAuth, isLoading: authLoading, enabled } = useAuth();
  const { data: tokenData, isLoading: tokenLoading } = useTokenData();

  logger.debug("Auth status:", { contextAuth, tokenData, authLoading, tokenLoading });

  // Compute authentication state
  const tokenAuth = tokenData?.hasAccessToken ?? false;
  const tokenValid = tokenData?.hasValidToken ?? false;
  const isLoading = authLoading || tokenLoading;
  const isReady = !isLoading;
  const isLoggedIn = tokenAuth || contextAuth || tokenValid;
  
  return { 
    isReady, 
    isLoggedIn, 
    tokenValid,
    tokenData,
    isLoading, 
    enabled
  };
};