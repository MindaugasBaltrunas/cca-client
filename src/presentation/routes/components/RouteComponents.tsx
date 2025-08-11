import React from "react";
import { AuthRoute } from "./AuthRoute";
import { ALLOWED_ROUTES } from "../constants/constants";
import { AuthRouteProps } from "../../../core/auth/types/auth.context.types";

const routeConfigs: Record<string, AuthRouteProps> = {
  // Allow login/signup when not authenticated
  public: {
    allowPublic: true,
    redirectIfAuthenticated: ALLOWED_ROUTES.DASHBOARD,
    allowedRoutes: ["PUBLIC"],
  },
  
  // Allow 2FA setup/verify when authenticated but not fully authorized
  twoFactor: {
    require2FA: true,
    allowedRoutes: ["TWO_FA"],
  },
  
  // Allow all protected routes when fully authorized
  protected: {
    requireFullAuth: true,
    fallbackPath: ALLOWED_ROUTES.LOGIN,
    allowedRoutes: ["PROTECTED"],
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