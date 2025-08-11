import React from "react";
import { Navigate, type Location } from "react-router-dom";
import { isAllowedRoute, getRouteCategory } from "./routeValidator";
import { ALLOWED_ROUTES } from "../constants/constants";
import { AuthState } from "../../../shared/types/auth.base.types";

const normalize = (path: string): string => path.replace(/\/+$/, "") || "/";

export const getAuthRedirect = (
  authState: AuthState,
  currentPath: string,
  from?: Location,
  has2FAEnabled?: boolean,
  isAuthenticated?: boolean
): React.ReactElement | null => {
  const navigationProps = from ? { state: { from } } : {};
  const current = normalize(currentPath);

  // Block unauthorized routes
  if (!isAllowedRoute(current)) {
    return <Navigate to={ALLOWED_ROUTES.DASHBOARD} replace />;
  }

  const routeCategory = getRouteCategory(current);

  // NO_AUTH: Only allow public routes (login/signup)
  if (authState === "NO_AUTH") {
    if (routeCategory !== "PUBLIC") {
      return (
        <Navigate to={ALLOWED_ROUTES.LOGIN} {...navigationProps} replace />
      );
    }
    return null;
  }

  // NEEDS_SETUP: User logged in but needs 2FA setup
  if (authState === "NEEDS_SETUP") {
    const target = normalize(ALLOWED_ROUTES.TWO_FA_SETUP);
    if (current !== target) {
      return (
        <Navigate
          to={ALLOWED_ROUTES.TWO_FA_SETUP}
          {...navigationProps}
          replace
        />
      );
    }
    return null;
  }

  // BASIC_AUTH: User is authenticated but may not have full privileges
  if (authState === "BASIC_AUTH") {
    // If they're on public routes (like login), redirect to dashboard
    if (routeCategory === "PUBLIC") {
      return <Navigate to={ALLOWED_ROUTES.DASHBOARD} replace />;
    }
    // Allow access to protected routes since they have basic auth
    return null;
  }

  // PENDING_VERIFICATION: User needs to verify 2FA
  if (authState === "PENDING_VERIFICATION") {
    const target = normalize(ALLOWED_ROUTES.VERIFY_2FA);
    if (current !== target) {
      return (
        <Navigate to={ALLOWED_ROUTES.VERIFY_2FA} {...navigationProps} replace />
      );
    }
    return null;
  }

  // FULL_AUTH: Allow protected routes, redirect away from auth/2FA pages
  if (authState === "FULL_AUTH" && isAuthenticated) {
    if (routeCategory === "PUBLIC" || routeCategory === "TWO_FA") {
      return <Navigate to={ALLOWED_ROUTES.DASHBOARD} replace />;
    }
    return null;
  }

  return null;
};