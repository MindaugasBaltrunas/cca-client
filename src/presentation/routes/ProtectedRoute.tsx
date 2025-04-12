// ProtectedRoute.tsx su patobulinta logika
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoginForm from '../pages/loginPage/LoginPage';

interface Props {}

export const ProtectedRoute: React.FC<Props> = () => {
  // Gauname autentifikacijos informaciją
  const { isAuthenticated } = useAuth();
  
  // Paprastas renderinimas be būsenos atnaujinimo
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <Outlet />;
};

export default ProtectedRoute;