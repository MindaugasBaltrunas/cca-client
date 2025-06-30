import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import Preloader from "../components/Preloader/preloader";
import { useRouteAuth } from "../../core/hooks/useRouteAuth";
import { logger } from "../../shared/utils/logger";

/**
 * 2FA-specific route: user must have ID but not full auth
 * Intermediate state between login and full authentication
 */
export const TwoFactorRoute: React.FC = () => {
  const { isReady, isLoggedIn, canAccess2FA } = useRouteAuth();
  const location = useLocation();
  
  // Check for userId from location state as fallback
  const hasUserIdFromState = !!location.state?.userId;

  if (!isReady) {
    return <Preloader isLoading={true} />;
  }

  // No userId available anywhere
  if (!canAccess2FA && !hasUserIdFromState) {
    logger.debug('No userId available, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // User is fully authenticated, redirect to main app
  if (isLoggedIn) {
    const redirectPath = location.state?.from?.pathname || "/";
    logger.debug('User fully authenticated, redirecting', { to: redirectPath });
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default TwoFactorRoute;