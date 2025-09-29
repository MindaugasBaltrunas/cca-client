import React from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import Preloader from "../../components/Preloader/preloader";
import { useAuthState } from "../../../core/auth/hooks/useAuthState";
import { ALLOWED_ROUTES } from "../constants/constants";
import { AuthRouteProps } from "../types";
import { logger } from "../../../shared/utils/logger";

export const AuthRoute: React.FC<AuthRouteProps> = ({
  allowPublic = false,
  require2FA = false,
  requireFullAuth = false,
  redirectIfAuthenticated,
  fallbackPath = ALLOWED_ROUTES.LOGIN,
  allowedRoutes = [],
}) => {
  const location = useLocation();
  const { isAuthenticated, tokenLoading, authState, has2FAEnabled } = useAuthState();
  
  if (tokenLoading) {
    return <Preloader isLoading />;
  }

  // Check if current route is in allowed routes
  const isRouteAllowed = allowedRoutes.length === 0 ||
    allowedRoutes.some(route => {
      if (route.includes(':')) {
        const routePattern = route.replace(/:[^/]+/g, '[^/]+');
        const regex = new RegExp(`^${routePattern}$`);
        return regex.test(location.pathname);
      }
      return route === location.pathname;
    });

  if (!isRouteAllowed) {
    logger.info("Route not allowed, redirecting", { 
      currentPath: location.pathname, 
      allowedRoutes, 
      fallbackPath 
    });
    return <Navigate to={fallbackPath} replace />;
  }

  // ✅ CRITICAL FIX: Handle auth state redirects BEFORE route-specific logic
  // This ensures users in intermediate auth states get redirected properly
  
  // Handle global auth state redirects (applies to all route types)
  if (authState === "PENDING_VERIFICATION" && location.pathname !== ALLOWED_ROUTES.VERIFY_2FA) {
    logger.info("User has pending verification, redirecting to 2FA verify");
    return <Navigate to={ALLOWED_ROUTES.VERIFY_2FA} replace />;
  }

  if (authState === "NEEDS_SETUP" && location.pathname !== ALLOWED_ROUTES.TWO_FA_SETUP) {
    logger.info("User needs 2FA setup, redirecting to 2FA setup");
    return <Navigate to={ALLOWED_ROUTES.TWO_FA_SETUP} replace />;
  }

  if (authState === "BASIC_AUTH" && 
      ![ALLOWED_ROUTES.TWO_FA_SETUP, ALLOWED_ROUTES.VERIFY_2FA].includes(location.pathname as any)) {
    const redirectTo = has2FAEnabled 
      ? ALLOWED_ROUTES.VERIFY_2FA 
      : ALLOWED_ROUTES.TWO_FA_SETUP;
    logger.info("User has basic auth, redirecting to 2FA", { redirectTo });
    return <Navigate to={redirectTo} replace />;
  }

  // Now handle route-specific logic

  // Public routes logic
  if (allowPublic) {
    // Handle fully authenticated users on login/signup pages
    if (authState === "FULL_AUTH" && redirectIfAuthenticated) {
      const shouldRedirect = [ALLOWED_ROUTES.LOGIN, ALLOWED_ROUTES.SIGNUP]
        .includes(location.pathname as any);
      
      if (shouldRedirect) {
        logger.info("Fully authenticated user on login/signup, redirecting", { 
          to: redirectIfAuthenticated 
        });
        return <Navigate to={redirectIfAuthenticated} replace />;
      }
    }
    
    logger.info("Allowing access to public route");
    return <Outlet />;
  }

  // 2FA routes logic
  if (require2FA) {
    const valid2FAStates = ["PENDING_VERIFICATION", "NEEDS_SETUP", "BASIC_AUTH"];
    
    if (authState === "FULL_AUTH") {
      logger.info("Fully authenticated user on 2FA route, redirecting to dashboard");
      return <Navigate to={ALLOWED_ROUTES.DASHBOARD} replace />;
    }
    
    if (authState === "NO_AUTH") {
      logger.info("Unauthenticated user on 2FA route, redirecting to login");
      return <Navigate to={ALLOWED_ROUTES.LOGIN} replace />;
    }
    
    if (!valid2FAStates.includes(authState)) {
      logger.info("Invalid auth state for 2FA route", { authState });
      return <Navigate to={ALLOWED_ROUTES.LOGIN} replace />;
    }
    
    logger.info("Allowing access to 2FA route");
    return <Outlet />;
  }

  // Protected routes logic
  if (requireFullAuth) {
    if (authState !== "FULL_AUTH") {
      logger.info("Protected route requires full auth, redirecting based on state", { authState });
      
      switch (authState) {
        case "NO_AUTH":
          return <Navigate to={ALLOWED_ROUTES.LOGIN} replace />;
        case "BASIC_AUTH":
          const redirectTo = has2FAEnabled 
            ? ALLOWED_ROUTES.VERIFY_2FA 
            : ALLOWED_ROUTES.TWO_FA_SETUP;
          return <Navigate to={redirectTo} replace />;
        case "PENDING_VERIFICATION":
          return <Navigate to={ALLOWED_ROUTES.VERIFY_2FA} replace />;
        case "NEEDS_SETUP":
          return <Navigate to={ALLOWED_ROUTES.TWO_FA_SETUP} replace />;
        default:
          return <Navigate to={ALLOWED_ROUTES.LOGIN} replace />;
      }
    }
    
    logger.info("Allowing access to protected route");
    return <Outlet />;
  }

  logger.info("Default outlet access");
  return <Outlet />;
};
