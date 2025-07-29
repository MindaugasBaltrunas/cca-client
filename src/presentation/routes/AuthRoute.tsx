import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import Preloader from "../components/Preloader/preloader";
import { useTokenData } from "../../core/auth/hooks";
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
  const { isLoading, data: tokenData } = useTokenData();

  logger.debug("Token data:", tokenData);

  const hasToken = !!tokenData?.hasAccessToken;
  const has2FAEnabled = tokenData?.enable === true;
  const needsSetup = hasToken && tokenData?.enable === false;
  const authState = getAuthState(hasToken, has2FAEnabled, needsSetup);

  if (isLoading) return <Preloader isLoading />;

  if (allowPublic) {
    if (authState === "NEEDS_SETUP")
      return <Navigate to="/2fa-setup" replace />;
    if (authState === "PENDING_VERIFICATION")
      return (
        <Navigate
          to={determineTargetPath(authState, tokenData?.enable)}
          replace
        />
      );
    if (authState === "FULL_AUTH" && redirectIfAuthenticated)
      return <Navigate to={redirectIfAuthenticated} replace />;
    return <Outlet />;
  }

  if (authState === "NO_AUTH")
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;

  if (require2FA) {
    if (authState === "FULL_AUTH") return <Navigate to="/dashboard" replace />;
    if (authState === "NEEDS_SETUP" || authState === "PENDING_VERIFICATION") {
      const targetPath = determineTargetPath(authState, tokenData?.enable);
      if (location.pathname !== targetPath)
        return <Navigate to={targetPath} replace />;
    }
    return <Outlet />;
  }

  if (requireFullAuth) {
    if (authState === "NEEDS_SETUP")
      return <Navigate to="/2fa-setup" replace />;
    if (authState === "PENDING_VERIFICATION")
      return (
        <Navigate
          to={determineTargetPath(authState, tokenData?.enable)}
          replace
        />
      );
    if (authState !== "FULL_AUTH")
      return <Navigate to={fallbackPath} state={{ from: location }} replace />;
    return <Outlet />;
  }

  return <Outlet />;
};

type AuthState =
  | "NO_AUTH"
  | "NEEDS_SETUP"
  | "PENDING_VERIFICATION"
  | "FULL_AUTH";

function getAuthState(
  hasToken: boolean,
  has2FAEnabled: boolean,
  needsSetup: boolean
): AuthState {
  if (!hasToken) return "NO_AUTH";
  if (has2FAEnabled) return "PENDING_VERIFICATION";
  if (hasToken && needsSetup) return "NEEDS_SETUP";
  if (hasToken && has2FAEnabled) return "FULL_AUTH";
  return "NO_AUTH";
}

function determineTargetPath(authState: AuthState, enabled?: boolean): string {
  switch (authState) {
    case "NEEDS_SETUP":
      return "/2fa-setup";
    case "PENDING_VERIFICATION":
      return enabled === true ? "/verify-2fa" : "/2fa-setup";
    default:
      return "/2fa-setup";
  }
}

export function validateAuthRouteProps(props: AuthRouteProps): string[] {
  const errors: string[] = [];
  if (props.allowPublic && (props.requireFullAuth || props.require2FA)) {
    errors.push("Route cannot be both public and require authentication");
  }
  if (props.requireFullAuth && props.require2FA) {
    errors.push("Route cannot require both full auth and specific 2FA access");
  }
  return errors;
}
