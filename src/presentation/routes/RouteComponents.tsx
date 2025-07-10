import React from "react";
import { AuthRoute } from "./AuthRoute";

// 🎯 Optimized route configurations
const routeConfigs = {
  // Full authentication required (token + 2FA)
  protected: { 
    requireFullAuth: true, 
    fallbackPath: "/login" 
  },
  
  // Public access allowed
  public: { 
    allowPublic: true, 
    redirectIfAuthenticated: "/dashboard" 
  },
  
  // 2FA-specific pages only
  twoFactor: { 
    require2FA: true 
  },
  
  // Admin routes (if needed)
  admin: { 
    requireFullAuth: true, 
    fallbackPath: "/admin-login" 
  },
  
  // Guest routes
  guest: { 
    allowPublic: true, 
    redirectIfAuthenticated: "/dashboard" 
  },
} as const;

// 🚀 Typed route components
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