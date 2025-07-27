import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Preloader from "../components/Preloader/preloader";
import { useAuth } from "../../core/auth/context/AuthContext";
import { ProtectedRoute, TwoFactorRoute, PublicOnlyRoute } from "./RouteComponents";
import { log } from "console";
import { logger } from "../../shared/utils/logger";

// 📦 Lazy loaded pages
const LoginPage = React.lazy(() => import("../pages/loginPage/LoginPage"));
const TwoFactorSetupPage = React.lazy(() => import("../components/Auth/TwoFactorAuthSetup/TwoFactorAuthSetup"));
const TwoFactorVerifyPage = React.lazy(() => import("../components/Auth/TwoFactorVerifyForm/TwoFactorVerifyForm"));
const DashboardPage = React.lazy(() => import("../pages/dashboard/dashboard"));

export const Routing: React.FC = () => {
  const { isLoading, tokenData } = useAuth();

  logger.debug("Routing initialized", { isLoading, tokenData });

  if (isLoading || tokenData === null) {
    return <Preloader isLoading />;
  }

  return (
    <Suspense fallback={<Preloader isLoading />}>
      <Routes>
        {/* 🏠 Root redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* 🌐 Public routes */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
        
        {/* 🔐 2FA routes */}
        <Route element={<TwoFactorRoute />}>
          <Route path="/2fa-setup" element={<TwoFactorSetupPage />} />
          <Route path="/verify-2fa" element={<TwoFactorVerifyPage />} />
        </Route>
        
        {/* 🛡️ Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          {/* Add more protected routes here */}
        </Route>
        
        {/* 🔄 Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};