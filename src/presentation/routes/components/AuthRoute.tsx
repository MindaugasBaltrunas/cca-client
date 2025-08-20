import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Preloader from "../../components/Preloader/preloader";
import { useAuthState } from "../../../core/auth/hooks/useAuthState";
import { getAuthRedirect } from "../utils/getAuthRedirect";
import { RouteGuard } from "./RouteGuard";
import { ALLOWED_ROUTES } from "../constants/constants";
import { AuthRouteProps } from "../../../core/auth/types/auth.context.types";
import { AuthState } from "../../../shared/types/auth.base.types";
import { logger } from "../../../shared/utils/logger";

export const AuthRoute: React.FC<AuthRouteProps> = ({
  fallbackPath = ALLOWED_ROUTES.LOGIN,
  allowedRoutes,
}) => {
  const location = useLocation();
  const { isAuthenticated, tokenLoading, authState, has2FAEnabled } =
    useAuthState();

  if (tokenLoading) {
    return <Preloader isLoading />;
  }

  const mappedAuthState: AuthState = (() => {
    if (authState === "BASIC_AUTH") {
      return !has2FAEnabled ? "NEEDS_SETUP" : "BASIC_AUTH";
    }

    if (authState === "PENDING_VERIFICATION" && has2FAEnabled) {
      return "PENDING_VERIFICATION";
    }

    if (authState === "FULL_AUTH") {
      return "FULL_AUTH";
    }

    if (authState === "NEEDS_SETUP") {
      return "NEEDS_SETUP";
    }

    return "NO_AUTH";
  })();

  const redirect = getAuthRedirect(
    mappedAuthState,
    location.pathname,
    location,
    has2FAEnabled,
    isAuthenticated
  );

  // logger.debug(
  //   "mappedAuthState",
  //   mappedAuthState,
  //   "location.pathname",
  //   location.pathname,
  //   "location",
  //   location,
  //   "has2FAEnabled",
  //   has2FAEnabled,
  //   "isAuthenticated",
  //   isAuthenticated
  // );

  if (redirect) {
    return redirect;
  }

  return (
    <RouteGuard allowedRoutes={allowedRoutes} fallbackPath={fallbackPath}>
      <Outlet />
    </RouteGuard>
  );
};
