import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import Preloader from "../components/Preloader/preloader";
import { useRouteAuth } from "../../core/authHooks/useRouteAuth";
import { logger } from "../../shared/utils/logger";
import { getId } from "../../infrastructure/services/tokenStorage";

/**
 * 2FA-specific route: user must have ID but not full auth
 * Intermediate state between login and full authentication
 */
export const TwoFactorRoute: React.FC = () => {
  const { isReady, isLoggedIn, canAccess2FA, status } = useRouteAuth();
  const location = useLocation();

  // Check for userId from location state as fallback
  const id = getId();

  if (!isReady) {
    return <Preloader isLoading={true} />;
  }

  // No userId available anywhere - redirect to login
  if (!canAccess2FA && !id) {
    logger.debug("No userId available, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // User is fully authenticated - redirect to 2FA setup if not already there
  if (isLoggedIn && status === "success" && location.pathname !== "/2fa-setup") {
    return <Navigate to="/2fa-setup" replace />;
  }

  // User is logged in but needs 2FA verification
  if (isLoggedIn && status === "pending" && location.pathname !== "/verify-2fa") {
    return <Navigate to="/verify-2fa" replace />;
  }

  // User needs to set up 2FA (partially authenticated)
  // This covers cases where user has basic auth but needs 2FA setup
  if (canAccess2FA && !isLoggedIn && location.pathname !== "/2fa-setup") {
    return <Navigate to="/2fa-setup" replace />;
  }

  // Allow access to the current route
  return <Outlet />;
};

export default TwoFactorRoute;