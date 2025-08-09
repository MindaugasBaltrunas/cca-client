import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Preloader from "../../components/Preloader/preloader";
import { useAuthState } from "../../../core/auth/hooks/useAuthState";
import { getAuthRedirect } from "../utils/getAuthRedirect";
import { RouteGuard } from "./RouteGuard";
import { AuthRouteProps, AuthState } from "../../../core/auth/types/auth.types";
import { ALLOWED_ROUTES } from "../constants/constants";
import { logger } from "../../../shared/utils/logger";

export const AuthRoute: React.FC<AuthRouteProps> = ({
  fallbackPath = ALLOWED_ROUTES.LOGIN,
  // requireFullAuth = false,
  // require2FA = false,
  // allowPublic = false,
  // redirectIfAuthenticated,
  allowedRoutes,
}) => {
  const location = useLocation();
  const { isAuthenticated, tokenLoading, authState, has2FAEnabled } =
    useAuthState();

  if (tokenLoading) {
    return <Preloader isLoading />;
  }
  logger.debug("authState", authState);
  // Map authState to our AuthState type
  const mappedAuthState: AuthState = !has2FAEnabled
    ? "NEEDS_SETUP"
    : authState === "PENDING_VERIFICATION"
    ? "PENDING_VERIFICATION"
    : authState === "FULL_AUTH"
    ? "FULL_AUTH"
    : "NO_AUTH";

  logger.debug("mappedAuthState", mappedAuthState);

  const redirect = getAuthRedirect(
    mappedAuthState,
    location.pathname,
    location,
    has2FAEnabled,
    isAuthenticated
  );
  logger.debug(
    "redirect",
    mappedAuthState,
    location.pathname,
    location,
    has2FAEnabled,
    isAuthenticated
  );
  logger.debug("redirect", redirect);

  if (redirect) {
    return redirect;
  }

  return (
    <RouteGuard allowedRoutes={allowedRoutes} fallbackPath={fallbackPath}>
      <Outlet />
    </RouteGuard>
  );
};
