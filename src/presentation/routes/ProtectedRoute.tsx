import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { tokenService } from '../../infrastructure/services/tokenService';
import AccessDenied from '../pages/accessDenied/AccessDenied';
import LoginForm from '../pages/loginPage/LoginPage';

interface Props {}

export const ProtectedRoute: React.FC<Props> = () => {
  // Get authentication state from Redux store
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  
  // Check if token is valid
  const isTokenValid = !tokenService.isTokenExpired();
  const isLoggedIn = isAuthenticated && isTokenValid;

  // If not logged in, show access denied page
  if (!isLoggedIn) {
    return <LoginForm />;
  }

  // If logged in, render the child routes
  if (isLoggedIn) {
    return <Outlet />;
  }

  // Fallback redirect to home page
  return <Navigate to="/" replace />;
};

export default ProtectedRoute;