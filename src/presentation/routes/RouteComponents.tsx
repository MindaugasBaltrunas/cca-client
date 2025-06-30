import React from 'react';
import AuthRoute, { type AuthRouteProps } from './AuthRoute';

/**
 * Pre-configured route components for common use cases
 */

/**
 * Admin route with custom login fallback
 */
export const AdminRoute: React.FC = () => (
  <AuthRoute 
    requireFullAuth={true} 
    fallbackPath="/admin-login" 
  />
);

/**
 * Public route that redirects authenticated users
 */
export const PublicOnlyRoute: React.FC = () => (
  <AuthRoute 
    allowPublic={true} 
    redirectIfAuthenticated="/dashboard" 
  />
);

/**
 * 2FA-only route for two-factor authentication flow
 */
export const TwoFactorOnlyRoute: React.FC = () => (
  <AuthRoute 
    require2FA={true} 
    requireFullAuth={false} 
  />
);

/**
 * Manager route with custom configuration
 */
export const ManagerRoute: React.FC = () => (
  <AuthRoute 
    requireFullAuth={true} 
    fallbackPath="/login" 
  />
);

/**
 * Guest route for unauthenticated users
 */
export const GuestRoute: React.FC = () => (
  <AuthRoute 
    allowPublic={true} 
    redirectIfAuthenticated="/dashboard" 
  />
);

/**
 * Custom route creator with props
 */
interface CustomRouteProps extends AuthRouteProps {
  children?: React.ReactNode;
}

export const CustomRoute: React.FC<CustomRouteProps> = ({ 
  children, 
  ...authProps 
}) => (
  <AuthRoute {...authProps}>
    {children}
  </AuthRoute>
);