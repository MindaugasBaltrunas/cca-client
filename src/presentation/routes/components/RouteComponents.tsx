import React from "react";
import { AuthRoute } from "./AuthRoute";
import { ALLOWED_ROUTES, ROUTE_CATEGORIES } from "../constants/constants";
import { AuthRouteProps } from "../types";

const routeConfigs: Record<string, AuthRouteProps> = {
  public: {
    allowPublic: true,
    redirectIfAuthenticated: ALLOWED_ROUTES.DASHBOARD,
    allowedRoutes: ROUTE_CATEGORIES.PUBLIC,
  },
  
  twoFactor: {
    require2FA: true,
    fallbackPath: ALLOWED_ROUTES.LOGIN,
    allowedRoutes: ROUTE_CATEGORIES.TWO_FA,
  },
  
  protected: {
    requireFullAuth: true,
    fallbackPath: ALLOWED_ROUTES.LOGIN,
    allowedRoutes: ROUTE_CATEGORIES.PROTECTED,
  },
} as const;

export const PublicRoute: React.FC = () => (
  <AuthRoute {...routeConfigs.public} />
);

export const TwoFactorRoute: React.FC = () => (
  <AuthRoute {...routeConfigs.twoFactor} />
);

export const ProtectedRoute: React.FC = () => (
  <AuthRoute {...routeConfigs.protected} />
);