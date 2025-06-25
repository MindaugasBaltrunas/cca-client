import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getId } from "../../infrastructure/services/tokenStorage";
import Preloader from "../components/Preloader/preloader";
import useTokenCheck from "../../core/hooks/useTokenCheck";

// Shared auth-check hook
const useAuthStatus = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const tokenValid = useTokenCheck();
  const isReady = !isLoading && tokenValid !== null;
  const isLoggedIn = isAuthenticated || tokenValid;

  return { isReady, isLoggedIn, tokenValid };
};

// Protected Route for fully authenticated users
export const ProtectedRoute: React.FC = () => {
  const { isReady, isLoggedIn } = useAuthStatus();
  const location = useLocation();

  if (!isReady) return <Preloader isLoading={true} />;

  return isLoggedIn ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

// 2FA-specific route: user must have ID but not full auth
export const TwoFactorRoute: React.FC = () => {
  const { isReady, isLoggedIn } = useAuthStatus();
  const location = useLocation();
  const hasUserId = getId() || location.state?.userId;

  if (!isReady) return <Preloader isLoading={true} />;

  if (!hasUserId) return <Navigate to="/login" replace />;
  if (isLoggedIn) return <Navigate to={location.state?.from?.pathname || "/"} replace />;

  return <Outlet />;
};

export default ProtectedRoute;
