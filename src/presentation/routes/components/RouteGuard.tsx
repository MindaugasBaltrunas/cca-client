import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isRouteAllowedInConfig } from "../utils/routeValidator";
import { ALLOWED_ROUTES } from "../constants/constants";
import { AuthRouteProps, RouteCategory } from "../types";

interface RouteGuardProps extends Pick<AuthRouteProps, "fallbackPath"> {
  children: React.ReactNode;
  allowedRoutes?: readonly RouteCategory[] | RouteCategory[];
}

export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  allowedRoutes,
  fallbackPath = ALLOWED_ROUTES.LOGIN,
}) => {
  const location = useLocation();

  if (!isRouteAllowedInConfig(location.pathname, allowedRoutes)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};