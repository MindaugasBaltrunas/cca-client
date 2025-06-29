import { JSX, Suspense } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Preloader from "../components/Preloader/preloader";
import Layout from "../components/Layout/Layout";
import Dashboard from "../pages/dashboard/dashboard";
import LoginForm from "../pages/loginPage/LoginPage";
import TwoFactorAuthSetup from "../components/Auth/TwoFactorAuthSetup/TwoFactorAuthSetup";
import TwoFactorVerifyForm from "../components/Auth/TwoFactorVerifyForm/TwoFactorVerifyForm";
import ProtectedRoute from "./ProtectedRoute";
import { TwoFactorRoute } from "./ProtectedRoute";

const Routing = (): JSX.Element => {
  return (
    <Suspense fallback={<Preloader isLoading={true} />}>
      <Routes>

        <Route path="/login" element={<LoginForm />} />

        {/* 2FA Verification Route */}
        <Route element={<TwoFactorRoute />}>
          <Route
            path="/verify-2fa"
            element={
              <Layout>
                <TwoFactorVerifyForm />
              </Layout>
            }
          />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout><Outlet /></Layout>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/2fa-setup" element={<TwoFactorAuthSetup />} />
          </Route>
        </Route>

        {/* Catch-all for unknown paths */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
};

export default Routing;
