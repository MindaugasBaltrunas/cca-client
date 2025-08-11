import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Preloader from "../../components/Preloader/preloader";
import { useAuthState } from "../../../core/auth/hooks/useAuthState";
import { getAuthRedirect } from "../utils/getAuthRedirect";
import { RouteGuard } from "./RouteGuard";
import { ALLOWED_ROUTES } from "../constants/constants";
import { logger } from "../../../shared/utils/logger";
import { AuthRouteProps } from "../../../core/auth/types/auth.context.types";
import { AuthState } from "../../../shared/types/auth.base.types";

export const AuthRoute: React.FC<AuthRouteProps> = ({
  fallbackPath = ALLOWED_ROUTES.LOGIN,
  allowedRoutes,
}) => {
  const location = useLocation();
  const { isAuthenticated, tokenLoading, authState, has2FAEnabled } =
    useAuthState();

  logger.debug(
    "AuthRoute",
    isAuthenticated,
    tokenLoading,
    authState,
    has2FAEnabled
  );

  if (tokenLoading) {
    return <Preloader isLoading />;
  }

  // Fixed logic: Handle BASIC_AUTH properly
  const mappedAuthState: AuthState = (() => {
    // If user has BASIC_AUTH, they're logged in but may need 2FA setup
    if (authState === "BASIC_AUTH") {
      return !has2FAEnabled ? "NEEDS_SETUP" : "BASIC_AUTH";
    }
    
    // Handle other states
    if (authState === "PENDING_VERIFICATION" && has2FAEnabled) {
      return "PENDING_VERIFICATION";
    }
    
    if (authState === "FULL_AUTH") {
      return "FULL_AUTH";
    }
    
    // Handle NEEDS_SETUP case
    if (authState === "NEEDS_SETUP") {
      return "NEEDS_SETUP";
    }
    
    // Default to NO_AUTH
    return "NO_AUTH";
  })();

  logger.debug("mappedAuthState", mappedAuthState);

  const redirect = getAuthRedirect(
    mappedAuthState,
    location.pathname,
    location,
    has2FAEnabled,
    isAuthenticated
  );

  if (redirect) {
    return redirect;
  }

  return (
    <RouteGuard allowedRoutes={allowedRoutes} fallbackPath={fallbackPath}>
      <Outlet />
    </RouteGuard>
  );
};