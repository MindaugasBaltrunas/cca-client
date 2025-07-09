import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Preloader from "../components/Preloader/preloader";
import { useAuthStatus } from "../../core/authHooks";
import { ProtectedRoute, TwoFactorRoute, PublicOnlyRoute } from "./RouteComponents";

// Lazy loaded pages
const LoginPage = React.lazy(() => import("../pages/loginPage/LoginPage"));
const TwoFactorSetupPage = React.lazy(() =>
  import("../components/Auth/TwoFactorAuthSetup/TwoFactorAuthSetup")
);
const TwoFactorVerifyPage = React.lazy(() =>
  import("../components/Auth/TwoFactorVerifyForm/TwoFactorVerifyForm")
);
const DashboardPage = React.lazy(() => import("../pages/dashboard/dashboard"));

/**
 * Pagrindinis routing komponentas
 * Tvarko visus aplikacijos route'us su autentifikacija
 */
export const Routing: React.FC = () => {
  const { isReady } = useAuthStatus();

  // Rodome preloader kol tikrinama auth būsena
  if (!isReady) {
    return <Preloader isLoading />;
  }

  return (
    <Suspense fallback={<Preloader isLoading />}>
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Public routes - neprisijungusiems */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
        
        {/* 2FA routes - dviejų faktų autentifikacija */}
        <Route element={<TwoFactorRoute />}>
          <Route path="/2fa-setup" element={<TwoFactorSetupPage />} />
          <Route path="/verify-2fa" element={<TwoFactorVerifyPage />} />
        </Route>
        
        {/* Protected routes - tik autentifikuotiems */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
        
        {/* Catch all redirect - visi nežinomi route'ai */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};