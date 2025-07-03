import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import Preloader from "../components/Preloader/preloader";
import { useRouteAuth } from "../../core/authHooks/useRouteAuth";
import { logger } from "../../shared/utils/logger";

/**
 * Protected Route for fully authenticated users
 * Requires complete authentication (token + userId)
 */
export const ProtectedRoute: React.FC = () => {
  const { isReady, isLoggedIn } = useRouteAuth();
  const location = useLocation();

  if (!isReady) {
    return <Preloader isLoading={true} />;
  }

  if (!isLoggedIn) {
    logger.debug('User not authenticated, redirecting to login', { 
      from: location.pathname 
    });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;