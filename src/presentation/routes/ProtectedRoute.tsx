import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getId } from '../../infrastructure/services/tokenStorage';
import Preloader from '../components/Preloader/preloader'; 
import useTokenCheck from '../../core/hooks/useTokenCheck';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const hasValidToken = useTokenCheck();

  // Show loading while checking auth state or token
  if (isLoading || hasValidToken === null) {
    return <Preloader isLoading={true} />;
  }

  // Check both auth hook and direct token check (for immediate post-2FA access)
  if (!isAuthenticated && !hasValidToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

// For 2FA verification route - accessible if user has ID but not full auth
export const TwoFactorRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const hasValidToken = useTokenCheck();
  
  // Show loading while checking auth state or token
  if (isLoading || hasValidToken === null) {
    return <Preloader isLoading={true} />;
  }

  // Check if we have userId indicating 2FA flow
  const hasUserId = getId() || location.state?.userId;

  // No user ID at all - redirect to login
  if (!hasUserId) {
    return <Navigate to="/login" replace />;
  }

  // Already fully authenticated - redirect to intended destination
  if (isAuthenticated || hasValidToken) {
    return <Navigate to={location.state?.from?.pathname || "/"} replace />;
  }

  // Has user ID but not authenticated - perfect for 2FA verification
  return <Outlet />;
};

// For routes accessible to authenticated users
export const AuthenticatedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const hasValidToken = useTokenCheck();

  // Show loading while checking auth state or token
  if (isLoading || hasValidToken === null) {
    return <Preloader isLoading={true} />;
  }

  // Check both auth hook and direct token check
  if (!isAuthenticated && !hasValidToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;