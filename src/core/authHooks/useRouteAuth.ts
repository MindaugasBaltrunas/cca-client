import { useAuthStatus } from "./index";
import type { RouteAuthStatus } from "./types";

/**
 * Specialized hook for route protection logic
 * Provides computed states specific to routing decisions
 */
export const useRouteAuth = (): RouteAuthStatus => {
  const { isReady, isLoggedIn, tokenData, status } = useAuthStatus();
  
  
  return {
    status,
    isReady,
    isLoggedIn,
    hasUserId: tokenData?.hasUserId ?? false,
    canAccess2FA: !isLoggedIn && (tokenData?.hasUserId ?? false),
    shouldRedirectTo2FA: !!(tokenData?.hasAccessToken && !tokenData?.hasUserId)
  };
};