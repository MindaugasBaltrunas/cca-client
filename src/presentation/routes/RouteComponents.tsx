import React from "react";
import { AuthRoute } from "./AuthRoute";

// Route konfigūracijos
export const routeConfigs = {
  protected: {
    requireFullAuth: true,
    fallbackPath: "/login"
  },
  public: {
    allowPublic: true,
    redirectIfAuthenticated: "/dashboard"  
  },
  twoFactor: {
    require2FA: true,
    requireFullAuth: false
  },
  admin: {
    requireFullAuth: true,
    fallbackPath: "/admin-login"
  },
  guest: {
    allowPublic: true,
    redirectIfAuthenticated: "/dashboard"
  }
} as const;

/**
 * Route komponentai naudojantys routeConfigs
 */
export const ProtectedRoute: React.FC = () => (
  <AuthRoute {...routeConfigs.protected} />
);

export const PublicOnlyRoute: React.FC = () => (
  <AuthRoute {...routeConfigs.public} />
);

export const TwoFactorRoute: React.FC = () => (
  <AuthRoute {...routeConfigs.twoFactor} />
);

export const AdminRoute: React.FC = () => (
  <AuthRoute {...routeConfigs.admin} />
);

export const GuestRoute: React.FC = () => (
  <AuthRoute {...routeConfigs.guest} />
);