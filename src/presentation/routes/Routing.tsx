import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Preloader from "../components/Preloader/preloader";
import { useAuth } from "../../context/AuthContext";

import ProtectedRoute from "./ProtectedRoute";
import TwoFactorRoute from "./TwoFactorRoute";
import TwoFactorAuthSetup from "../components/Auth/TwoFactorAuthSetup/TwoFactorAuthSetup";

// Lazy-loaded pages
const LoginPage = React.lazy(() => import("../pages/loginPage/LoginPage"));
const TwoFactorSetupPage = React.lazy(() => import("../components/Auth/TwoFactorAuthSetup/TwoFactorAuthSetup"));
const TwoFactorVerifyPage = React.lazy(() => import("../components/Auth/TwoFactorVerifyForm/TwoFactorVerifyForm"));
const DashboardPage = React.lazy(() => import("../pages/dashboard/dashboard"));

const Routing: React.FC = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <Preloader isLoading />;
  }

  return (
    <Suspense fallback={<Preloader isLoading />}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route element={<TwoFactorRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/2fa-setup" element={<TwoFactorSetupPage />} />
          <Route path="/verify-2fa" element={<TwoFactorVerifyPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default Routing;
