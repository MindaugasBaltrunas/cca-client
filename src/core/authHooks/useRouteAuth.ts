import { useAuthStatus } from "./index";
import type { RouteAuthStatus } from "./types";

/**
 * Specialized hook for route protection logic
 * Provides computed states specific to routing decisions
 */
export const useRouteAuth = (): RouteAuthStatus => {
  const { isReady, isLoggedIn, tokenData, enabled } = useAuthStatus();
  
  
  return {
    isReady,
    isLoggedIn,
    hasUserId: tokenData?.hasUserId ?? false,
    canAccess2FA: !isLoggedIn && (tokenData?.hasUserId ?? false),
    shouldRedirectTo2FA: !!(tokenData?.hasAccessToken && !tokenData?.hasUserId),
    enabled
  };
};