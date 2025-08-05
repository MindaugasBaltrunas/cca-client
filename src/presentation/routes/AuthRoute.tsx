import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import Preloader from "../components/Preloader/preloader";
import { useAuthState } from "../../core/auth/hooks/useAuthState";
import { logger } from "../../shared/utils/logger";

export interface AuthRouteProps {
  fallbackPath?: string;
  requireFullAuth?: boolean;
  require2FA?: boolean;
  allowPublic?: boolean;
  redirectIfAuthenticated?: string;
}

export const AuthRoute: React.FC<AuthRouteProps> = ({
  fallbackPath = "/login",
  requireFullAuth = false,
  require2FA = false,
  allowPublic = false,
  redirectIfAuthenticated,
}) => {
  const location = useLocation();
  const { isAuthenticated, tokenLoading, authState } = useAuthState();

  logger.debug("authState", authState)

  if (tokenLoading) {
    return <Preloader isLoading />;
  }

  // 🔓 Public Routes: Allows access without authentication or redirects if authenticated
  if (allowPublic) {
    if (isAuthenticated && redirectIfAuthenticated) {
      return <Navigate to={redirectIfAuthenticated} replace />;
    }
    return <Outlet />;
  }

  // 🚫 No Authentication: Redirects to fallbackPath if not authenticated and not a public route
  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // 🔐 Routes requiring 2FA setup/verification
  if (require2FA) {
    if (authState === "FULL_AUTH") {
      // If 2FA is required and user has full auth, but tries to access 2FA setup/verify page, redirect to dashboard.
      // This prevents authenticated users from re-accessing setup/verification pages unnecessarily.
      if (
        location.pathname === "/2fa-setup" ||
        location.pathname === "/verify-2fa"
      ) {
        return <Navigate to="/" replace />;
      }
      return <Outlet />;
    }
    // Redirect to 2FA setup or verification if required and not in FULL_AUTH state
    return enforce2FARedirect(authState, location);
  }

  // ✅ Routes requiring FULL authentication (2FA verified)
  if (requireFullAuth) {
    if (authState !== "FULL_AUTH") {
      return enforce2FARedirect(authState, location);
    }
  }

  // 🟢 Default: Authenticated but non-critical routes (basic or full auth)
  return <Outlet />;
};

// 🔧 Helper: Handle redirects for setup/verification
function enforce2FARedirect(authState: string, location: any) {
  if (authState === "NEEDS_SETUP" && location.pathname !== "/2fa-setup") {
    return <Navigate to="/2fa-setup" state={{ from: location }} replace />;
  }

  if (
    authState === "PENDING_VERIFICATION" &&
    location.pathname !== "/verify-2fa"
  ) {
    return <Navigate to="/verify-2fa" state={{ from: location }} replace />;
  }

  // If already on the correct 2FA page or no specific 2FA action needed for the current state, allow Outlet.
  // This handles cases like BASIC_AUTH where full auth might be required, but not necessarily 2FA setup/verification itself.
  return <Outlet />;
}