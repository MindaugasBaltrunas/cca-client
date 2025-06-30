import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Preloader from "../components/Preloader/preloader";
import { useAuth } from "../../context/AuthContext";
import { logger } from "../../shared/utils/logger";

// Route Components
import ProtectedRoute from "./ProtectedRoute";
import TwoFactorRoute from "./TwoFactorRoute";
import AuthRoute from "./AuthRoute";

// Lazy load pages for better performance
const LoginPage = React.lazy(() => import("../pages/loginPage/LoginPage"));
// const RegisterPage = React.lazy(() => import("../pages/auth/RegisterPage"));
// const TwoFactorPage = React.lazy(() => import("../pages/auth/TwoFactorPage"));
const DashboardPage = React.lazy(() => import("../pages/dashboard/dashboard"));
// const ProfilePage = React.lazy(() => import("../pages/profile/ProfilePage"));
// const SettingsPage = React.lazy(() => import("../pages/settings/SettingsPage"));
// const NotFoundPage = React.lazy(() => import("../pages/error/NotFoundPage"));

/**
 * Main routing configuration
 * Handles all application routes with appropriate authentication guards
 */
export const Routing: React.FC = () => {
  const { isLoading } = useAuth();

  // Show loading screen while authentication state is being determined
  if (isLoading) {
    return <Preloader isLoading={true} />;
  }

  return (
    <Suspense fallback={<Preloader isLoading={true} />}>
      <Routes>
        {/* Public Routes - No authentication required */}
        <Route 
          path="/login" 
          element={
            <AuthRoute 
              allowPublic={true} 
              redirectIfAuthenticated="/dashboard"
            />
          }
        >
          <Route index element={<LoginPage />} />
        </Route>

        {/* <Route 
          path="/register" 
          element={
            <AuthRoute 
              allowPublic={true} 
              redirectIfAuthenticated="/dashboard"
            />
          }
        >
          <Route index element={<RegisterPage />} />
        </Route> */}

        {/* 2FA Routes - Special authentication state required */}
        {/* <Route path="/two-factor" element={<TwoFactorRoute />}>
          <Route index element={<TwoFactorPage />} />
        </Route> */}

        {/* Protected Routes - Full authentication required */}
        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route index element={<DashboardPage />} />
        </Route>

        {/* <Route path="/profile" element={<ProtectedRoute />}>
          <Route index element={<ProfilePage />} />
        </Route>

        <Route path="/settings" element={<ProtectedRoute />}>
          <Route index element={<SettingsPage />} />
        </Route> */}

        {/* Admin Routes - Example of custom auth requirements */}
        <Route 
          path="/admin" 
          element={
            <AuthRoute 
              requireFullAuth={true} 
              fallbackPath="/login"
            />
          }
        >
          <Route index element={<div>Admin Dashboard</div>} />
        </Route>

        {/* Default Routes */}
        <Route 
          path="/" 
          element={<Navigate to="/dashboard" replace />} 
        />

        {/* 404 Route */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </Suspense>
  );
};

export default Routing;
