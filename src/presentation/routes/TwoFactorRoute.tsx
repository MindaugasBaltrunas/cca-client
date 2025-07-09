import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import Preloader from "../components/Preloader/preloader";
import { useRouteAuth } from "../../core/authHooks/useRouteAuth";
import { logger } from "../../shared/utils/logger";

export const TwoFactorRoute: React.FC = () => {
  const { isReady, hasUserId, enabled } = useRouteAuth();
  const location = useLocation();

    logger.debug("TwoFactorRoute render:", {
    isReady,
    hasUserId,
    enabled,
    currentPath: location.pathname
  });

  if (!isReady) {
    return <Preloader isLoading={true} />;
  }

  if (!hasUserId) {
    logger.debug("No userId available, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  const targetPath = enabled ? "/verify-2fa" : "/2fa-setup";
  
  if (location.pathname !== targetPath) {
    return <Navigate to={targetPath} replace />;
  }

  return <Outlet />;
};

export default TwoFactorRoute;