import React from 'react';

// Main route components - default exports
// export { default as ProtectedRoute } from './ProtectedRoute';
// export { default as TwoFactorRoute } from './TwoFactorRoute'; 
// export { default as AuthRoute } from './AuthRoute';
// export { default as Routing } from './Routing';

// Named exports for direct access
export { ProtectedRoute } from './ProtectedRoute';
export { TwoFactorRoute } from './TwoFactorRoute';
export { AuthRoute } from './AuthRoute';
export { Routing } from './Routing';

// Export types
export type { AuthRouteProps } from './AuthRoute';

// Specialized route configurations as functions that return JSX
export const createAdminRoute = () => React.createElement(
  React.lazy(() => import('./AuthRoute')),
  {
    requireFullAuth: true,
    fallbackPath: "/admin-login"
  }
);

export const createPublicOnlyRoute = () => React.createElement(
  React.lazy(() => import('./AuthRoute')),
  {
    allowPublic: true,
    redirectIfAuthenticated: "/dashboard"
  }
);

export const createTwoFactorOnlyRoute = () => React.createElement(
  React.lazy(() => import('./AuthRoute')),
  {
    require2FA: true,
    requireFullAuth: false
  }
);

// Route configuration presets
export const routeConfigs = {
  // Standard configurations
  protected: {
    requireFullAuth: true,
    fallbackPath: "/login"
  } as const,
  
  public: {
    allowPublic: true,
    redirectIfAuthenticated: "/dashboard"
  } as const,
  
  twoFactor: {
    require2FA: true,
    requireFullAuth: false
  } as const,
  
  // Custom configurations
  admin: {
    requireFullAuth: true,
    fallbackPath: "/admin-login"
  } as const,
  
  guest: {
    allowPublic: true,
    redirectIfAuthenticated: "/dashboard"
  } as const
} as const;

/**
 * Route configuration helper
 * @param config - Route configuration object
 * @returns Function that creates AuthRoute component with specified config
 */
export const createRoute = (config: typeof routeConfigs.protected) => {
  return () => React.createElement(
    React.lazy(() => import('./AuthRoute')),
    config
  );
};