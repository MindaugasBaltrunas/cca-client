import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import Preloader from "../components/Preloader/preloader";
import { useRouteAuth } from "../../core/hooks/useRouteAuth";
import { logger } from "../../shared/utils/logger";

export interface AuthRouteProps {
  /** Path to redirect when authentication fails */
  fallbackPath?: string;
  /** Require full authentication (token + userId) */
  requireFullAuth?: boolean;
  /** Require 2FA state (userId but no token) */
  require2FA?: boolean;
  /** Allow public access (no authentication required) */
  allowPublic?: boolean;
  /** Redirect authenticated users away */
  redirectIfAuthenticated?: string;
}

/**
 * Advanced route component with flexible authentication requirements
 * Supports various authentication scenarios and custom configurations
 */
export const AuthRoute: React.FC<AuthRouteProps> = ({ 
  fallbackPath = "/login",
  requireFullAuth = true,
  require2FA = false,
  allowPublic = false,
  redirectIfAuthenticated
}) => {
  const { isReady, isLoggedIn, canAccess2FA, shouldRedirectTo2FA } = useRouteAuth();
  const location = useLocation();

  if (!isReady) {
    return <Preloader isLoading={true} />;
  }

  // Handle public routes
  if (allowPublic) {
    // If authenticated user should be redirected away (e.g., login page)
    if (isLoggedIn && redirectIfAuthenticated) {
      return <Navigate to={redirectIfAuthenticated} replace />;
    }
    return <Outlet />;
  }

  // Handle 2FA-specific requirements
  if (require2FA) {
    if (!canAccess2FA) {
      logger.debug('2FA access denied, redirecting to login');
      return <Navigate to="/login" replace />;
    }

    if (isLoggedIn) {
      const redirectPath = location.state?.from?.pathname || "/";
      logger.debug('User authenticated in 2FA route, redirecting', { to: redirectPath });
      return <Navigate to={redirectPath} replace />;
    }

    return <Outlet />;
  }

  // Handle full authentication requirements
  if (requireFullAuth && !isLoggedIn) {
    // Check if user should go to 2FA first
    if (shouldRedirectTo2FA) {
      logger.debug('Redirecting to 2FA flow');
      return <Navigate to="/two-factor" state={{ from: location }} replace />;
    }
    
    logger.debug('Authentication required, redirecting', { to: fallbackPath });
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default AuthRoute;