import { logger } from "../../shared/utils/logger";
import { useAuthStatus } from "./index";
import type { RouteAuthStatus } from "./types";

export const useRouteAuth = (): RouteAuthStatus => {
  const { isReady, isLoggedIn, tokenData, enabled } = useAuthStatus();
  logger.debug("Route auth hook:", tokenData?.hasUserId);
  // logger.debug("Route auth status:", {
  //   isReady,
  //   isLoggedIn,
  //   hasUserId: tokenData?.hasUserId,
  //   canAccess2FA: !isLoggedIn && tokenData?.hasUserId,
  //   shouldRedirectTo2FA: !!(tokenData?.hasAccessToken && !tokenData?.hasUserId),
  //   enabled
  // });

  return {
    isReady,
    isLoggedIn,
    hasUserId: tokenData?.hasUserId ?? false,
    canAccess2FA: !isLoggedIn && (tokenData?.hasUserId ?? false),
    shouldRedirectTo2FA: !!(tokenData?.hasAccessToken && !tokenData?.hasUserId),
    enabled
  };
};
