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

  // No userId available anywhere
  if (!canAccess2FA && !id) {
    logger.debug("No userId available, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // User is fully authenticated, redirect to main app
  if (isLoggedIn && status === "success") {
    const redirectPath = location.state?.from?.pathname || "/2fa-setup";
    logger.debug("User fully authenticated, redirecting", { to: redirectPath });
    return <Navigate to={redirectPath} replace />;
  } else if (isLoggedIn && status === "pending") {
    const redirectPath = location.state?.from?.pathname || "/verify-2fa";
    logger.debug("User is in 2FA flow but not fully authenticated", {
      to: redirectPath,
    });
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default TwoFactorRoute;
