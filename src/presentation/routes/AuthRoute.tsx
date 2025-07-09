import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import Preloader from "../components/Preloader/preloader";
import { useRouteAuth } from "../../core/authHooks/useRouteAuth";
import { logger } from "../../shared/utils/logger";

export interface AuthRouteProps {
  fallbackPath?: string;
  requireFullAuth?: boolean;
  require2FA?: boolean;
  allowPublic?: boolean;
  redirectIfAuthenticated?: string;
}

/**
 * Universalus route guard'as - pagrindinis komponentas
 */
export const AuthRoute: React.FC<AuthRouteProps> = ({
  fallbackPath = "/login",
  requireFullAuth = true,
  require2FA = false,
  allowPublic = false,
  redirectIfAuthenticated,
}) => {
  const {
    isReady,
    isLoggedIn,
    hasUserId,
    enabled,
    canAccess2FA,
    shouldRedirectTo2FA,
  } = useRouteAuth();
  const location = useLocation();

  if (!isReady) {
    return <Preloader isLoading />;
  }

  // Public routes logika
  if (allowPublic) {
    if (isLoggedIn && redirectIfAuthenticated) {
      logger.debug("Redirecting authenticated user", { to: redirectIfAuthenticated });
      return <Navigate to={redirectIfAuthenticated} replace />;
    }
    return <Outlet />;
  }

  // 2FA routes logika
  if (require2FA) {
    if (!hasUserId) {
      logger.debug("No userId available, redirecting to login");
      return <Navigate to="/login" replace />;
    }

    const targetPath = enabled ? "/verify-2fa" : "/2fa-setup";
    if (location.pathname !== targetPath) {
      return <Navigate to={targetPath} replace />;
    }
    return <Outlet />;
  }

  // Protected routes logika
  if (requireFullAuth && !isLoggedIn) {
    if (shouldRedirectTo2FA) {
      logger.debug("Redirecting to 2FA setup");
      return <Navigate to="/2fa-setup" state={{ from: location }} replace />;
    }
    logger.debug("Authentication required, redirecting", { to: fallbackPath });
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  return <Outlet />;
};